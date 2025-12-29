from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import AttorneyClientRecord, ConflictCheck, ConflictDetail


@admin.register(AttorneyClientRecord)
class AttorneyClientRecordAdmin(admin.ModelAdmin):
    list_display = ('attorney', 'relationship_type', 'start_date', 'end_date', 'created_at')
    list_filter = ('relationship_type', 'created_at')
    search_fields = ('attorney__user__email', 'attorney__user__first_name')
    readonly_fields = ('id', 'name_hash', 'created_at', 'updated_at')


class ConflictDetailInline(admin.TabularInline):
    model = ConflictDetail
    extra = 0
    readonly_fields = ('attorney', 'conflicting_name_hash', 'conflict_type', 'description', 'created_at')

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ConflictCheck)
class ConflictCheckAdmin(admin.ModelAdmin):
    list_display = ('matter', 'status', 'result', 'names_checked_count', 'processing_time_ms', 'created_at')
    list_filter = ('status', 'result', 'created_at')
    search_fields = ('matter__title', 'requested_by__email')
    readonly_fields = (
        'id', 'matter', 'requested_by', 'status', 'result',
        'names_checked_count', 'started_at', 'completed_at',
        'processing_time_ms', 'created_at'
    )
    inlines = [ConflictDetailInline]
    filter_horizontal = ('attorneys_checked', 'excluded_attorneys')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ConflictDetail)
class ConflictDetailAdmin(admin.ModelAdmin):
    list_display = ('conflict_check', 'attorney', 'conflict_type', 'created_at')
    list_filter = ('conflict_type', 'created_at')
    search_fields = ('attorney__user__email', 'conflict_check__matter__title')
    readonly_fields = ('id', 'conflict_check', 'attorney', 'conflicting_name_hash', 'conflict_type', 'description', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
