from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """Customize URLs in account emails to point to the frontend site."""

    def get_email_confirmation_url(self, request, emailconfirmation):
        frontend_base = getattr(settings, 'FRONTEND_URL', None) or getattr(settings, 'SITE_URL', 'http://localhost:3000')
        # Use query param; Next.js page will POST key to backend verify endpoint
        return f"{frontend_base.rstrip('/')}/verify-email?key={emailconfirmation.key}"

    def get_password_reset_url(self, request, uidb36, token, **kwargs):
        frontend_base = getattr(settings, 'FRONTEND_URL', None) or getattr(settings, 'SITE_URL', 'http://localhost:3000')
        # Optional: also route password resets through the frontend
        return f"{frontend_base.rstrip('/')}/reset-password?uid={uidb36}&token={token}"

