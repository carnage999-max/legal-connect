import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Matter(models.Model):
    """Legal matter/case model."""

    class MatterType(models.TextChoices):
        CIVIL = 'civil', _('Civil')
        CRIMINAL = 'criminal', _('Criminal')
        FAMILY = 'family', _('Family')
        CONTRACT = 'contract', _('Contract')
        CORPORATE = 'corporate', _('Corporate')
        IMMIGRATION = 'immigration', _('Immigration')
        REAL_ESTATE = 'real_estate', _('Real Estate')
        PROBATE = 'probate', _('Probate')
        INTELLECTUAL_PROPERTY = 'ip', _('Intellectual Property')
        EMPLOYMENT = 'employment', _('Employment')
        BANKRUPTCY = 'bankruptcy', _('Bankruptcy')
        TAX = 'tax', _('Tax')
        PERSONAL_INJURY = 'personal_injury', _('Personal Injury')
        OTHER = 'other', _('Other')

    class JurisdictionType(models.TextChoices):
        STATE = 'state', _('State')
        FEDERAL = 'federal', _('Federal')
        INTERNATIONAL = 'international', _('International')

    class MatterStatus(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING = 'pending', _('Pending Review')
        CONFLICT_CHECK = 'conflict_check', _('Conflict Check')
        MATCHING = 'matching', _('Attorney Matching')
        OPEN = 'open', _('Open')
        IN_PROGRESS = 'in_progress', _('In Progress')
        ON_HOLD = 'hold', _('On Hold')
        COMPLETED = 'completed', _('Completed')
        CLOSED = 'closed', _('Closed')
        CANCELLED = 'cancelled', _('Cancelled')

    class ClientRole(models.TextChoices):
        PLAINTIFF = 'plaintiff', _('Plaintiff')
        DEFENDANT = 'defendant', _('Defendant')
        PETITIONER = 'petitioner', _('Petitioner')
        RESPONDENT = 'respondent', _('Respondent')
        APPELLANT = 'appellant', _('Appellant')
        APPELLEE = 'appellee', _('Appellee')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Client relationship
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matters',
        null=True,  # Allow client to be nullable
        blank=True
    )

    # Attorney assignment
    attorney = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='matters'
    )

    # Matter details
    title = models.CharField(max_length=255)
    matter_type = models.CharField(
        max_length=30,
        choices=MatterType.choices,
        default=MatterType.OTHER
    )
    description = models.TextField()
    client_role = models.CharField(
        max_length=20,
        choices=ClientRole.choices,
        default=ClientRole.OTHER
    )

    # Jurisdiction
    jurisdiction_type = models.CharField(
        max_length=15,
        choices=JurisdictionType.choices,
        default=JurisdictionType.STATE,
        help_text="Type of jurisdiction: State, Federal, or International"
    )
    jurisdiction_state = models.CharField(
        max_length=100,
        blank=True,
        help_text="US state code or name (e.g., 'CA', 'New York') when jurisdiction_type is State"
    )
    jurisdiction = models.ForeignKey(
        'attorneys.Jurisdiction',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='matters'
    )
    jurisdiction_details = models.CharField(max_length=255, blank=True)

    # Practice area
    practice_area = models.ForeignKey(
        'attorneys.PracticeArea',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='matters'
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=MatterStatus.choices,
        default=MatterStatus.DRAFT
    )
    status_notes = models.TextField(blank=True)

    # Important dates
    incident_date = models.DateField(null=True, blank=True)
    statute_of_limitations = models.DateField(null=True, blank=True)
    next_action_date = models.DateField(null=True, blank=True)
    next_action_description = models.CharField(max_length=255, blank=True)

    # Conflict check results
    conflict_check_completed = models.BooleanField(default=False)
    conflict_check_passed = models.BooleanField(default=False)
    conflict_check_date = models.DateTimeField(null=True, blank=True)

    # Fee information
    estimated_fee = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True
    )
    agreed_fee = models.DecimalField(
        max_digits=12, decimal_places=2,
        null=True, blank=True
    )
    fee_structure = models.CharField(max_length=50, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('matter')
        verbose_name_plural = _('matters')
        ordering = ['-created_at']

    def __str__(self):
        client_name = self.client.full_name if self.client else 'Anonymous'
        return f"{self.title} - {client_name}"

    @property
    def is_active(self):
        return self.status in [
            self.MatterStatus.OPEN,
            self.MatterStatus.IN_PROGRESS,
            self.MatterStatus.ON_HOLD
        ]


class MatterParty(models.Model):
    """Parties involved in a matter (for conflict checking)."""

    class PartyType(models.TextChoices):
        INDIVIDUAL = 'individual', _('Individual')
        ORGANIZATION = 'organization', _('Organization')
        GOVERNMENT = 'government', _('Government Entity')

    class PartyRole(models.TextChoices):
        OPPOSING = 'opposing', _('Opposing Party')
        WITNESS = 'witness', _('Witness')
        RELATED = 'related', _('Related Party')
        OTHER = 'other', _('Other')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(
        Matter,
        on_delete=models.CASCADE,
        related_name='parties'
    )

    # Party details
    name = models.CharField(max_length=255)
    party_type = models.CharField(
        max_length=20,
        choices=PartyType.choices,
        default=PartyType.INDIVIDUAL
    )
    role = models.CharField(
        max_length=20,
        choices=PartyRole.choices,
        default=PartyRole.OPPOSING
    )

    # Hashed name for conflict checking
    name_hash = models.CharField(max_length=64, db_index=True)

    # Additional info
    additional_info = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('matter party')
        verbose_name_plural = _('matter parties')

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"

    def save(self, *args, **kwargs):
        # Generate hash if not provided
        if not self.name_hash:
            import hashlib
            self.name_hash = hashlib.sha256(
                self.name.lower().strip().encode()
            ).hexdigest()
        super().save(*args, **kwargs)


class MatterNote(models.Model):
    """Internal notes on a matter."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(
        Matter,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matter_notes'
    )

    content = models.TextField()
    is_private = models.BooleanField(
        default=False,
        help_text="Private notes are only visible to the author"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('matter note')
        verbose_name_plural = _('matter notes')
        ordering = ['-created_at']

    def __str__(self):
        return f"Note on {self.matter.title} by {self.author.full_name}"


class MatterStatusHistory(models.Model):
    """Track status changes for a matter."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    matter = models.ForeignKey(
        Matter,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('matter status history')
        verbose_name_plural = _('matter status histories')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.matter.title}: {self.from_status} -> {self.to_status}"
