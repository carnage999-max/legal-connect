import uuid
import hashlib
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class AttorneyClientRecord(models.Model):
    """
    Record of attorney's current and past clients for conflict checking.
    Names are stored as hashes for confidentiality.
    """

    class RelationshipType(models.TextChoices):
        CURRENT_CLIENT = 'current', _('Current Client')
        PAST_CLIENT = 'past', _('Past Client')
        ADVERSE_PARTY = 'adverse', _('Adverse Party')
        RELATED_PARTY = 'related', _('Related Party')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attorney = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.CASCADE,
        related_name='client_records'
    )

    # Hashed name for privacy
    name_hash = models.CharField(max_length=64, db_index=True)

    # Relationship metadata
    relationship_type = models.CharField(
        max_length=20,
        choices=RelationshipType.choices,
        default=RelationshipType.CURRENT_CLIENT
    )

    # Optional reference to matter
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='conflict_records'
    )

    # Date tracking
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # Notes (encrypted in production)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('attorney client record')
        verbose_name_plural = _('attorney client records')
        indexes = [
            models.Index(fields=['attorney', 'name_hash']),
        ]

    def __str__(self):
        return f"Record for Attorney {self.attorney.user.full_name}"

    @classmethod
    def hash_name(cls, name):
        """Generate a hash for a name."""
        normalized = name.lower().strip()
        return hashlib.sha256(normalized.encode()).hexdigest()


class ConflictCheck(models.Model):
    """Record of conflict checks performed."""

    class CheckStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')

    class CheckResult(models.TextChoices):
        CLEAR = 'clear', _('No Conflicts')
        CONFLICT_FOUND = 'conflict', _('Conflict Found')
        POTENTIAL_CONFLICT = 'potential', _('Potential Conflict')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.CASCADE,
        related_name='conflict_checks'
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='conflict_check_requests'
    )

    status = models.CharField(
        max_length=20,
        choices=CheckStatus.choices,
        default=CheckStatus.PENDING
    )
    result = models.CharField(
        max_length=20,
        choices=CheckResult.choices,
        blank=True
    )

    # Attorneys checked
    attorneys_checked = models.ManyToManyField(
        'attorneys.AttorneyProfile',
        related_name='conflict_checks_performed',
        blank=True
    )

    # Attorneys excluded due to conflicts
    excluded_attorneys = models.ManyToManyField(
        'attorneys.AttorneyProfile',
        related_name='conflict_exclusions',
        blank=True
    )

    # Number of party names checked
    names_checked_count = models.PositiveIntegerField(default=0)

    # Processing metadata
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    processing_time_ms = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('conflict check')
        verbose_name_plural = _('conflict checks')
        ordering = ['-created_at']

    def __str__(self):
        return f"Conflict Check for {self.matter.title}"


class ConflictDetail(models.Model):
    """Detailed record of a specific conflict found."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conflict_check = models.ForeignKey(
        ConflictCheck,
        on_delete=models.CASCADE,
        related_name='details'
    )
    attorney = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.CASCADE,
        related_name='conflict_details'
    )

    # The hashed name that caused the conflict
    conflicting_name_hash = models.CharField(max_length=64)

    # Type of conflict
    conflict_type = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    # The client record that caused the conflict
    client_record = models.ForeignKey(
        AttorneyClientRecord,
        on_delete=models.SET_NULL,
        null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('conflict detail')
        verbose_name_plural = _('conflict details')

    def __str__(self):
        return f"Conflict: {self.attorney.user.full_name} - {self.conflict_type}"
