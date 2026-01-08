from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q

from .models import Matter, MatterParty, MatterNote, MatterStatusHistory
from .serializers import (
    MatterListSerializer, MatterDetailSerializer,
    MatterCreateSerializer, MatterUpdateSerializer,
    MatterSubmitSerializer, MatterStatusUpdateSerializer,
    MatterAssignAttorneySerializer,
    MatterPartySerializer, MatterPartyCreateSerializer,
    MatterNoteSerializer
)
from apps.attorneys.views import IsAttorney, IsClient


class MatterListCreateView(generics.ListCreateAPIView):
    """List matters for current user or create a new matter."""

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'status', 'next_action_date']
    ordering = ['-created_at']

    def get_permissions(self):
        # Allow unauthenticated POST for public intake
        if self.request.method == 'POST':
            return []
        # Require authentication for GET/LIST
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MatterCreateSerializer
        return MatterListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            # Attorneys see matters assigned to them
            return Matter.objects.filter(
                attorney__user=user
            ).select_related('client', 'attorney', 'practice_area')
        else:
            # Clients see their own matters
            return Matter.objects.filter(
                client=user
            ).select_related('attorney', 'practice_area')


class MatterDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a matter."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return MatterUpdateSerializer
        return MatterDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'attorney':
            return Matter.objects.filter(
                attorney__user=user
            ).select_related('client', 'attorney', 'practice_area', 'jurisdiction')
        else:
            return Matter.objects.filter(
                client=user
            ).select_related('attorney', 'practice_area', 'jurisdiction')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status not in [Matter.MatterStatus.DRAFT, Matter.MatterStatus.CANCELLED]:
            return Response(
                {'detail': 'Only draft or cancelled matters can be deleted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class MatterSubmitView(APIView):
    """Submit a matter for review and conflict checking."""

    permission_classes = []

    def post(self, request, pk):
        try:
            matter = Matter.objects.get(pk=pk)
        except Matter.DoesNotExist:
            return Response(
                {'detail': 'Matter not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # If matter has a client, verify ownership
        if matter.client and (not request.user.is_authenticated or matter.client != request.user):
            return Response(
                {'detail': 'You do not have permission to submit this matter.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MatterSubmitSerializer(
            matter,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        matter = serializer.save()

        return Response(MatterDetailSerializer(matter).data)


class MatterStatusUpdateView(APIView):
    """Update matter status."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        query = Q(pk=pk)

        if user.user_type == 'attorney':
            query &= Q(attorney__user=user)
        else:
            query &= Q(client=user)

        try:
            matter = Matter.objects.get(query)
        except Matter.DoesNotExist:
            return Response(
                {'detail': 'Matter not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MatterStatusUpdateSerializer(
            matter,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        matter = serializer.save()

        return Response(MatterDetailSerializer(matter).data)


class MatterAssignAttorneyView(APIView):
    """Assign an attorney to a matter."""

    permission_classes = [IsClient]

    def post(self, request, pk):
        try:
            matter = Matter.objects.get(
                pk=pk,
                client=request.user,
                status__in=[Matter.MatterStatus.MATCHING, Matter.MatterStatus.PENDING]
            )
        except Matter.DoesNotExist:
            return Response(
                {'detail': 'Matter not found or not ready for attorney assignment.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MatterAssignAttorneySerializer(
            matter,
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        matter = serializer.save()

        return Response(MatterDetailSerializer(matter).data)


class MatterPartyListCreateView(generics.ListCreateAPIView):
    """List or add parties to a matter."""

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MatterPartyCreateSerializer
        return MatterPartySerializer

    def get_queryset(self):
        matter_id = self.kwargs['matter_id']
        return MatterParty.objects.filter(
            matter_id=matter_id,
            matter__client=self.request.user
        )

    def perform_create(self, serializer):
        matter_id = self.kwargs['matter_id']
        matter = Matter.objects.get(pk=matter_id, client=self.request.user)
        serializer.save(matter=matter)


class MatterPartyDeleteView(generics.DestroyAPIView):
    """Delete a party from a matter."""

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        matter_id = self.kwargs['matter_id']
        return MatterParty.objects.filter(
            matter_id=matter_id,
            matter__client=self.request.user
        )


class MatterNoteListCreateView(generics.ListCreateAPIView):
    """List or add notes to a matter."""

    serializer_class = MatterNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        matter_id = self.kwargs['matter_id']
        user = self.request.user

        base_query = MatterNote.objects.filter(matter_id=matter_id)

        # Filter based on user type and visibility
        if user.user_type == 'attorney':
            # Attorneys can see their own private notes and all non-private notes
            return base_query.filter(
                Q(is_private=False) | Q(author=user)
            ).select_related('author')
        else:
            # Clients can see their own private notes and all non-private notes
            return base_query.filter(
                Q(is_private=False) | Q(author=user)
            ).select_related('author')

    def perform_create(self, serializer):
        matter_id = self.kwargs['matter_id']
        serializer.save(
            matter_id=matter_id,
            author=self.request.user
        )


class ClientDashboardView(APIView):
    """Dashboard data for clients."""

    permission_classes = [IsClient]

    def get(self, request):
        user = request.user

        # Get matter stats
        active_matters = Matter.objects.filter(
            client=user,
            status__in=['open', 'in_progress', 'pending', 'matching']
        ).count()

        # Get upcoming appointments
        from apps.scheduling.models import Appointment
        from django.utils import timezone

        upcoming_appointments = Appointment.objects.filter(
            client=user,
            date__gte=timezone.now().date(),
            status='confirmed'
        ).count()

        # Get unread messages count
        from apps.messaging.models import Message
        unread_messages = Message.objects.filter(
            conversation__participants=user,
            is_read=False
        ).exclude(sender=user).count()

        # Get recent matters
        recent_matters = Matter.objects.filter(
            client=user
        ).select_related('attorney', 'practice_area').order_by('-updated_at')[:5]

        return Response({
            'active_matters': active_matters,
            'upcoming_appointments': upcoming_appointments,
            'unread_messages': unread_messages,
            'recent_matters': MatterListSerializer(recent_matters, many=True).data
        })


class AttorneyNewRequestsView(generics.ListAPIView):
    """List new matter requests for attorney."""

    serializer_class = MatterListSerializer
    permission_classes = [IsAttorney]

    def get_queryset(self):
        status_filter = self.request.query_params.get('status', 'pending')

        if status_filter == 'accepted':
            statuses = [Matter.MatterStatus.OPEN, Matter.MatterStatus.IN_PROGRESS]
        elif status_filter == 'declined':
            statuses = [Matter.MatterStatus.CANCELLED]
        else:  # pending
            statuses = [Matter.MatterStatus.PENDING]

        return Matter.objects.filter(
            attorney__user=self.request.user,
            status__in=statuses
        ).select_related('client', 'practice_area')


class AttorneyRespondToMatterView(APIView):
    """Attorney accepts or declines a matter request."""

    permission_classes = [IsAttorney]

    def post(self, request, pk):
        from apps.attorneys.models import AttorneyProfile

        try:
            attorney_profile = AttorneyProfile.objects.get(user=request.user)
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            matter = Matter.objects.get(
                pk=pk,
                attorney=attorney_profile,
                status=Matter.MatterStatus.PENDING
            )
        except Matter.DoesNotExist:
            return Response(
                {'detail': 'Matter not found or not pending.'},
                status=status.HTTP_404_NOT_FOUND
            )

        action = request.data.get('action')
        reason = request.data.get('reason', '')

        if action == 'accept':
            matter.status = Matter.MatterStatus.OPEN
            matter.save()

            # Create status history
            MatterStatusHistory.objects.create(
                matter=matter,
                old_status=Matter.MatterStatus.PENDING,
                new_status=Matter.MatterStatus.OPEN,
                changed_by=request.user,
                notes='Attorney accepted the matter.'
            )

            return Response({
                'detail': 'Matter accepted successfully.',
                'matter': MatterDetailSerializer(matter).data
            })

        elif action == 'decline':
            # Remove attorney from matter, set back to matching
            matter.attorney = None
            matter.status = Matter.MatterStatus.MATCHING
            matter.save()

            # Create status history
            MatterStatusHistory.objects.create(
                matter=matter,
                old_status=Matter.MatterStatus.PENDING,
                new_status=Matter.MatterStatus.MATCHING,
                changed_by=request.user,
                notes=f'Attorney declined. Reason: {reason}' if reason else 'Attorney declined.'
            )

            return Response({
                'detail': 'Matter declined. It will be returned to matching.',
                'matter': MatterDetailSerializer(matter).data
            })

        else:
            return Response(
                {'detail': 'Invalid action. Use "accept" or "decline".'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ClientSelectAttorneyView(APIView):
    """Client selects an attorney for their matter from matching results."""

    permission_classes = [IsClient]

    def post(self, request, pk):
        from apps.attorneys.models import AttorneyProfile

        try:
            matter = Matter.objects.get(
                pk=pk,
                client=request.user,
                status=Matter.MatterStatus.MATCHING
            )
        except Matter.DoesNotExist:
            return Response(
                {'detail': 'Matter not found or not in matching status.'},
                status=status.HTTP_404_NOT_FOUND
            )

        attorney_id = request.data.get('attorney_id')
        if not attorney_id:
            return Response(
                {'detail': 'attorney_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            attorney = AttorneyProfile.objects.get(user_id=attorney_id)
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify attorney was not excluded by conflict check
        from apps.conflicts.models import ConflictCheck
        latest_check = ConflictCheck.objects.filter(
            matter=matter,
            status=ConflictCheck.CheckStatus.COMPLETED
        ).order_by('-completed_at').first()

        if latest_check and attorney in latest_check.excluded_attorneys.all():
            return Response(
                {'detail': 'This attorney has a conflict with your matter.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Assign attorney and set to pending (waiting for attorney acceptance)
        matter.attorney = attorney
        matter.status = Matter.MatterStatus.PENDING
        matter.save()

        # Create status history
        MatterStatusHistory.objects.create(
            matter=matter,
            old_status=Matter.MatterStatus.MATCHING,
            new_status=Matter.MatterStatus.PENDING,
            changed_by=request.user,
            notes=f'Client selected attorney: {attorney.user.full_name}'
        )

        # TODO: Send notification to attorney about new matter request

        return Response({
            'detail': 'Attorney selected. Waiting for attorney to accept.',
            'matter': MatterDetailSerializer(matter).data
        })
