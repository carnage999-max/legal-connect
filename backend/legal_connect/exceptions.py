import logging
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from django.db import IntegrityError


logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Wrap DRF's default handler and sanitize unhandled errors.

    - Converts IntegrityError into a generic 400 to avoid leaking DB details.
    - Logs unhandled exceptions and returns a generic 500 message.
    """
    # Let DRF handle known exceptions first
    response = drf_exception_handler(exc, context)

    if response is not None:
        return response

    # Sanitize common DB unique constraint leaks
    if isinstance(exc, IntegrityError):
        return Response({'detail': 'Invalid request.'}, status=400)

    # Log and return a generic error for everything else
    logger.exception('Unhandled exception in API', exc_info=exc)
    return Response({'detail': 'An unexpected error occurred.'}, status=500)

