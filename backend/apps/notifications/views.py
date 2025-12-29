from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from .models import Notification, NotificationPreference, DeviceToken
from .serializers import (
    NotificationSerializer, NotificationPreferenceSerializer,
    DeviceTokenSerializer, RegisterDeviceSerializer,
    MarkNotificationsReadSerializer
)


class NotificationListView(generics.ListAPIView):
    """List notifications for current user."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)

        # Filter by read status
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')

        # Filter by type
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        return queryset.order_by('-created_at')


class NotificationDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a notification."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Mark as read on retrieve
        if not instance.is_read:
            instance.is_read = True
            instance.read_at = timezone.now()
            instance.save()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MarkNotificationsReadView(APIView):
    """Mark notifications as read."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MarkNotificationsReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        now = timezone.now()

        if data.get('mark_all'):
            count = Notification.objects.filter(
                user=request.user,
                is_read=False
            ).update(is_read=True, read_at=now)
        else:
            count = Notification.objects.filter(
                user=request.user,
                id__in=data['notification_ids'],
                is_read=False
            ).update(is_read=True, read_at=now)

        return Response({'marked_read': count})


class UnreadCountView(APIView):
    """Get unread notification count."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response({'unread_count': count})


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Get or update notification preferences."""

    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        preferences, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preferences


class RegisterDeviceView(APIView):
    """Register a device for push notifications."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RegisterDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        device, created = DeviceToken.objects.update_or_create(
            user=request.user,
            token=data['token'],
            defaults={
                'platform': data['platform'],
                'device_name': data.get('device_name', ''),
                'is_active': True
            }
        )

        return Response(
            DeviceTokenSerializer(device).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class UnregisterDeviceView(APIView):
    """Unregister a device from push notifications."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response(
                {'detail': 'Token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        count, _ = DeviceToken.objects.filter(
            user=request.user,
            token=token
        ).delete()

        return Response({'deleted': count > 0})


class DeviceListView(generics.ListAPIView):
    """List registered devices."""

    serializer_class = DeviceTokenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DeviceToken.objects.filter(
            user=self.request.user,
            is_active=True
        )
