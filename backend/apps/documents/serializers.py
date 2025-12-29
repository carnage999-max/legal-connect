from rest_framework import serializers
from django.utils import timezone

from .models import Document, DocumentSignature, DocumentAccessLog


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for documents."""

    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    signatures_count = serializers.SerializerMethodField()
    pending_signatures = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'matter', 'title', 'description', 'document_type',
            'status', 'file', 'original_filename', 'file_size', 'file_type',
            'version', 'parent_document', 'requires_signature',
            'signature_completed', 'signed_at', 'is_confidential',
            'uploaded_by', 'uploaded_by_name',
            'signatures_count', 'pending_signatures',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uploaded_by', 'original_filename', 'file_size', 'file_type',
            'version', 'signature_completed', 'signed_at', 'created_at', 'updated_at'
        ]

    def get_signatures_count(self, obj):
        return obj.signatures.count()

    def get_pending_signatures(self, obj):
        return obj.signatures.filter(status='pending').count()


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading documents."""

    class Meta:
        model = Document
        fields = [
            'matter', 'file', 'title', 'description',
            'document_type', 'requires_signature', 'is_confidential'
        ]

    def create(self, validated_data):
        file = validated_data['file']
        validated_data['original_filename'] = file.name
        validated_data['file_size'] = file.size
        validated_data['file_type'] = file.content_type
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class DocumentVersionSerializer(serializers.ModelSerializer):
    """Serializer for creating a new version of a document."""

    class Meta:
        model = Document
        fields = ['file', 'title', 'description']

    def create(self, validated_data):
        parent = self.context['parent_document']
        file = validated_data['file']

        new_version = Document.objects.create(
            matter=parent.matter,
            file=file,
            original_filename=file.name,
            file_size=file.size,
            file_type=file.content_type,
            title=validated_data.get('title', parent.title),
            description=validated_data.get('description', parent.description),
            document_type=parent.document_type,
            version=parent.version + 1,
            parent_document=parent,
            requires_signature=parent.requires_signature,
            is_confidential=parent.is_confidential,
            uploaded_by=self.context['request'].user
        )
        return new_version


class DocumentSignatureSerializer(serializers.ModelSerializer):
    """Serializer for document signatures."""

    signer_name = serializers.CharField(source='signer.full_name', read_only=True)

    class Meta:
        model = DocumentSignature
        fields = [
            'id', 'document', 'signer', 'signer_name', 'status',
            'requested_at', 'signed_at', 'expires_at'
        ]
        read_only_fields = ['id', 'signer', 'requested_at', 'signed_at']


class SignDocumentSerializer(serializers.Serializer):
    """Serializer for signing a document."""

    signature_data = serializers.CharField(required=True)

    def validate(self, data):
        signature = self.instance
        if signature.status != DocumentSignature.SignatureStatus.PENDING:
            raise serializers.ValidationError(
                "This signature request is no longer pending."
            )
        if signature.expires_at and signature.expires_at < timezone.now():
            signature.status = DocumentSignature.SignatureStatus.EXPIRED
            signature.save()
            raise serializers.ValidationError(
                "This signature request has expired."
            )
        return data

    def update(self, instance, validated_data):
        import hashlib
        request = self.context['request']

        # Create signature hash
        signature_hash = hashlib.sha256(
            f"{instance.id}{instance.signer.id}{timezone.now()}".encode()
        ).hexdigest()

        instance.signature_data = validated_data['signature_data']
        instance.status = DocumentSignature.SignatureStatus.SIGNED
        instance.signed_at = timezone.now()
        instance.ip_address = request.META.get('REMOTE_ADDR')
        instance.user_agent = request.META.get('HTTP_USER_AGENT', '')
        instance.signature_hash = signature_hash
        instance.save()

        # Check if all signatures are complete
        document = instance.document
        pending_count = document.signatures.filter(
            status=DocumentSignature.SignatureStatus.PENDING
        ).count()

        if pending_count == 0:
            document.signature_completed = True
            document.signed_at = timezone.now()
            document.status = Document.DocumentStatus.SIGNED
            document.save()

        return instance


class RequestSignatureSerializer(serializers.Serializer):
    """Serializer for requesting signatures."""

    signer_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1
    )
    expires_in_days = serializers.IntegerField(default=7, min_value=1, max_value=30)

    def validate_signer_ids(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        for signer_id in value:
            if not User.objects.filter(id=signer_id, is_active=True).exists():
                raise serializers.ValidationError(
                    f"User {signer_id} not found or inactive."
                )
        return value


class DocumentAccessLogSerializer(serializers.ModelSerializer):
    """Serializer for document access logs."""

    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = DocumentAccessLog
        fields = ['id', 'document', 'user', 'user_name', 'access_type', 'accessed_at']
