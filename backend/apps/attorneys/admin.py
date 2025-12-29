from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import (
    PracticeArea, Jurisdiction, AttorneyProfile,
    AttorneyReview, AttorneyAvailability
)


@admin.register(PracticeArea)
class PracticeAreaAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Jurisdiction)
class JurisdictionAdmin(admin.ModelAdmin):
    list_display = ('name', 'state_code', 'country', 'is_active')
    list_filter = ('country', 'is_active')
    search_fields = ('name', 'state_code')


@admin.register(AttorneyProfile)
class AttorneyProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'bar_state', 'verification_status',
        'is_accepting_clients', 'rating', 'created_at'
    )
    list_filter = (
        'verification_status', 'is_accepting_clients',
        'bar_state', 'fee_structure', 'malpractice_insurance'
    )
    search_fields = (
        'user__email', 'user__first_name', 'user__last_name',
        'bar_number', 'office_city'
    )
    readonly_fields = ('created_at', 'updated_at', 'rating', 'total_reviews', 'total_cases_completed')
    filter_horizontal = ('practice_areas', 'jurisdictions')

    fieldsets = (
        (None, {
            'fields': ('user',)
        }),
        (_('Bar Information'), {
            'fields': ('bar_number', 'bar_state', 'bar_admission_date', 'years_of_experience')
        }),
        (_('Profile'), {
            'fields': ('headline', 'biography', 'education', 'languages')
        }),
        (_('Practice Areas & Jurisdictions'), {
            'fields': ('practice_areas', 'jurisdictions')
        }),
        (_('Fees'), {
            'fields': ('fee_structure', 'hourly_rate', 'consultation_fee', 'free_consultation')
        }),
        (_('Insurance'), {
            'fields': ('malpractice_insurance', 'insurance_carrier', 'insurance_policy_number', 'insurance_expiry')
        }),
        (_('Verification'), {
            'fields': ('verification_status', 'verified_at', 'verified_by', 'rejection_reason')
        }),
        (_('Documents'), {
            'fields': ('bar_license_document', 'insurance_document')
        }),
        (_('Availability'), {
            'fields': ('is_accepting_clients', 'max_active_cases')
        }),
        (_('Statistics'), {
            'fields': ('rating', 'total_reviews', 'total_cases_completed')
        }),
        (_('Office'), {
            'fields': ('office_address', 'office_city', 'office_state', 'office_postal_code', 'office_phone')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(AttorneyReview)
class AttorneyReviewAdmin(admin.ModelAdmin):
    list_display = ('attorney', 'client', 'rating', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'rating', 'created_at')
    search_fields = (
        'attorney__user__email', 'client__email',
        'review_text'
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AttorneyAvailability)
class AttorneyAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('attorney', 'day_of_week', 'start_time', 'end_time', 'is_active')
    list_filter = ('day_of_week', 'is_active')
    search_fields = ('attorney__user__email', 'attorney__user__first_name')
