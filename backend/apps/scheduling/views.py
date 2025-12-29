from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta, time

from .models import Appointment, CalendarIntegration, BlockedTime
from .serializers import (
    AppointmentSerializer, CreateAppointmentSerializer,
    RescheduleAppointmentSerializer, CalendarIntegrationSerializer,
    BlockedTimeSerializer, AvailableSlotsSerializer
)
from apps.attorneys.views import IsAttorney, IsClient
from apps.attorneys.models import AttorneyAvailability


class AppointmentListView(generics.ListAPIView):
    """List appointments for current user."""

    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Appointment.objects.filter(
                attorney__user=user
            ).select_related('client', 'attorney__user', 'matter')
        return Appointment.objects.filter(
            client=user
        ).select_related('attorney__user', 'matter')


class AppointmentCreateView(generics.CreateAPIView):
    """Create a new appointment."""

    serializer_class = CreateAppointmentSerializer
    permission_classes = [IsClient]


class AppointmentDetailView(generics.RetrieveAPIView):
    """Get appointment details."""

    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Appointment.objects.filter(attorney__user=user)
        return Appointment.objects.filter(client=user)


class AppointmentConfirmView(APIView):
    """Confirm an appointment (attorney only)."""

    permission_classes = [IsAttorney]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk,
                attorney__user=request.user,
                status=Appointment.AppointmentStatus.PENDING
            )
        except Appointment.DoesNotExist:
            return Response(
                {'detail': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        appointment.status = Appointment.AppointmentStatus.CONFIRMED
        appointment.confirmed_at = timezone.now()
        appointment.save()

        return Response(AppointmentSerializer(appointment).data)


class AppointmentCancelView(APIView):
    """Cancel an appointment."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        query = Q(pk=pk)

        if user.user_type == 'attorney':
            query &= Q(attorney__user=user)
        else:
            query &= Q(client=user)

        try:
            appointment = Appointment.objects.get(
                query,
                status__in=['pending', 'confirmed']
            )
        except Appointment.DoesNotExist:
            return Response(
                {'detail': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        appointment.status = Appointment.AppointmentStatus.CANCELLED
        appointment.cancelled_at = timezone.now()
        appointment.cancellation_reason = request.data.get('reason', '')
        appointment.save()

        return Response(AppointmentSerializer(appointment).data)


class AppointmentRescheduleView(APIView):
    """Reschedule an appointment."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        query = Q(pk=pk)

        if user.user_type == 'attorney':
            query &= Q(attorney__user=user)
        else:
            query &= Q(client=user)

        try:
            appointment = Appointment.objects.get(
                query,
                status__in=['pending', 'confirmed']
            )
        except Appointment.DoesNotExist:
            return Response(
                {'detail': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = RescheduleAppointmentSerializer(
            appointment,
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        appointment.date = data['date']
        appointment.start_time = data['start_time']
        appointment.end_time = data['end_time']
        appointment.duration_minutes = data['duration_minutes']
        appointment.status = Appointment.AppointmentStatus.RESCHEDULED
        appointment.save()

        return Response(AppointmentSerializer(appointment).data)


class AppointmentCompleteView(APIView):
    """Mark appointment as completed (attorney only)."""

    permission_classes = [IsAttorney]

    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk,
                attorney__user=request.user,
                status=Appointment.AppointmentStatus.CONFIRMED
            )
        except Appointment.DoesNotExist:
            return Response(
                {'detail': 'Appointment not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        appointment.status = Appointment.AppointmentStatus.COMPLETED
        appointment.attorney_notes = request.data.get('notes', appointment.attorney_notes)
        appointment.save()

        return Response(AppointmentSerializer(appointment).data)


class AvailableSlotsView(APIView):
    """Get available time slots for an attorney."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AvailableSlotsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        from apps.attorneys.models import AttorneyProfile

        try:
            attorney = AttorneyProfile.objects.get(user_id=data['attorney_id'])
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        date = data['date']
        duration = data['duration_minutes']

        # Get attorney's availability for this day of week
        day_of_week = date.weekday()
        availability = AttorneyAvailability.objects.filter(
            attorney=attorney,
            day_of_week=day_of_week,
            is_active=True
        )

        if not availability.exists():
            return Response({'slots': []})

        # Get existing appointments
        existing = Appointment.objects.filter(
            attorney=attorney,
            date=date,
            status__in=['pending', 'confirmed']
        ).values_list('start_time', 'end_time')

        # Get blocked times
        date_start = timezone.make_aware(datetime.combine(date, time.min))
        date_end = timezone.make_aware(datetime.combine(date, time.max))
        blocked = BlockedTime.objects.filter(
            attorney=attorney,
            start_datetime__lt=date_end,
            end_datetime__gt=date_start
        )

        # Generate available slots
        slots = []
        slot_duration = timedelta(minutes=duration)

        for avail in availability:
            current = datetime.combine(date, avail.start_time)
            end = datetime.combine(date, avail.end_time)

            while current + slot_duration <= end:
                slot_start = current.time()
                slot_end = (current + slot_duration).time()

                # Check if slot conflicts with existing appointments
                is_available = True
                for appt_start, appt_end in existing:
                    if not (slot_end <= appt_start or slot_start >= appt_end):
                        is_available = False
                        break

                # Check blocked times
                if is_available:
                    slot_start_dt = timezone.make_aware(current)
                    slot_end_dt = timezone.make_aware(current + slot_duration)
                    for block in blocked:
                        if not (slot_end_dt <= block.start_datetime or slot_start_dt >= block.end_datetime):
                            is_available = False
                            break

                if is_available:
                    slots.append({
                        'start_time': slot_start.strftime('%H:%M'),
                        'end_time': slot_end.strftime('%H:%M'),
                        'is_available': True
                    })

                current += slot_duration

        return Response({'slots': slots})


class UpcomingAppointmentsView(generics.ListAPIView):
    """List upcoming appointments."""

    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        today = timezone.now().date()

        if user.user_type == 'attorney':
            return Appointment.objects.filter(
                attorney__user=user,
                date__gte=today,
                status__in=['pending', 'confirmed']
            ).select_related('client', 'matter').order_by('date', 'start_time')[:10]

        return Appointment.objects.filter(
            client=user,
            date__gte=today,
            status__in=['pending', 'confirmed']
        ).select_related('attorney__user', 'matter').order_by('date', 'start_time')[:10]


class CalendarIntegrationListView(generics.ListAPIView):
    """List user's calendar integrations."""

    serializer_class = CalendarIntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CalendarIntegration.objects.filter(user=self.request.user)


class BlockedTimeListCreateView(generics.ListCreateAPIView):
    """List and create blocked times (attorney only)."""

    serializer_class = BlockedTimeSerializer
    permission_classes = [IsAttorney]

    def get_queryset(self):
        return BlockedTime.objects.filter(attorney__user=self.request.user)

    def perform_create(self, serializer):
        from apps.attorneys.models import AttorneyProfile
        attorney = AttorneyProfile.objects.get(user=self.request.user)
        serializer.save(attorney=attorney)


class BlockedTimeDeleteView(generics.DestroyAPIView):
    """Delete a blocked time."""

    permission_classes = [IsAttorney]

    def get_queryset(self):
        return BlockedTime.objects.filter(attorney__user=self.request.user)
