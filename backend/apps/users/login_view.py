"""Custom login endpoint that creates device sessions."""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from dj_rest_auth.views import LoginView as DRFLoginView
from dj_rest_auth.registration.serializers import RegisterSerializer

from .device_manager import create_or_get_device_session
from .models import AuditLog
from .utils import log_user_action


class EnhancedLoginView(DRFLoginView):
    """Login view that creates device sessions for multi-device support.
    
    Wraps dj-rest-auth LoginView to automatically create/update device sessions
    on successful authentication.
    """
    
    def post(self, request, *args, **kwargs):
        """Handle login and create device session."""
        response = super().post(request, *args, **kwargs)
        
        # If login was successful, create device session
        if response.status_code == status.HTTP_200_OK and hasattr(self, 'user'):
            try:
                device_session = create_or_get_device_session(self.user, request)
                
                log_user_action(
                    self.user,
                    AuditLog.ActionType.LOGIN,
                    f'Logged in from {device_session.device_name}',
                    request
                )
                
                # Attach device info to response
                response.data['device_id'] = str(device_session.id)
                response.data['device_name'] = device_session.device_name
                
            except Exception as e:
                # Log but don't fail the login
                import logging
                logger = logging.getLogger(__name__)
                logger.exception(f'Failed to create device session: {str(e)}')
        
        return response
