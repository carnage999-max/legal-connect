from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core import signing
from django.http import FileResponse, Http404
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

from .models import Document, DocumentSignature, DocumentAccessLog
from .serializers import (
    DocumentSerializer, DocumentUploadSerializer, DocumentVersionSerializer,
    DocumentSignatureSerializer, SignDocumentSerializer,
    RequestSignatureSerializer, DocumentAccessLogSerializer
)


class DocumentListView(generics.ListAPIView):
    """List documents for a matter."""

    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        matter_id = self.request.query_params.get('matter_id')
        user = self.request.user

        queryset = Document.objects.filter(
            Q(matter__client=user) | Q(matter__attorney__user=user)
        ).select_related('uploaded_by', 'matter')

        if matter_id:
            queryset = queryset.filter(matter_id=matter_id)

        return queryset.order_by('-created_at')


class DocumentUploadView(generics.CreateAPIView):
    """Upload a new document."""

    serializer_class = DocumentUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a document."""

    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Document.objects.filter(
            Q(matter__client=user) | Q(matter__attorney__user=user)
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Log access
        DocumentAccessLog.objects.create(
            document=instance,
            user=request.user,
            access_type=DocumentAccessLog.AccessType.VIEW,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


DOWNLOAD_SALT = 'document-download'
DOWNLOAD_LINK_MAX_AGE = 60 * 60  # one hour


class DocumentFileView(APIView):
    """Streams a private document to anyone holding a valid, unexpired signed link."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = []

    def get(self, request, pk):
        token = request.query_params.get('token', '')
        try:
            value = signing.TimestampSigner(salt=DOWNLOAD_SALT).unsign(token, max_age=DOWNLOAD_LINK_MAX_AGE)
        except signing.BadSignature:
            raise Http404
        if value.split(':')[0] != str(pk):
            raise Http404
        try:
            document = Document.objects.get(pk=pk)
            handle = document.file.open('rb')
        except (Document.DoesNotExist, FileNotFoundError, ValueError):
            raise Http404
        return FileResponse(
            handle,
            as_attachment=True,
            filename=document.original_filename or None,
            content_type=document.file_type or None,
        )


class DocumentDownloadView(APIView):
    """Generate download URL for a document."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        try:
            document = Document.objects.get(
                Q(matter__client=user) | Q(matter__attorney__user=user),
                pk=pk
            )
        except Document.DoesNotExist:
            return Response(
                {'detail': 'Document not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Log download
        DocumentAccessLog.objects.create(
            document=document,
            user=user,
            access_type=DocumentAccessLog.AccessType.DOWNLOAD,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # A short-lived signed link, like the presigned URLs used before. Files are
        # private, so nginx never serves them directly.
        token = signing.TimestampSigner(salt=DOWNLOAD_SALT).sign(f'{document.pk}:{user.pk}')
        link = reverse('documents:document-file', args=[document.pk])
        return Response({
            'download_url': request.build_absolute_uri(f'{link}?token={token}'),
            'filename': document.original_filename,
            'file_size': document.file_size,
            'file_type': document.file_type
        })


class DocumentVersionCreateView(generics.CreateAPIView):
    """Create a new version of a document."""

    serializer_class = DocumentVersionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        parent_id = self.kwargs.get('pk')
        context['parent_document'] = Document.objects.get(pk=parent_id)
        return context


class DocumentVersionsView(generics.ListAPIView):
    """List all versions of a document."""

    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        document_id = self.kwargs.get('pk')
        user = self.request.user

        # Get the root document
        try:
            document = Document.objects.get(pk=document_id)
        except Document.DoesNotExist:
            return Document.objects.none()

        # Find the root (version 1)
        root = document
        while root.parent_document:
            root = root.parent_document

        # Get all versions
        return Document.objects.filter(
            Q(pk=root.pk) | Q(parent_document=root) |
            Q(parent_document__parent_document=root)
        ).filter(
            Q(matter__client=user) | Q(matter__attorney__user=user)
        ).order_by('-version')


class RequestSignatureView(APIView):
    """Request signatures on a document."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            document = Document.objects.get(
                pk=pk,
                uploaded_by=request.user
            )
        except Document.DoesNotExist:
            return Response(
                {'detail': 'Document not found or you do not have permission.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RequestSignatureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        signer_ids = serializer.validated_data['signer_ids']
        expires_in_days = serializer.validated_data['expires_in_days']
        expires_at = timezone.now() + timedelta(days=expires_in_days)

        document.requires_signature = True
        document.save()

        signatures = []
        from django.contrib.auth import get_user_model
        User = get_user_model()

        for signer_id in signer_ids:
            signer = User.objects.get(id=signer_id)
            signature, created = DocumentSignature.objects.get_or_create(
                document=document,
                signer=signer,
                defaults={'expires_at': expires_at}
            )
            signatures.append(signature)

        return Response({
            'message': f'Signature requested from {len(signatures)} user(s).',
            'signatures': DocumentSignatureSerializer(signatures, many=True).data
        })


class PendingSignaturesView(generics.ListAPIView):
    """List pending signature requests for current user."""

    serializer_class = DocumentSignatureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DocumentSignature.objects.filter(
            signer=self.request.user,
            status=DocumentSignature.SignatureStatus.PENDING
        ).select_related('document')


class SignDocumentView(APIView):
    """Sign a document."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            signature = DocumentSignature.objects.get(
                pk=pk,
                signer=request.user,
                status=DocumentSignature.SignatureStatus.PENDING
            )
        except DocumentSignature.DoesNotExist:
            return Response(
                {'detail': 'Signature request not found or already completed.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SignDocumentSerializer(
            signature,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        signature = serializer.save()

        # Log signing
        DocumentAccessLog.objects.create(
            document=signature.document,
            user=request.user,
            access_type=DocumentAccessLog.AccessType.SIGN,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response(DocumentSignatureSerializer(signature).data)


class DocumentAccessLogsView(generics.ListAPIView):
    """List access logs for a document."""

    serializer_class = DocumentAccessLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        document_id = self.kwargs.get('pk')
        user = self.request.user

        return DocumentAccessLog.objects.filter(
            document_id=document_id,
            document__uploaded_by=user
        ).select_related('user').order_by('-accessed_at')
