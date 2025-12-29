import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """User notifications."""

    class NotificationType(models.TextChoices):
        # Matter related
        MATTER_CREATED = 'matter_created', _('Matter Created')
        MATTER_UPDATED = 'matter_updated', _('Matter Updated')
        MATTER_ASSIGNED = 'matter_assigned', _('Matter Assigned')
        MATTER_COMPLETED = 'matter_completed', _('Matter Completed')

        # Attorney related
        ATTORNEY_REQUEST = 'attorney_request', _('New Client Request')
        ATTORNEY_ACCEPTED = 'attorney_accepted', _('Attorney Accepted')
        ATTORNEY_DECLINED = 'attorney_declined', _('Attorney Declined')

        # Messaging
        NEW_MESSAGE = 'new_message', _('New Message')

        # Documents
        DOCUMENT_UPLOADED = 'document_uploaded', _('Document Uploaded')
        SIGNATURE_REQUESTED = 'signature_requested', _('Signature Requested')
        DOCUMENT_SIGNED = 'document_signed', _('Document Signed')

        # Scheduling
        APPOINTMENT_REQUESTED = 'appointment_requested', _('Appointment Requested')
        APPOINTMENT_CONFIRMED = 'appointment_confirmed', _('Appointment Confirmed')
        APPOINTMENT_CANCELLED = 'appointment_cancelled', _('Appointment Cancelled')
        APPOINTMENT_REMINDER = 'appointment_reminder', _('Appointment Reminder')

        # Payments
        PAYMENT_RECEIVED = 'payment_received', _('Payment Received')
        PAYMENT_FAILED = 'payment_failed', _('Payment Failed')
        INVOICE_SENT = 'invoice_sent', _('Invoice Sent')

        # System
        SYSTEM_ALERT = 'system_alert', _('System Alert')
        ACCOUNT_UPDATE = 'account_update', _('Account Update')

    class Priority(models.TextChoices):
        LOW = 'low', _('Low')
        NORMAL = 'normal', _('Normal')
        HIGH = 'high', _('High')
        URGENT = 'urgent', _('Urgent')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.NORMAL
    )

    title = models.CharField(max_length=255)
    message = models.TextField()

    # Related objects
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.UUIDField(null=True, blank=True)

    # Action URL
    action_url = models.CharField(max_length=500, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Delivery status
    email_sent = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
    push_sent = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class NotificationPreference(models.Model):
    """User notification preferences."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )

    # Email preferences
    email_enabled = models.BooleanField(default=True)
    email_matter_updates = models.BooleanField(default=True)
    email_messages = models.BooleanField(default=True)
    email_appointments = models.BooleanField(default=True)
    email_payments = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)

    # SMS preferences
    sms_enabled = models.BooleanField(default=False)
    sms_appointments = models.BooleanField(default=True)
    sms_urgent_only = models.BooleanField(default=True)

    # Push preferences
    push_enabled = models.BooleanField(default=True)
    push_messages = models.BooleanField(default=True)
    push_appointments = models.BooleanField(default=True)
    push_documents = models.BooleanField(default=True)

    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('notification preference')
        verbose_name_plural = _('notification preferences')

    def __str__(self):
        return f"Preferences for {self.user.email}"


class DeviceToken(models.Model):
    """Push notification device tokens."""

    class Platform(models.TextChoices):
        IOS = 'ios', _('iOS')
        ANDROID = 'android', _('Android')
        WEB = 'web', _('Web')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='device_tokens'
    )

    token = models.TextField()
    platform = models.CharField(max_length=10, choices=Platform.choices)
    device_name = models.CharField(max_length=100, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('device token')
        verbose_name_plural = _('device tokens')
        unique_together = ['user', 'token']

    def __str__(self):
        return f"{self.user.email} - {self.platform}"
