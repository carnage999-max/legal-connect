from django.utils import timezone
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from .models import Notification, NotificationPreference


class NotificationService:
    """Service for creating and sending notifications."""

    @classmethod
    def create_notification(
        cls,
        user,
        notification_type,
        title,
        message,
        related_object=None,
        action_url='',
        priority=Notification.Priority.NORMAL,
        send_email=True,
        send_push=True
    ):
        """Create a notification for a user."""

        related_object_type = ''
        related_object_id = None

        if related_object:
            related_object_type = related_object.__class__.__name__
            related_object_id = related_object.pk

        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            priority=priority,
            title=title,
            message=message,
            related_object_type=related_object_type,
            related_object_id=related_object_id,
            action_url=action_url
        )

        # Check preferences and send
        preferences = NotificationPreference.objects.filter(user=user).first()

        if send_email and cls._should_send_email(preferences, notification_type):
            cls._send_email_notification(notification)

        if send_push and cls._should_send_push(preferences, notification_type):
            cls._send_push_notification(notification)

        return notification

    @classmethod
    def _should_send_email(cls, preferences, notification_type):
        """Check if email should be sent based on preferences."""
        if not preferences or not preferences.email_enabled:
            return False

        type_mapping = {
            'matter_': 'email_matter_updates',
            'new_message': 'email_messages',
            'appointment_': 'email_appointments',
            'payment_': 'email_payments',
            'invoice_': 'email_payments',
        }

        for prefix, pref_field in type_mapping.items():
            if notification_type.startswith(prefix) or notification_type == prefix:
                return getattr(preferences, pref_field, True)

        return True

    @classmethod
    def _should_send_push(cls, preferences, notification_type):
        """Check if push notification should be sent based on preferences."""
        if not preferences or not preferences.push_enabled:
            return False

        # Check quiet hours
        if preferences.quiet_hours_enabled:
            now = timezone.now().time()
            if preferences.quiet_hours_start and preferences.quiet_hours_end:
                if preferences.quiet_hours_start <= now <= preferences.quiet_hours_end:
                    return False

        return True

    @classmethod
    def _send_email_notification(cls, notification, template_name=None, context=None):
        """Send email notification with HTML template."""
        try:
            # Build context for template
            email_context = {
                'user': notification.user,
                'notification': notification,
                'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000'),
                'year': timezone.now().year,
            }
            if context:
                email_context.update(context)

            # Determine template based on notification type
            if not template_name:
                template_map = {
                    'appointment_confirmed': 'email/appointment_confirmed.html',
                    'new_message': 'email/new_message.html',
                    'matter_': 'email/matter_status_update.html',
                    'signature_requested': 'email/signature_requested.html',
                    'payment_received': 'email/payment_received.html',
                }

                for prefix, template in template_map.items():
                    if notification.notification_type.startswith(prefix) or notification.notification_type == prefix:
                        template_name = template
                        break

            # Create email
            subject = notification.title
            text_content = notification.message

            # Try to render HTML template
            html_content = None
            if template_name:
                try:
                    html_content = render_to_string(template_name, email_context)
                except Exception:
                    pass  # Fall back to plain text

            # Send email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[notification.user.email]
            )

            if html_content:
                email.attach_alternative(html_content, "text/html")

            email.send(fail_silently=True)

            notification.email_sent = True
            notification.save(update_fields=['email_sent'])
        except Exception:
            pass

    @classmethod
    def _send_push_notification(cls, notification):
        """Send push notification."""
        # In production, integrate with FCM/APNS
        from .models import DeviceToken

        tokens = DeviceToken.objects.filter(
            user=notification.user,
            is_active=True
        )

        # Placeholder for push notification logic
        # This would integrate with Firebase Cloud Messaging or similar

        if tokens.exists():
            notification.push_sent = True
            notification.save(update_fields=['push_sent'])

    @classmethod
    def notify_matter_created(cls, matter):
        """Notify when a new matter is created."""
        if matter.attorney:
            cls.create_notification(
                user=matter.attorney.user,
                notification_type=Notification.NotificationType.MATTER_CREATED,
                title='New Matter Assigned',
                message=f'You have been assigned to a new matter: {matter.title}',
                related_object=matter,
                action_url=f'/matters/{matter.id}'
            )

    @classmethod
    def notify_attorney_request(cls, matter, attorney):
        """Notify attorney of a new client request."""
        cls.create_notification(
            user=attorney.user,
            notification_type=Notification.NotificationType.ATTORNEY_REQUEST,
            title='New Client Request',
            message=f'New consultation request: {matter.title}',
            related_object=matter,
            action_url=f'/matters/{matter.id}'
        )

    @classmethod
    def notify_appointment_confirmed(cls, appointment):
        """Notify client when appointment is confirmed."""
        cls.create_notification(
            user=appointment.client,
            notification_type=Notification.NotificationType.APPOINTMENT_CONFIRMED,
            title='Appointment Confirmed',
            message=f'Your appointment on {appointment.date} at {appointment.start_time} has been confirmed.',
            related_object=appointment,
            action_url=f'/appointments/{appointment.id}'
        )

    @classmethod
    def notify_new_message(cls, message, recipient):
        """Notify user of a new message."""
        cls.create_notification(
            user=recipient,
            notification_type=Notification.NotificationType.NEW_MESSAGE,
            title='New Message',
            message=f'New message from {message.sender.full_name}',
            related_object=message.conversation,
            action_url=f'/messages/{message.conversation.id}'
        )

    @classmethod
    def notify_signature_requested(cls, signature):
        """Notify user of a signature request."""
        cls.create_notification(
            user=signature.signer,
            notification_type=Notification.NotificationType.SIGNATURE_REQUESTED,
            title='Signature Requested',
            message=f'Please sign the document: {signature.document.title}',
            related_object=signature.document,
            action_url=f'/documents/{signature.document.id}/sign',
            priority=Notification.Priority.HIGH
        )

    @classmethod
    def notify_payment_received(cls, payment):
        """Notify attorney of payment received."""
        if payment.recipient:
            cls.create_notification(
                user=payment.recipient.user,
                notification_type=Notification.NotificationType.PAYMENT_RECEIVED,
                title='Payment Received',
                message=f'You have received a payment of ${payment.amount}',
                related_object=payment,
                action_url=f'/payments/{payment.id}'
            )
