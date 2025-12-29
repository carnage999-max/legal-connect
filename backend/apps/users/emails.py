"""Email utility functions for user-related emails."""
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone


def send_welcome_email(user):
    """Send welcome email to new user."""
    context = {
        'user': user,
        'dashboard_url': f"{getattr(settings, 'SITE_URL', 'http://localhost:3000')}/dashboard",
        'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000'),
        'year': timezone.now().year,
    }

    subject = 'Welcome to Legal Connect!'
    text_content = render_to_string('email/welcome.txt', context)
    html_content = render_to_string('email/welcome.html', context)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=True)


def send_password_changed_email(user):
    """Send notification when password is changed."""
    context = {
        'user': user,
        'site_url': getattr(settings, 'SITE_URL', 'http://localhost:3000'),
        'year': timezone.now().year,
        'change_time': timezone.now(),
    }

    subject = 'Your Legal Connect password was changed'
    text_content = f"""
Hello {user.first_name or 'there'},

Your Legal Connect password was successfully changed on {timezone.now().strftime('%B %d, %Y at %I:%M %p')}.

If you did not make this change, please contact our support team immediately.

Best regards,
The Legal Connect Team
"""

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    email.send(fail_silently=True)


def send_account_deactivated_email(user):
    """Send notification when account is deactivated."""
    subject = 'Your Legal Connect account has been deactivated'
    text_content = f"""
Hello {user.first_name or 'there'},

Your Legal Connect account has been deactivated as requested.

If you did not request this or would like to reactivate your account, please contact our support team.

We're sorry to see you go. Thank you for using Legal Connect.

Best regards,
The Legal Connect Team
"""

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email]
    )
    email.send(fail_silently=True)
