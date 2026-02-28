"""Custom JWT authentication with device session validation."""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework.exceptions import AuthenticationFailed as DRFAuthenticationFailed
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class DeviceAwareJWTAuthentication(JWTAuthentication):
    """JWT authentication with device session support.
    
    This extends the standard JWT authentication to be device-aware.
    Device sessions are managed separately via the device session API,
    not during token validation, to avoid race conditions and authentication failures.
    """
    
    def authenticate(self, request):
        """Authenticate request using JWT token - uses parent class implementation."""
        try:
            # Call parent's authenticate method which properly handles token extraction
            result = super().authenticate(request)
            
            if result is None:
                return None
            
            # result is a tuple of (user, validated_token)
            return result
            
        except InvalidToken as e:
            logger.error(f'Invalid token: {str(e)}')
            raise AuthenticationFailed('Invalid token or token expired')
        except DRFAuthenticationFailed:
            # Re-raise DRF authentication failures as-is
            raise
        except Exception as e:
            logger.error(f'Authentication error: {str(e)}', exc_info=True)
            raise AuthenticationFailed('Authentication failed')
