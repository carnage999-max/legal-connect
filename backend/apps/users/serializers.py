from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import ClientProfile, AuditLog

User = get_user_model()


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for user details (used by dj-rest-auth)."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'user_type', 'avatar', 'is_verified',
            'two_factor_enabled', 'timezone', 'language',
            'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'date_joined', 'last_login']


class CustomRegisterSerializer(RegisterSerializer):
    """Custom registration serializer with additional fields."""

    username = None  # Remove username field
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    user_type = serializers.ChoiceField(
        choices=[('client', 'Client'), ('attorney', 'Attorney')],
        default='client'
    )

    def validate_user_type(self, value):
        if value not in ['client', 'attorney']:
            raise serializers.ValidationError("Invalid user type")
        return value

    def get_cleaned_data(self):
        return {
            'email': self.validated_data.get('email', ''),
            'password1': self.validated_data.get('password1', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
            'phone_number': self.validated_data.get('phone_number', ''),
            'user_type': self.validated_data.get('user_type', 'client'),
        }

    @transaction.atomic
    def save(self, request):
        try:
            user = super().save(request)
        except Exception as e:
            raise serializers.ValidationError(f"Registration failed: {str(e)}")
        
        user.first_name = self.validated_data.get('first_name', '')
        user.last_name = self.validated_data.get('last_name', '')
        user.user_type = self.validated_data.get('user_type', 'client')
        
        # Only set phone_number if the field exists
        if hasattr(user, 'phone_number'):
            user.phone_number = self.validated_data.get('phone_number', '')
        
        user.save()

        # Create client profile if user is a client
        if user.user_type == 'client':
            ClientProfile.objects.get_or_create(user=user)

        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'avatar', 'timezone', 'language'
        ]


class ClientProfileSerializer(serializers.ModelSerializer):
    """Serializer for client profile."""

    user = UserDetailSerializer(read_only=True)

    class Meta:
        model = ClientProfile
        fields = [
            'user', 'date_of_birth', 'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relationship', 'preferred_contact_method',
            'id_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'id_verified', 'created_at', 'updated_at']


class ClientProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating client profile."""

    class Meta:
        model = ClientProfile
        fields = [
            'date_of_birth', 'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relationship', 'preferred_contact_method'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=10)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class TwoFactorSetupSerializer(serializers.Serializer):
    """Serializer for 2FA setup."""

    code = serializers.CharField(required=True, min_length=6, max_length=6)


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit logs."""

    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_email', 'action', 'description',
            'ip_address', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
