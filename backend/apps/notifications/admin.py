from django.contrib import admin
from .models import Notification, NotificationPreference, DeviceToken


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_read', 'priority', 'created_at')
    list_filter = ('notification_type', 'is_read', 'priority', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('id', 'created_at', 'read_at')
    date_hierarchy = 'created_at'


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_enabled', 'sms_enabled', 'push_enabled', 'quiet_hours_enabled')
    list_filter = ('email_enabled', 'sms_enabled', 'push_enabled')
    search_fields = ('user__email',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(DeviceToken)
class DeviceTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'platform', 'device_name', 'is_active', 'last_used_at')
    list_filter = ('platform', 'is_active')
    search_fields = ('user__email', 'device_name')
    readonly_fields = ('id', 'created_at', 'last_used_at')
