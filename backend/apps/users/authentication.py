"""Custom JWT authentication with device session validation."""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
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
        """Authenticate request using JWT token."""
        try:
            # Get JWT from request
            raw_token = self.get_raw_token(request)
            if raw_token is None:
                return None
            
            # Validate and decode JWT using parent class
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)
            
            return (user, validated_token)
            
        except InvalidToken as e:
            logger.error(f'Invalid token: {str(e)}')
            raise AuthenticationFailed('Invalid token or token expired')
        except Exception as e:
            logger.error(f'Authentication error: {str(e)}', exc_info=True)
            raise AuthenticationFailed('Authentication failed')
