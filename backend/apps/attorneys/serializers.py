from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model

from .models import (
    AttorneyProfile, PracticeArea, Jurisdiction,
    AttorneyReview, AttorneyAvailability
)

User = get_user_model()


class PracticeAreaSerializer(serializers.ModelSerializer):
    """Serializer for practice areas."""

    class Meta:
        model = PracticeArea
        fields = ['id', 'name', 'slug', 'description']


class JurisdictionSerializer(serializers.ModelSerializer):
    """Serializer for jurisdictions."""

    class Meta:
        model = Jurisdiction
        fields = ['id', 'name', 'state_code', 'country']


class AttorneyUserSerializer(serializers.ModelSerializer):
    """Minimal user serializer for attorney listings."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'avatar', 'phone_number']


class AttorneyAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for attorney availability slots."""

    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = AttorneyAvailability
        fields = ['id', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_active']


class AttorneyProfileListSerializer(serializers.ModelSerializer):
    """Serializer for attorney listings (public view)."""

    user = AttorneyUserSerializer(read_only=True)
    practice_areas = PracticeAreaSerializer(many=True, read_only=True)
    jurisdictions = JurisdictionSerializer(many=True, read_only=True)

    class Meta:
        model = AttorneyProfile
        fields = [
            'user', 'headline', 'biography', 'years_of_experience',
            'practice_areas', 'jurisdictions', 'fee_structure',
            'hourly_rate', 'consultation_fee', 'free_consultation',
            'rating', 'total_reviews', 'is_accepting_clients',
            'office_city', 'office_state'
        ]


class AttorneyProfileDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for attorney profile (public view)."""

    user = AttorneyUserSerializer(read_only=True)
    practice_areas = PracticeAreaSerializer(many=True, read_only=True)
    jurisdictions = JurisdictionSerializer(many=True, read_only=True)
    availability_slots = AttorneyAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = AttorneyProfile
        fields = [
            'user', 'bar_state', 'bar_admission_date', 'years_of_experience',
            'headline', 'biography', 'education', 'languages',
            'practice_areas', 'jurisdictions',
            'fee_structure', 'hourly_rate', 'consultation_fee', 'free_consultation',
            'rating', 'total_reviews', 'total_cases_completed',
            'is_accepting_clients', 'office_city', 'office_state',
            'availability_slots', 'created_at'
        ]


class AttorneyProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for attorneys to update their own profile."""

    practice_area_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    jurisdiction_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = AttorneyProfile
        fields = [
            'headline', 'biography', 'education', 'languages',
            'practice_area_ids', 'jurisdiction_ids',
            'fee_structure', 'hourly_rate', 'consultation_fee', 'free_consultation',
            'is_accepting_clients', 'max_active_cases',
            'office_address', 'office_city', 'office_state',
            'office_postal_code', 'office_phone'
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        practice_area_ids = validated_data.pop('practice_area_ids', None)
        jurisdiction_ids = validated_data.pop('jurisdiction_ids', None)

        instance = super().update(instance, validated_data)

        if practice_area_ids is not None:
            instance.practice_areas.set(
                PracticeArea.objects.filter(id__in=practice_area_ids)
            )

        if jurisdiction_ids is not None:
            instance.jurisdictions.set(
                Jurisdiction.objects.filter(id__in=jurisdiction_ids)
            )

        return instance


class AttorneyOnboardingSerializer(serializers.ModelSerializer):
    """Serializer for attorney onboarding/registration."""

    practice_area_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True
    )
    jurisdiction_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True
    )

    class Meta:
        model = AttorneyProfile
        fields = [
            'bar_number', 'bar_state', 'bar_admission_date',
            'years_of_experience', 'headline', 'biography',
            'education', 'languages',
            'practice_area_ids', 'jurisdiction_ids',
            'fee_structure', 'hourly_rate', 'consultation_fee', 'free_consultation',
            'malpractice_insurance', 'insurance_carrier',
            'insurance_policy_number', 'insurance_expiry',
            'bar_license_document', 'insurance_document',
            'office_address', 'office_city', 'office_state',
            'office_postal_code', 'office_phone'
        ]

    @transaction.atomic
    def create(self, validated_data):
        practice_area_ids = validated_data.pop('practice_area_ids', [])
        jurisdiction_ids = validated_data.pop('jurisdiction_ids', [])

        profile = AttorneyProfile.objects.create(**validated_data)

        profile.practice_areas.set(
            PracticeArea.objects.filter(id__in=practice_area_ids)
        )
        profile.jurisdictions.set(
            Jurisdiction.objects.filter(id__in=jurisdiction_ids)
        )

        return profile


class AttorneyReviewSerializer(serializers.ModelSerializer):
    """Serializer for attorney reviews."""

    client_name = serializers.SerializerMethodField()

    class Meta:
        model = AttorneyReview
        fields = [
            'id', 'attorney', 'client_name', 'rating',
            'review_text', 'is_anonymous', 'created_at'
        ]
        read_only_fields = ['id', 'attorney', 'created_at']

    def get_client_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.client.full_name


class AttorneyReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attorney reviews."""

    class Meta:
        model = AttorneyReview
        fields = ['attorney', 'matter', 'rating', 'review_text', 'is_anonymous']

    def validate(self, data):
        request = self.context.get('request')
        if data.get('matter'):
            # Verify the client is associated with this matter
            if data['matter'].client != request.user:
                raise serializers.ValidationError(
                    "You can only review attorneys for your own matters."
                )
            # Verify this attorney was assigned to the matter
            if data['matter'].attorney != data['attorney']:
                raise serializers.ValidationError(
                    "This attorney is not assigned to this matter."
                )
        return data

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)


class AttorneySearchSerializer(serializers.Serializer):
    """Serializer for attorney search parameters."""

    practice_area = serializers.UUIDField(required=False)
    jurisdiction = serializers.UUIDField(required=False)
    min_rating = serializers.DecimalField(
        max_digits=3, decimal_places=2, required=False
    )
    max_hourly_rate = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    free_consultation = serializers.BooleanField(required=False)
    available_now = serializers.BooleanField(required=False)
    search = serializers.CharField(required=False, max_length=200)
