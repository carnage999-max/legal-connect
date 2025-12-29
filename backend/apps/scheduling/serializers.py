from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Appointment, CalendarIntegration, BlockedTime


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for appointments."""

    client_name = serializers.CharField(source='client.full_name', read_only=True)
    attorney_name = serializers.SerializerMethodField()
    matter_title = serializers.CharField(source='matter.title', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'client', 'client_name', 'attorney', 'attorney_name',
            'matter', 'matter_title', 'appointment_type', 'meeting_type',
            'status', 'date', 'start_time', 'end_time', 'duration_minutes',
            'timezone', 'location', 'meeting_link',
            'client_notes', 'attorney_notes', 'fee', 'is_paid',
            'created_at', 'confirmed_at', 'cancelled_at'
        ]
        read_only_fields = [
            'id', 'client', 'created_at', 'confirmed_at', 'cancelled_at'
        ]

    def get_attorney_name(self, obj):
        return obj.attorney.user.full_name


class CreateAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments."""

    class Meta:
        model = Appointment
        fields = [
            'attorney', 'matter', 'appointment_type', 'meeting_type',
            'date', 'start_time', 'duration_minutes', 'timezone',
            'location', 'client_notes'
        ]

    def validate(self, data):
        # Calculate end time
        start = datetime.combine(data['date'], data['start_time'])
        duration = timedelta(minutes=data.get('duration_minutes', 30))
        data['end_time'] = (start + duration).time()

        # Check attorney availability
        attorney = data['attorney']

        # Check for conflicting appointments
        conflicts = Appointment.objects.filter(
            attorney=attorney,
            date=data['date'],
            status__in=['pending', 'confirmed']
        ).exclude(
            end_time__lte=data['start_time']
        ).exclude(
            start_time__gte=data['end_time']
        )

        if conflicts.exists():
            raise serializers.ValidationError(
                "This time slot is not available."
            )

        # Check blocked times
        start_dt = timezone.make_aware(start)
        end_dt = timezone.make_aware(datetime.combine(data['date'], data['end_time']))

        blocked = BlockedTime.objects.filter(
            attorney=attorney,
            start_datetime__lt=end_dt,
            end_datetime__gt=start_dt
        )

        if blocked.exists():
            raise serializers.ValidationError(
                "The attorney is not available during this time."
            )

        return data

    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        validated_data['fee'] = validated_data['attorney'].consultation_fee
        return super().create(validated_data)


class RescheduleAppointmentSerializer(serializers.Serializer):
    """Serializer for rescheduling appointments."""

    date = serializers.DateField()
    start_time = serializers.TimeField()
    duration_minutes = serializers.IntegerField(default=30, min_value=15)

    def validate(self, data):
        appointment = self.instance

        # Calculate end time
        start = datetime.combine(data['date'], data['start_time'])
        duration = timedelta(minutes=data['duration_minutes'])
        data['end_time'] = (start + duration).time()

        # Check for conflicts (excluding current appointment)
        conflicts = Appointment.objects.filter(
            attorney=appointment.attorney,
            date=data['date'],
            status__in=['pending', 'confirmed']
        ).exclude(pk=appointment.pk).exclude(
            end_time__lte=data['start_time']
        ).exclude(
            start_time__gte=data['end_time']
        )

        if conflicts.exists():
            raise serializers.ValidationError(
                "This time slot is not available."
            )

        return data


class CalendarIntegrationSerializer(serializers.ModelSerializer):
    """Serializer for calendar integrations."""

    class Meta:
        model = CalendarIntegration
        fields = [
            'id', 'provider', 'is_active', 'sync_enabled',
            'calendar_id', 'created_at', 'last_synced_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_synced_at']


class BlockedTimeSerializer(serializers.ModelSerializer):
    """Serializer for blocked times."""

    class Meta:
        model = BlockedTime
        fields = [
            'id', 'start_datetime', 'end_datetime',
            'is_recurring', 'recurrence_rule', 'reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AvailableSlotsSerializer(serializers.Serializer):
    """Serializer for available time slots request."""

    attorney_id = serializers.UUIDField()
    date = serializers.DateField()
    duration_minutes = serializers.IntegerField(default=30, min_value=15)


class TimeSlotSerializer(serializers.Serializer):
    """Serializer for time slot response."""

    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    is_available = serializers.BooleanField()
