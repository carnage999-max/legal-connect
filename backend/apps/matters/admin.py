from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Matter, MatterParty, MatterNote, MatterStatusHistory


class MatterPartyInline(admin.TabularInline):
    model = MatterParty
    extra = 0
    readonly_fields = ('name_hash', 'created_at')


class MatterNoteInline(admin.TabularInline):
    model = MatterNote
    extra = 0
    readonly_fields = ('created_at', 'updated_at')


class MatterStatusHistoryInline(admin.TabularInline):
    model = MatterStatusHistory
    extra = 0
    readonly_fields = ('from_status', 'to_status', 'changed_by', 'notes', 'created_at')

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Matter)
class MatterAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'client', 'attorney', 'matter_type', 'status',
        'jurisdiction', 'created_at'
    )
    list_filter = ('status', 'matter_type', 'conflict_check_passed', 'created_at')
    search_fields = ('title', 'description', 'client__email', 'client__first_name')
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'submitted_at',
        'assigned_at', 'completed_at', 'conflict_check_date'
    )
    inlines = [MatterPartyInline, MatterNoteInline, MatterStatusHistoryInline]

    fieldsets = (
        (None, {
            'fields': ('id', 'client', 'attorney')
        }),
        (_('Matter Details'), {
            'fields': (
                'title', 'matter_type', 'description', 'client_role',
                'jurisdiction', 'jurisdiction_details', 'practice_area'
            )
        }),
        (_('Status'), {
            'fields': ('status', 'status_notes')
        }),
        (_('Important Dates'), {
            'fields': (
                'incident_date', 'statute_of_limitations',
                'next_action_date', 'next_action_description'
            )
        }),
        (_('Conflict Check'), {
            'fields': (
                'conflict_check_completed', 'conflict_check_passed',
                'conflict_check_date'
            )
        }),
        (_('Fees'), {
            'fields': ('estimated_fee', 'agreed_fee', 'fee_structure')
        }),
        (_('Timestamps'), {
            'fields': (
                'created_at', 'updated_at', 'submitted_at',
                'assigned_at', 'completed_at'
            )
        }),
    )


@admin.register(MatterParty)
class MatterPartyAdmin(admin.ModelAdmin):
    list_display = ('name', 'matter', 'party_type', 'role', 'created_at')
    list_filter = ('party_type', 'role')
    search_fields = ('name', 'matter__title')
    readonly_fields = ('name_hash', 'created_at')


@admin.register(MatterNote)
class MatterNoteAdmin(admin.ModelAdmin):
    list_display = ('matter', 'author', 'is_private', 'created_at')
    list_filter = ('is_private', 'created_at')
    search_fields = ('content', 'matter__title', 'author__email')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MatterStatusHistory)
class MatterStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('matter', 'from_status', 'to_status', 'changed_by', 'created_at')
    list_filter = ('from_status', 'to_status', 'created_at')
    search_fields = ('matter__title', 'notes')
    readonly_fields = ('matter', 'from_status', 'to_status', 'changed_by', 'notes', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
