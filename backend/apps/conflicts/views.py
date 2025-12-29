from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import AttorneyClientRecord, ConflictCheck
from .serializers import (
    AttorneyClientRecordSerializer, AttorneyClientRecordCreateSerializer,
    BulkClientImportSerializer, ConflictCheckSerializer,
    ConflictCheckRequestSerializer
)
from .services import ConflictCheckService
from apps.attorneys.views import IsAttorney, IsClient
from apps.attorneys.serializers import AttorneyProfileListSerializer


class AttorneyClientRecordListView(generics.ListAPIView):
    """List attorney's client records (hashed)."""

    serializer_class = AttorneyClientRecordSerializer
    permission_classes = [IsAttorney]

    def get_queryset(self):
        return AttorneyClientRecord.objects.filter(
            attorney__user=self.request.user
        ).order_by('-created_at')


class AttorneyClientRecordCreateView(APIView):
    """Add a client record for conflict checking."""

    permission_classes = [IsAttorney]

    def post(self, request):
        from apps.attorneys.models import AttorneyProfile

        serializer = AttorneyClientRecordCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        attorney = AttorneyProfile.objects.get(user=request.user)

        record, created = ConflictCheckService.add_client_record(
            attorney=attorney,
            name=serializer.validated_data['name'],
            relationship_type=serializer.validated_data['relationship_type']
        )

        return Response({
            'created': created,
            'record': AttorneyClientRecordSerializer(record).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class BulkClientImportView(APIView):
    """Bulk import client names for conflict checking."""

    permission_classes = [IsAttorney]

    def post(self, request):
        from apps.attorneys.models import AttorneyProfile

        serializer = BulkClientImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        attorney = AttorneyProfile.objects.get(user=request.user)

        records = ConflictCheckService.import_client_list(
            attorney=attorney,
            names=serializer.validated_data['names'],
            relationship_type=serializer.validated_data['relationship_type']
        )

        return Response({
            'imported_count': len(records),
            'message': f"Successfully imported {len(records)} client records."
        }, status=status.HTTP_201_CREATED)


class AttorneyClientRecordDeleteView(generics.DestroyAPIView):
    """Delete a client record."""

    permission_classes = [IsAttorney]

    def get_queryset(self):
        return AttorneyClientRecord.objects.filter(
            attorney__user=self.request.user
        )


class ConflictCheckRequestView(APIView):
    """Request a conflict check for a matter."""

    def get_permissions(self):
        # Allow unauthenticated POST for public intake
        if self.request.method == 'POST':
            return []
        # Default to client-only for other methods
        return [IsClient()]

    def post(self, request):
        from apps.matters.models import Matter

        serializer = ConflictCheckRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        matter = Matter.objects.get(pk=serializer.validated_data['matter_id'])

        # For authenticated users, verify they own the matter
        if request.user.is_authenticated and matter.client != request.user:
            return Response(
                {'detail': 'You do not have permission to request a conflict check for this matter.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Perform conflict check
        conflict_check = ConflictCheckService.perform_conflict_check(
            matter=matter,
            requested_by=request.user if request.user.is_authenticated else None
        )

        return Response(ConflictCheckSerializer(conflict_check).data)


class ConflictCheckResultView(generics.RetrieveAPIView):
    """Get conflict check results."""

    serializer_class = ConflictCheckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ConflictCheck.objects.filter(
            matter__client=user
        ).prefetch_related('details', 'excluded_attorneys', 'attorneys_checked')


class MatterAvailableAttorneysView(APIView):
    """Get available attorneys for a matter after conflict check.

    For public intake we allow unauthenticated access for anonymous matters (client is null).
    For matters with an owner we preserve the client-only access check.
    """

    permission_classes = []

    def get(self, request, matter_id):
        from apps.matters.models import Matter

        try:
            matter = Matter.objects.get(pk=matter_id)
        except Matter.DoesNotExist:
            return Response({'detail': 'Matter not found.'}, status=status.HTTP_404_NOT_FOUND)

        # If the matter is owned by a client, make sure the requester is that client
        if matter.client and (not request.user.is_authenticated or matter.client != request.user):
            return Response({'detail': 'Matter not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not matter.conflict_check_completed:
            return Response({'detail': 'Conflict check not completed for this matter.'}, status=status.HTTP_400_BAD_REQUEST)

        attorneys = ConflictCheckService.get_available_attorneys(matter)

        return Response({
            'count': attorneys.count(),
            'attorneys': AttorneyProfileListSerializer(attorneys, many=True).data
        })


class ConflictCheckHistoryView(generics.ListAPIView):
    """List conflict check history for a matter."""

    serializer_class = ConflictCheckSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        matter_id = self.kwargs['matter_id']
        user = self.request.user

        return ConflictCheck.objects.filter(
            matter_id=matter_id,
            matter__client=user
        ).order_by('-created_at')
