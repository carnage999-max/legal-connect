from rest_framework import serializers
from .models import AttorneyClientRecord, ConflictCheck, ConflictDetail


class AttorneyClientRecordSerializer(serializers.ModelSerializer):
    """Serializer for attorney client records."""

    class Meta:
        model = AttorneyClientRecord
        fields = [
            'id', 'relationship_type', 'start_date', 'end_date',
            'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AttorneyClientRecordCreateSerializer(serializers.Serializer):
    """Serializer for adding client records."""

    name = serializers.CharField(max_length=255)
    relationship_type = serializers.ChoiceField(
        choices=AttorneyClientRecord.RelationshipType.choices
    )
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class BulkClientImportSerializer(serializers.Serializer):
    """Serializer for bulk importing client names."""

    names = serializers.ListField(
        child=serializers.CharField(max_length=255),
        min_length=1
    )
    relationship_type = serializers.ChoiceField(
        choices=AttorneyClientRecord.RelationshipType.choices
    )


class ConflictDetailSerializer(serializers.ModelSerializer):
    """Serializer for conflict details."""

    attorney_name = serializers.CharField(source='attorney.user.full_name', read_only=True)

    class Meta:
        model = ConflictDetail
        fields = [
            'id', 'attorney', 'attorney_name',
            'conflict_type', 'description', 'created_at'
        ]


class ConflictCheckSerializer(serializers.ModelSerializer):
    """Serializer for conflict check results."""

    details = ConflictDetailSerializer(many=True, read_only=True)
    excluded_attorney_count = serializers.SerializerMethodField()
    checked_attorney_count = serializers.SerializerMethodField()

    class Meta:
        model = ConflictCheck
        fields = [
            'id', 'matter', 'status', 'result',
            'names_checked_count', 'checked_attorney_count',
            'excluded_attorney_count', 'started_at', 'completed_at',
            'processing_time_ms', 'details', 'created_at'
        ]

    def get_excluded_attorney_count(self, obj):
        return obj.excluded_attorneys.count()

    def get_checked_attorney_count(self, obj):
        return obj.attorneys_checked.count()


class ConflictCheckRequestSerializer(serializers.Serializer):
    """Serializer for requesting a conflict check."""

    matter_id = serializers.UUIDField()

    def validate_matter_id(self, value):
        from apps.matters.models import Matter
        try:
            matter = Matter.objects.get(pk=value)
            if matter.conflict_check_completed:
                raise serializers.ValidationError(
                    "Conflict check already completed for this matter."
                )
            return value
        except Matter.DoesNotExist:
            raise serializers.ValidationError("Matter not found.")
