import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class Appointment(models.Model):
    """Appointments between clients and attorneys."""

    class AppointmentType(models.TextChoices):
        CONSULTATION = 'consultation', _('Consultation')
        FOLLOW_UP = 'follow_up', _('Follow Up')
        DOCUMENT_REVIEW = 'document_review', _('Document Review')
        CASE_DISCUSSION = 'case_discussion', _('Case Discussion')
        OTHER = 'other', _('Other')

    class AppointmentStatus(models.TextChoices):
        PENDING = 'pending', _('Pending Confirmation')
        CONFIRMED = 'confirmed', _('Confirmed')
        CANCELLED = 'cancelled', _('Cancelled')
        COMPLETED = 'completed', _('Completed')
        NO_SHOW = 'no_show', _('No Show')
        RESCHEDULED = 'rescheduled', _('Rescheduled')

    class MeetingType(models.TextChoices):
        IN_PERSON = 'in_person', _('In Person')
        VIDEO = 'video', _('Video Call')
        PHONE = 'phone', _('Phone Call')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Parties
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_appointments'
    )
    attorney = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    # Related matter (optional)
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='appointments'
    )

    # Appointment details
    appointment_type = models.CharField(
        max_length=20,
        choices=AppointmentType.choices,
        default=AppointmentType.CONSULTATION
    )
    meeting_type = models.CharField(
        max_length=20,
        choices=MeetingType.choices,
        default=MeetingType.VIDEO
    )
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.PENDING
    )

    # Scheduling
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    timezone = models.CharField(max_length=50, default='UTC')

    # Location/Meeting details
    location = models.TextField(blank=True)
    meeting_link = models.URLField(blank=True)
    meeting_id = models.CharField(max_length=100, blank=True)
    meeting_password = models.CharField(max_length=50, blank=True)

    # Notes
    client_notes = models.TextField(blank=True)
    attorney_notes = models.TextField(blank=True)

    # Payment
    fee = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)]
    )
    payment = models.ForeignKey(
        'payments.Payment',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='appointments'
    )
    is_paid = models.BooleanField(default=False)

    # Calendar sync
    google_event_id = models.CharField(max_length=255, blank=True)
    outlook_event_id = models.CharField(max_length=255, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        verbose_name = _('appointment')
        verbose_name_plural = _('appointments')
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.client.full_name} with {self.attorney.user.full_name} on {self.date}"


class CalendarIntegration(models.Model):
    """Calendar integrations for users."""

    class Provider(models.TextChoices):
        GOOGLE = 'google', _('Google Calendar')
        OUTLOOK = 'outlook', _('Microsoft Outlook')
        APPLE = 'apple', _('Apple Calendar')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='calendar_integrations'
    )

    provider = models.CharField(max_length=20, choices=Provider.choices)
    is_active = models.BooleanField(default=True)

    # OAuth tokens (encrypted in production)
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)

    # Calendar settings
    calendar_id = models.CharField(max_length=255, blank=True)
    sync_enabled = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('calendar integration')
        verbose_name_plural = _('calendar integrations')
        unique_together = ['user', 'provider']

    def __str__(self):
        return f"{self.user.email} - {self.provider}"


class BlockedTime(models.Model):
    """Blocked time slots for attorneys."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attorney = models.ForeignKey(
        'attorneys.AttorneyProfile',
        on_delete=models.CASCADE,
        related_name='blocked_times'
    )

    # Time range
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    # Recurrence (optional)
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.CharField(max_length=255, blank=True)  # iCal RRULE format

    reason = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('blocked time')
        verbose_name_plural = _('blocked times')
        ordering = ['start_datetime']

    def __str__(self):
        return f"Blocked: {self.start_datetime} - {self.end_datetime}"
