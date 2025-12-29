import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


class PracticeArea(models.Model):
    """Practice areas/specializations for attorneys."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('practice area')
        verbose_name_plural = _('practice areas')
        ordering = ['name']

    def __str__(self):
        return self.name


class Jurisdiction(models.Model):
    """Jurisdictions where attorneys can practice."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    state_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='United States')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('jurisdiction')
        verbose_name_plural = _('jurisdictions')
        ordering = ['country', 'name']
        unique_together = ['state_code', 'country']

    def __str__(self):
        return f"{self.name}, {self.country}"


class AttorneyProfile(models.Model):
    """Extended profile for attorney users."""

    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        VERIFIED = 'verified', _('Verified')
        REJECTED = 'rejected', _('Rejected')

    class FeeStructure(models.TextChoices):
        HOURLY = 'hourly', _('Hourly Rate')
        FLAT = 'flat', _('Flat Fee')
        CONTINGENCY = 'contingency', _('Contingency')
        RETAINER = 'retainer', _('Retainer')
        SUBSCRIPTION = 'subscription', _('Subscription')

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attorney_profile',
        primary_key=True
    )

    # Professional info
    bar_number = models.CharField(max_length=50)
    bar_state = models.CharField(max_length=100)
    bar_admission_date = models.DateField()
    years_of_experience = models.PositiveIntegerField(default=0)

    # Bio and description
    headline = models.CharField(max_length=200, blank=True)
    biography = models.TextField(blank=True)
    education = models.TextField(blank=True, help_text="Education history, one per line")
    languages = models.JSONField(default=list, blank=True)

    # Practice areas and jurisdictions
    practice_areas = models.ManyToManyField(PracticeArea, related_name='attorneys')
    jurisdictions = models.ManyToManyField(Jurisdiction, related_name='attorneys')

    # Fee information
    fee_structure = models.CharField(
        max_length=20,
        choices=FeeStructure.choices,
        default=FeeStructure.HOURLY
    )
    hourly_rate = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)]
    )
    consultation_fee = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)]
    )
    free_consultation = models.BooleanField(default=False)

    # Insurance
    malpractice_insurance = models.BooleanField(default=False)
    insurance_carrier = models.CharField(max_length=200, blank=True)
    insurance_policy_number = models.CharField(max_length=100, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)

    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='verified_attorneys'
    )
    rejection_reason = models.TextField(blank=True)

    # Documents
    bar_license_document = models.FileField(
        upload_to='attorney_documents/bar_licenses/',
        blank=True, null=True
    )
    insurance_document = models.FileField(
        upload_to='attorney_documents/insurance/',
        blank=True, null=True
    )

    # Availability
    is_accepting_clients = models.BooleanField(default=True)
    max_active_cases = models.PositiveIntegerField(default=50)

    # Ratings (calculated)
    rating = models.DecimalField(
        max_digits=3, decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )
    total_reviews = models.PositiveIntegerField(default=0)
    total_cases_completed = models.PositiveIntegerField(default=0)

    # Office info
    office_address = models.TextField(blank=True)
    office_city = models.CharField(max_length=100, blank=True)
    office_state = models.CharField(max_length=100, blank=True)
    office_postal_code = models.CharField(max_length=20, blank=True)
    office_phone = models.CharField(max_length=20, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('attorney profile')
        verbose_name_plural = _('attorney profiles')

    def __str__(self):
        return f"Attorney: {self.user.full_name}"

    @property
    def is_verified(self):
        return self.verification_status == self.VerificationStatus.VERIFIED

    @property
    def active_cases_count(self):
        return self.matters.filter(status__in=['open', 'in_progress']).count()

    @property
    def can_accept_cases(self):
        return (
            self.is_accepting_clients and
            self.is_verified and
            self.active_cases_count < self.max_active_cases
        )


class AttorneyReview(models.Model):
    """Client reviews for attorneys."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attorney = models.ForeignKey(
        AttorneyProfile,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attorney_reviews'
    )
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviews'
    )

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review_text = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('attorney review')
        verbose_name_plural = _('attorney reviews')
        ordering = ['-created_at']
        unique_together = ['attorney', 'client', 'matter']

    def __str__(self):
        return f"Review for {self.attorney.user.full_name} by {self.client.full_name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update attorney's average rating
        self.attorney.update_rating()


class AttorneyAvailability(models.Model):
    """Weekly availability schedule for attorneys."""

    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, _('Monday')
        TUESDAY = 1, _('Tuesday')
        WEDNESDAY = 2, _('Wednesday')
        THURSDAY = 3, _('Thursday')
        FRIDAY = 4, _('Friday')
        SATURDAY = 5, _('Saturday')
        SUNDAY = 6, _('Sunday')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attorney = models.ForeignKey(
        AttorneyProfile,
        on_delete=models.CASCADE,
        related_name='availability_slots'
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = _('availability slot')
        verbose_name_plural = _('availability slots')
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.attorney.user.full_name} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
