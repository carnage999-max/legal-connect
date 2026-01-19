from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import get_user_model

from .models import ClientProfile, AuditLog
from .serializers import (
    UserDetailSerializer, UserUpdateSerializer,
    ClientProfileSerializer, ClientProfileUpdateSerializer,
    PasswordChangeSerializer, AuditLogSerializer
)
from .utils import log_user_action
from .emails import send_password_changed_email, send_account_deactivated_email

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user's profile."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserDetailSerializer

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        serializer.save()
        log_user_action(
            self.request.user,
            AuditLog.ActionType.PROFILE_UPDATE,
            'User profile updated',
            self.request
        )


class ClientProfileView(generics.RetrieveUpdateAPIView):
    """Get or update client profile."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ClientProfileUpdateSerializer
        return ClientProfileSerializer

    def get_object(self):
        profile, _ = ClientProfile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_update(self, serializer):
        serializer.save()
        log_user_action(
            self.request.user,
            AuditLog.ActionType.PROFILE_UPDATE,
            'Client profile updated',
            self.request
        )


class PasswordChangeView(APIView):
    """Change user password."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        # Send notification email
        try:
            send_password_changed_email(request.user)
        except Exception:
            pass

        log_user_action(
            request.user,
            AuditLog.ActionType.PASSWORD_CHANGE,
            'Password changed',
            request
        )

        return Response({'detail': 'Password changed successfully.'})


class AuditLogListView(generics.ListAPIView):
    """List audit logs for the current user."""

    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(user=self.request.user).order_by('-created_at')


class DeleteAccountView(APIView):
    """Delete user account (GDPR/CCPA compliance)."""

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        user = request.user
        email = user.email

        # Send account deactivation email before anonymizing email
        try:
            send_account_deactivated_email(user)
        except Exception:
            pass

        # Log the deletion
        log_user_action(
            user,
            AuditLog.ActionType.OTHER,
            f'Account deleted: {email}',
            request
        )

        # Anonymize and deactivate instead of hard delete
        user.email = f'deleted_{user.id}@deleted.legalconnect.com'
        user.first_name = 'Deleted'
        user.last_name = 'User'
        user.phone_number = None
        user.is_active = False
        user.avatar = None
        user.save()

        return Response(
            {'detail': 'Account has been deleted.'},
            status=status.HTTP_200_OK
        )


class UserAvatarUploadView(APIView):
    """Upload or update current user's avatar image."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('avatar')
        if not file:
            return Response({'detail': 'No avatar file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user.avatar = file
        user.save(update_fields=['avatar'])

        return Response({
            'avatar': user.avatar.url if user.avatar else None
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        user.avatar = None
        user.save(update_fields=['avatar'])
        return Response({'detail': 'Avatar removed.'})
