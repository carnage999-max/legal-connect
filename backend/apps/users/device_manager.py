"""Device fingerprinting and session tracking utilities."""
import hashlib
import uuid
import logging
from django.utils import timezone
from django.conf import settings
from .models import DeviceSession

logger = logging.getLogger(__name__)


def get_device_fingerprint(request):
    """Generate a device fingerprint from request metadata.
    
    Combines user agent, accept language, and IP address to create a
    relatively stable device identifier. Not cryptographically unique
    but good enough to distinguish between devices.
    """
    try:
        logger.debug(f"get_device_fingerprint called with request type: {type(request)}")
        components = [
            str(request.META.get('HTTP_USER_AGENT', '') or ''),
            str(request.META.get('HTTP_ACCEPT_LANGUAGE', '') or ''),
            str(get_client_ip(request) or ''),
        ]
        
        fingerprint_str = '|'.join(components)
        fingerprint_hash = hashlib.sha256(fingerprint_str.encode()).hexdigest()
        return fingerprint_hash
    except Exception as e:
        logger.error(f"Error in get_device_fingerprint: {e}", exc_info=True)
        raise


def get_client_ip(request):
    """Extract client IP from request, accounting for proxies."""
    try:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = str(x_forwarded_for).split(',')[0].strip()
        else:
            ip = str(request.META.get('REMOTE_ADDR', '') or '')
        return ip
    except Exception as e:
        # Fallback if anything goes wrong
        return 'unknown'


def get_device_name(request):
    """Parse device name from user agent string."""
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Parse common device patterns
    if 'Mobile' in user_agent or 'Android' in user_agent:
        if 'iPhone' in user_agent:
            return 'iPhone'
        elif 'iPad' in user_agent:
            return 'iPad'
        elif 'Android' in user_agent:
            return 'Android Phone'
    
    if 'Windows' in user_agent:
        return 'Windows'
    elif 'Macintosh' in user_agent:
        return 'Mac'
    elif 'Linux' in user_agent:
        return 'Linux'
    elif 'iPad' in user_agent:
        return 'iPad'
    
    return 'Unknown Device'


def create_or_get_device_session(user, request, device_name=None):
    """Create or retrieve a device session for the given request.
    
    Args:
        user: User instance
        request: HTTP request object
        device_name: Optional custom device name
    
    Returns:
        DeviceSession instance
    """
    fingerprint = get_device_fingerprint(request)
    ip_address = get_client_ip(request)
    device_name = device_name or get_device_name(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    device_session, created = DeviceSession.objects.get_or_create(
        user=user,
        device_fingerprint=fingerprint,
        defaults={
            'device_name': device_name,
            'ip_address': ip_address,
            'user_agent': user_agent,
        }
    )
    
    # Update last seen timestamp
    if not created:
        device_session.save(update_fields=['last_active_at'])
    
    return device_session


def revoke_device_session(device_session):
    """Revoke a device session, forcing re-authentication."""
    device_session.is_active = False
    device_session.revoked_at = timezone.now()
    device_session.save()


def revoke_all_device_sessions_except(user, exclude_device_session_id):
    """Revoke all device sessions except the specified one.
    
    Useful for "logout from all other devices" functionality.
    """
    DeviceSession.objects.filter(
        user=user,
        is_active=True
    ).exclude(
        id=exclude_device_session_id
    ).update(
        is_active=False,
        revoked_at=timezone.now()
    )


def get_active_device_sessions(user):
    """Get all active device sessions for a user."""
    return DeviceSession.objects.filter(
        user=user,
        is_active=True
    ).order_by('-last_active_at')
