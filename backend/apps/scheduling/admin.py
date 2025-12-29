from django.contrib import admin
from .models import Appointment, CalendarIntegration, BlockedTime


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'attorney', 'date', 'start_time', 'appointment_type', 'status', 'is_paid')
    list_filter = ('status', 'appointment_type', 'meeting_type', 'is_paid', 'date')
    search_fields = ('client__email', 'attorney__user__email', 'matter__title')
    readonly_fields = ('id', 'created_at', 'updated_at', 'confirmed_at', 'cancelled_at')
    date_hierarchy = 'date'


@admin.register(CalendarIntegration)
class CalendarIntegrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider', 'is_active', 'sync_enabled', 'last_synced_at')
    list_filter = ('provider', 'is_active', 'sync_enabled')
    search_fields = ('user__email',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_synced_at')


@admin.register(BlockedTime)
class BlockedTimeAdmin(admin.ModelAdmin):
    list_display = ('attorney', 'start_datetime', 'end_datetime', 'is_recurring', 'reason')
    list_filter = ('is_recurring', 'start_datetime')
    search_fields = ('attorney__user__email', 'reason')
    readonly_fields = ('id', 'created_at')
