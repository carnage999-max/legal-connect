from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import ClientProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_client_profile(sender, instance, created, **kwargs):
    """Create a client profile when a new client user is created."""
    if created and instance.user_type == 'client':
        ClientProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def send_welcome_email_on_verification(sender, instance, created, **kwargs):
    """Send welcome email when user verifies their email."""
    if created and instance.is_verified:
        # User was created already verified (e.g., admin or social auth)
        from .emails import send_welcome_email
        send_welcome_email(instance)
