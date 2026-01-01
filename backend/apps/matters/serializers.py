from rest_framework import serializers
from django.db import transaction
from django.utils import timezone

from .models import Matter, MatterParty, MatterNote, MatterStatusHistory
from apps.attorneys.serializers import (
    AttorneyProfileListSerializer,
    PracticeAreaSerializer,
    JurisdictionSerializer
)


class MatterPartySerializer(serializers.ModelSerializer):
    """Serializer for matter parties."""

    class Meta:
        model = MatterParty
        fields = ['id', 'name', 'party_type', 'role', 'additional_info', 'created_at']
        read_only_fields = ['id', 'created_at']


class MatterPartyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating matter parties."""

    class Meta:
        model = MatterParty
        fields = ['name', 'party_type', 'role', 'additional_info']

    def create(self, validated_data):
        import hashlib
        validated_data['name_hash'] = hashlib.sha256(
            validated_data['name'].lower().strip().encode()
        ).hexdigest()
        return super().create(validated_data)


class MatterNoteSerializer(serializers.ModelSerializer):
    """Serializer for matter notes."""

    author_name = serializers.CharField(source='author.full_name', read_only=True)

    class Meta:
        model = MatterNote
        fields = ['id', 'author', 'author_name', 'content', 'is_private', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class MatterStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for matter status history."""

    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)

    class Meta:
        model = MatterStatusHistory
        fields = ['id', 'from_status', 'to_status', 'notes', 'changed_by_name', 'created_at']


class MatterListSerializer(serializers.ModelSerializer):
    """Serializer for matter list view."""

    client_name = serializers.CharField(source='client.full_name', read_only=True)
    attorney_name = serializers.SerializerMethodField()
    practice_area_name = serializers.CharField(source='practice_area.name', read_only=True)

    class Meta:
        model = Matter
        fields = [
            'id', 'title', 'matter_type', 'status',
            'client_name', 'attorney_name', 'practice_area_name',
            'next_action_date', 'next_action_description',
            'created_at', 'updated_at'
        ]

    def get_attorney_name(self, obj):
        if obj.attorney:
            return obj.attorney.user.full_name
        return None


class MatterDetailSerializer(serializers.ModelSerializer):
    """Serializer for matter detail view."""

    client_name = serializers.CharField(source='client.full_name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    attorney = AttorneyProfileListSerializer(read_only=True)
    practice_area = PracticeAreaSerializer(read_only=True)
    jurisdiction = JurisdictionSerializer(read_only=True)
    parties = MatterPartySerializer(many=True, read_only=True)
    status_history = MatterStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Matter
        fields = [
            'id', 'title', 'matter_type', 'description', 'client_role',
            'client_name', 'client_email', 'attorney',
            'jurisdiction_type', 'jurisdiction_state',
            'jurisdiction', 'jurisdiction_details', 'practice_area',
            'status', 'status_notes',
            'incident_date', 'statute_of_limitations',
            'next_action_date', 'next_action_description',
            'conflict_check_completed', 'conflict_check_passed',
            'estimated_fee', 'agreed_fee', 'fee_structure',
            'parties', 'status_history',
            'created_at', 'updated_at', 'submitted_at', 'assigned_at', 'completed_at'
        ]


class MatterCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new matter (intake step 1-3)."""

    parties = MatterPartyCreateSerializer(many=True, required=False)

    class Meta:
        model = Matter
        fields = [
            'id',
            'title', 'matter_type', 'description', 'client_role',
            'jurisdiction_type', 'jurisdiction_state',
            'jurisdiction', 'jurisdiction_details', 'practice_area',
            'incident_date', 'statute_of_limitations',
            'parties'
        ]

    @transaction.atomic
    def create(self, validated_data):
        parties_data = validated_data.pop('parties', [])

        # Set client if available (authenticated user), otherwise leave null for public intake
        request_user = self.context['request'].user if 'request' in self.context else None
        if request_user and getattr(request_user, 'is_authenticated', False):
            validated_data['client'] = request_user

        # Ensure title exists for model constraints
        if not validated_data.get('title'):
            # Build a sensible short title from matter type / description
            mt = validated_data.get('matter_type') or 'Matter'
            desc = (validated_data.get('description') or '').strip().split('\n')[0][:60]
            validated_data['title'] = f"{mt.capitalize()}: {desc or 'Intake'}"

        validated_data['status'] = Matter.MatterStatus.DRAFT

        matter = Matter.objects.create(**validated_data)

        for party_data in parties_data:
            import hashlib
            party_data['name_hash'] = hashlib.sha256(
                party_data['name'].lower().strip().encode()
            ).hexdigest()
            MatterParty.objects.create(matter=matter, **party_data)

        return matter


class MatterUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a matter."""

    class Meta:
        model = Matter
        fields = [
            'title', 'description', 'client_role',
            'jurisdiction_type', 'jurisdiction_state',
            'jurisdiction', 'jurisdiction_details', 'practice_area',
            'incident_date', 'statute_of_limitations',
            'next_action_date', 'next_action_description',
            'status_notes'
        ]


class MatterSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a matter for review."""

    def validate(self, data):
        matter = self.instance
        if matter.status != Matter.MatterStatus.DRAFT:
            raise serializers.ValidationError(
                "Only draft matters can be submitted."
            )
        # For public intake, allow submission without parties
        # Parties are optional for anonymous/public intakes
        return data

    def update(self, instance, validated_data):
        instance.status = Matter.MatterStatus.PENDING
        instance.submitted_at = timezone.now()
        instance.save()

        # Only create status history if user is authenticated
        request_user = self.context.get('request').user if self.context.get('request') else None
        if request_user and request_user.is_authenticated:
            MatterStatusHistory.objects.create(
                matter=instance,
                from_status=Matter.MatterStatus.DRAFT,
                to_status=Matter.MatterStatus.PENDING,
                changed_by=request_user,
                notes='Matter submitted for review'
            )
        else:
            # For anonymous submissions, create without changed_by
            MatterStatusHistory.objects.create(
                matter=instance,
                from_status=Matter.MatterStatus.DRAFT,
                to_status=Matter.MatterStatus.PENDING,
                changed_by=None,
                notes='Anonymous intake submission'
            )

        return instance


class MatterStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating matter status."""

    status = serializers.ChoiceField(choices=Matter.MatterStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_status(self, value):
        matter = self.instance
        valid_transitions = {
            Matter.MatterStatus.DRAFT: [Matter.MatterStatus.PENDING, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.PENDING: [Matter.MatterStatus.CONFLICT_CHECK, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.CONFLICT_CHECK: [Matter.MatterStatus.MATCHING, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.MATCHING: [Matter.MatterStatus.OPEN, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.OPEN: [Matter.MatterStatus.IN_PROGRESS, Matter.MatterStatus.ON_HOLD, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.IN_PROGRESS: [Matter.MatterStatus.ON_HOLD, Matter.MatterStatus.COMPLETED, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.ON_HOLD: [Matter.MatterStatus.IN_PROGRESS, Matter.MatterStatus.CANCELLED],
            Matter.MatterStatus.COMPLETED: [Matter.MatterStatus.CLOSED],
        }

        if value not in valid_transitions.get(matter.status, []):
            raise serializers.ValidationError(
                f"Cannot transition from {matter.status} to {value}"
            )
        return value

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data['status']
        notes = validated_data.get('notes', '')

        instance.status = new_status
        instance.status_notes = notes

        if new_status == Matter.MatterStatus.COMPLETED:
            instance.completed_at = timezone.now()

        instance.save()

        MatterStatusHistory.objects.create(
            matter=instance,
            from_status=old_status,
            to_status=new_status,
            changed_by=self.context['request'].user,
            notes=notes
        )

        return instance


class MatterAssignAttorneySerializer(serializers.Serializer):
    """Serializer for assigning an attorney to a matter."""

    attorney_id = serializers.UUIDField()

    def validate_attorney_id(self, value):
        from apps.attorneys.models import AttorneyProfile
        try:
            attorney = AttorneyProfile.objects.get(
                user_id=value,
                verification_status='verified'
            )
            if not attorney.can_accept_cases:
                raise serializers.ValidationError(
                    "This attorney is not accepting new cases."
                )
            return value
        except AttorneyProfile.DoesNotExist:
            raise serializers.ValidationError("Attorney not found.")

    def update(self, instance, validated_data):
        from apps.attorneys.models import AttorneyProfile

        attorney = AttorneyProfile.objects.get(user_id=validated_data['attorney_id'])
        instance.attorney = attorney
        instance.assigned_at = timezone.now()
        instance.status = Matter.MatterStatus.OPEN
        instance.save()

        MatterStatusHistory.objects.create(
            matter=instance,
            from_status=instance.status,
            to_status=Matter.MatterStatus.OPEN,
            changed_by=self.context['request'].user,
            notes=f'Assigned to {attorney.user.full_name}'
        )

        return instance
