"""Thin helpers around the Stripe SDK so views stay readable and tests can patch one place."""
from decimal import Decimal, ROUND_HALF_UP

import stripe
from django.conf import settings


class StripeNotConfigured(Exception):
    """Raised when STRIPE_SECRET_KEY is missing."""


def get_stripe():
    """Return the stripe module with the secret key applied."""
    if not settings.STRIPE_SECRET_KEY:
        raise StripeNotConfigured('STRIPE_SECRET_KEY is not set')
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def to_cents(amount: Decimal) -> int:
    """Convert a dollar Decimal to integer cents without float rounding."""
    return int((Decimal(amount) * 100).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
