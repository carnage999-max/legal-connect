import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


def document_upload_path(instance, filename):
    """Generate upload path for documents."""
    return f'documents/{instance.matter.id}/{filename}'


class Document(models.Model):
    """Document model for file management."""

    class DocumentType(models.TextChoices):
        CONTRACT = 'contract', _('Contract')
        AGREEMENT = 'agreement', _('Agreement')
        EVIDENCE = 'evidence', _('Evidence')
        CORRESPONDENCE = 'correspondence', _('Correspondence')
        COURT_FILING = 'court_filing', _('Court Filing')
        ID_DOCUMENT = 'id', _('ID Document')
        FINANCIAL = 'financial', _('Financial Document')
        OTHER = 'other', _('Other')

    class DocumentStatus(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING_REVIEW = 'pending_review', _('Pending Review')
        APPROVED = 'approved', _('Approved')
        REJECTED = 'rejected', _('Rejected')
        SIGNED = 'signed', _('Signed')
        ARCHIVED = 'archived', _('Archived')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Relationships
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.CASCADE,
        related_name='documents'
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents'
    )

    # File info
    file = models.FileField(upload_to=document_upload_path)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=100)

    # Metadata
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    document_type = models.CharField(
        max_length=30,
        choices=DocumentType.choices,
        default=DocumentType.OTHER
    )
    status = models.CharField(
        max_length=20,
        choices=DocumentStatus.choices,
        default=DocumentStatus.DRAFT
    )

    # Version tracking
    version = models.PositiveIntegerField(default=1)
    parent_document = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='versions'
    )

    # E-signature requirements
    requires_signature = models.BooleanField(default=False)
    signature_completed = models.BooleanField(default=False)
    signed_at = models.DateTimeField(null=True, blank=True)

    # Security
    is_confidential = models.BooleanField(default=False)
    encryption_key = models.CharField(max_length=255, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('document')
        verbose_name_plural = _('documents')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (v{self.version})"


class DocumentSignature(models.Model):
    """E-signature records for documents."""

    class SignatureStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        SIGNED = 'signed', _('Signed')
        DECLINED = 'declined', _('Declined')
        EXPIRED = 'expired', _('Expired')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='signatures'
    )
    signer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='document_signatures'
    )

    status = models.CharField(
        max_length=20,
        choices=SignatureStatus.choices,
        default=SignatureStatus.PENDING
    )

    # Signature data
    signature_image = models.ImageField(
        upload_to='signatures/',
        blank=True, null=True
    )
    signature_data = models.TextField(blank=True)  # Base64 encoded signature

    # Verification
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    signature_hash = models.CharField(max_length=64, blank=True)

    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('document signature')
        verbose_name_plural = _('document signatures')
        unique_together = ['document', 'signer']

    def __str__(self):
        return f"Signature: {self.signer.full_name} on {self.document.title}"


class DocumentAccessLog(models.Model):
    """Track document access for audit purposes."""

    class AccessType(models.TextChoices):
        VIEW = 'view', _('View')
        DOWNLOAD = 'download', _('Download')
        PRINT = 'print', _('Print')
        EDIT = 'edit', _('Edit')
        SIGN = 'sign', _('Sign')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='access_logs'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='document_access_logs'
    )

    access_type = models.CharField(max_length=20, choices=AccessType.choices)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    accessed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('document access log')
        verbose_name_plural = _('document access logs')
        ordering = ['-accessed_at']

    def __str__(self):
        return f"{self.user} {self.access_type} {self.document.title}"
