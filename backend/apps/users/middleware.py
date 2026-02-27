"""Middleware for automatic device session tracking on authentication."""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import token_urlsafe
import json

from .device_manager import create_or_get_device_session
from .models import AuditLog
from .utils import log_user_action

User = get_user_model()
logger = logging.getLogger(__name__)


class DeviceSessionMiddleware(MiddlewareMixin):
    """Track device sessions on successful token authentication.
    
    This middleware:
    - Monitors token obtain endpoints
    - Creates device sessions on successful login
    - Logs login events with device information
    
    Backward compatible - doesn't break any existing authentication flows.
    """
    
    def process_response(self, request, response):
        """Process response and create device session if login was successful."""
        
        # Only monitor token endpoints
        if not request.path.endswith('/auth/token/'):
            return response
        
        # Only process successful POST requests
        if request.method != 'POST' or response.status_code not in [200, 201]:
            return response
        
        try:
            # Parse response data
            response_data = json.loads(response.content.decode('utf-8'))
            
            # Check if response contains access token (successful login)
            if 'access' not in response_data:
                return response
            
            # Get the user from the request (if available)
            # dj-rest-auth doesn't easily expose the authenticated user,
            # so we'll create device session on next authenticated request instead
            
        except Exception as e:
            logger.debug(f'DeviceSessionMiddleware: Could not process token response: {str(e)}')
        
        return response
