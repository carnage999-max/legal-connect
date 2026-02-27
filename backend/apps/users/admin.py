from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User, ClientProfile, AuditLog, DeviceSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'is_active', 'is_verified', 'date_joined')
    list_filter = ('user_type', 'is_active', 'is_verified', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'phone_number', 'avatar')}),
        (_('User type'), {'fields': ('user_type',)}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Two Factor Auth'), {'fields': ('two_factor_enabled',)}),
        (_('Preferences'), {'fields': ('timezone', 'language')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'user_type', 'password1', 'password2'),
        }),
    )


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'state', 'id_verified', 'created_at')
    list_filter = ('id_verified', 'state', 'country')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'city')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'ip_address', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('user__email', 'description', 'ip_address')
    readonly_fields = ('id', 'user', 'action', 'description', 'ip_address', 'user_agent', 'metadata', 'created_at')
    ordering = ('-created_at',)


@admin.register(DeviceSession)
class DeviceSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_name', 'ip_address', 'is_active', 'last_active_at', 'created_at')
    list_filter = ('is_active', 'created_at', 'last_active_at')
    search_fields = ('user__email', 'device_name', 'ip_address', 'device_fingerprint')
    readonly_fields = ('id', 'user', 'device_fingerprint', 'user_agent', 'created_at', 'last_active_at', 'revoked_at')
    
    fieldsets = (
        (_('Device Info'), {
            'fields': ('user', 'device_name', 'device_fingerprint', 'ip_address', 'user_agent')
        }),
        (_('Status'), {
            'fields': ('is_active', 'refresh_token_version')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'last_active_at', 'revoked_at')
        }),
    )
    
ordering = ('-last_active_at',)
