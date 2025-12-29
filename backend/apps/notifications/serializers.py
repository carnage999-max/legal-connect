from rest_framework import serializers
from .models import Notification, NotificationPreference, DeviceToken


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'priority', 'title', 'message',
            'related_object_type', 'related_object_id', 'action_url',
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences."""

    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'email_matter_updates', 'email_messages',
            'email_appointments', 'email_payments', 'email_marketing',
            'sms_enabled', 'sms_appointments', 'sms_urgent_only',
            'push_enabled', 'push_messages', 'push_appointments', 'push_documents',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end'
        ]


class DeviceTokenSerializer(serializers.ModelSerializer):
    """Serializer for device tokens."""

    class Meta:
        model = DeviceToken
        fields = ['id', 'token', 'platform', 'device_name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterDeviceSerializer(serializers.Serializer):
    """Serializer for registering a device token."""

    token = serializers.CharField()
    platform = serializers.ChoiceField(choices=DeviceToken.Platform.choices)
    device_name = serializers.CharField(required=False, allow_blank=True)


class MarkNotificationsReadSerializer(serializers.Serializer):
    """Serializer for marking notifications as read."""

    notification_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    mark_all = serializers.BooleanField(default=False)

    def validate(self, data):
        if not data.get('notification_ids') and not data.get('mark_all'):
            raise serializers.ValidationError(
                "Either notification_ids or mark_all must be provided."
            )
        return data
