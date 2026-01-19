from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from django.utils import timezone

from .models import (
    AttorneyProfile, PracticeArea, Jurisdiction,
    AttorneyReview, AttorneyAvailability
)
from .serializers import (
    AttorneyProfileListSerializer, AttorneyProfileDetailSerializer,
    AttorneyProfileUpdateSerializer, AttorneyOnboardingSerializer,
    PracticeAreaSerializer, JurisdictionSerializer,
    AttorneyReviewSerializer, AttorneyReviewCreateSerializer,
    AttorneyAvailabilitySerializer
)
from .filters import AttorneyFilter


class IsAttorney(permissions.BasePermission):
    """Permission check for attorney users."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'attorney'
        )


class IsClient(permissions.BasePermission):
    """Permission check for client users."""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.user_type == 'client'
        )


class PracticeAreaListView(generics.ListAPIView):
    """List all practice areas."""

    queryset = PracticeArea.objects.filter(is_active=True)
    serializer_class = PracticeAreaSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class JurisdictionListView(generics.ListAPIView):
    """List all jurisdictions."""

    queryset = Jurisdiction.objects.filter(is_active=True)
    serializer_class = JurisdictionSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class AttorneyListView(generics.ListAPIView):
    """List and search attorneys (public)."""

    serializer_class = AttorneyProfileListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AttorneyFilter
    search_fields = ['user__first_name', 'user__last_name', 'headline', 'biography']
    ordering_fields = ['rating', 'years_of_experience', 'hourly_rate', 'created_at']
    ordering = ['-rating', '-years_of_experience']

    def get_queryset(self):
        return AttorneyProfile.objects.filter(
            verification_status='verified',
            is_accepting_clients=True,
            user__is_active=True
        ).select_related('user').prefetch_related('practice_areas', 'jurisdictions')


class AttorneyDetailView(generics.RetrieveAPIView):
    """Get attorney profile details (public)."""

    serializer_class = AttorneyProfileDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'user_id'

    def get_queryset(self):
        return AttorneyProfile.objects.filter(
            verification_status='verified',
            user__is_active=True
        ).select_related('user').prefetch_related(
            'practice_areas', 'jurisdictions', 'availability_slots'
        )


class AttorneyProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current attorney's own profile."""

    permission_classes = [IsAttorney]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AttorneyProfileUpdateSerializer
        return AttorneyProfileDetailSerializer

    def get_object(self):
        return AttorneyProfile.objects.get(user=self.request.user)


class AttorneyOnboardingView(generics.CreateAPIView):
    """Complete attorney onboarding/profile setup."""

    serializer_class = AttorneyOnboardingSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Set the user and update user type
        user = self.request.user
        user.user_type = 'attorney'
        user.save()
        serializer.save(user=user)


class AttorneyAvailabilityListView(generics.ListCreateAPIView):
    """List and create availability slots for attorney."""

    serializer_class = AttorneyAvailabilitySerializer
    permission_classes = [IsAttorney]

    def get_queryset(self):
        return AttorneyAvailability.objects.filter(
            attorney__user=self.request.user
        )

    def perform_create(self, serializer):
        attorney_profile = AttorneyProfile.objects.get(user=self.request.user)
        serializer.save(attorney=attorney_profile)

    def create(self, request, *args, **kwargs):
        # Handle bulk update via { slots: [...] } format from mobile app
        if 'slots' in request.data:
            try:
                attorney_profile = AttorneyProfile.objects.get(user=request.user)
            except AttorneyProfile.DoesNotExist:
                return Response(
                    {"detail": "Complete your attorney profile before setting availability."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Clear existing slots and create new ones
            AttorneyAvailability.objects.filter(attorney=attorney_profile).delete()

            created_slots = []
            slots = request.data.get('slots') or []

            # Allow clearing all availability when slots is empty
            if not slots:
                serializer = self.get_serializer([], many=True)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            for slot_data in slots:
                try:
                    day_of_week = int(slot_data['day_of_week'])
                    start_time = slot_data['start_time']
                    end_time = slot_data['end_time']
                    is_active = slot_data.get('is_available', slot_data.get('is_active', True))
                except (KeyError, ValueError, TypeError):
                    return Response(
                        {"detail": "Invalid slot format. Expected day_of_week, start_time, end_time."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                slot = AttorneyAvailability.objects.create(
                    attorney=attorney_profile,
                    day_of_week=day_of_week,
                    start_time=start_time,
                    end_time=end_time,
                    is_active=is_active,
                )
                created_slots.append(slot)

            serializer = self.get_serializer(created_slots, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Standard single slot creation
        return super().create(request, *args, **kwargs)


class AttorneyAvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Manage individual availability slots."""

    serializer_class = AttorneyAvailabilitySerializer
    permission_classes = [IsAttorney]

    def get_queryset(self):
        return AttorneyAvailability.objects.filter(
            attorney__user=self.request.user
        )


class AttorneyReviewListView(generics.ListAPIView):
    """List reviews for an attorney (public)."""

    serializer_class = AttorneyReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        attorney_id = self.kwargs.get('attorney_id')
        return AttorneyReview.objects.filter(
            attorney__user_id=attorney_id,
            is_approved=True
        ).select_related('client')


class AttorneyReviewCreateView(generics.CreateAPIView):
    """Create a review for an attorney (clients only)."""

    serializer_class = AttorneyReviewCreateSerializer
    permission_classes = [IsClient]


class AttorneyDashboardView(APIView):
    """Dashboard data for attorneys."""

    permission_classes = [IsAttorney]

    def get(self, request):
        try:
            profile = AttorneyProfile.objects.get(user=request.user)
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get stats
        from apps.matters.models import Matter
        from apps.scheduling.models import Appointment

        today = timezone.now().date()

        new_requests = Matter.objects.filter(
            attorney=profile,
            status='pending'
        ).count()

        active_cases = Matter.objects.filter(
            attorney=profile,
            status__in=['open', 'in_progress']
        ).count()

        today_appointments = Appointment.objects.filter(
            attorney=profile,
            date=today,
            status='confirmed'
        ).count()

        # Calculate earnings (simplified)
        from apps.payments.models import Payment
        total_earnings = Payment.objects.filter(
            matter__attorney=profile,
            status='completed'
        ).aggregate(total=models.Sum('amount'))['total'] or 0

        return Response({
            'new_requests': new_requests,
            'active_cases': active_cases,
            'today_appointments': today_appointments,
            'total_earnings': str(total_earnings),
            'rating': str(profile.rating),
            'total_reviews': profile.total_reviews,
            'verification_status': profile.verification_status,
            'is_accepting_clients': profile.is_accepting_clients
        })


class AttorneyClientsView(APIView):
    """List clients for the authenticated attorney."""

    permission_classes = [IsAttorney]

    def get(self, request):
        from apps.matters.models import Matter
        from apps.users.models import User

        try:
            profile = AttorneyProfile.objects.get(user=request.user)
        except AttorneyProfile.DoesNotExist:
            return Response(
                {'detail': 'Attorney profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get unique clients from matters assigned to this attorney
        client_ids = Matter.objects.filter(
            attorney=profile
        ).exclude(client__isnull=True).values_list('client_id', flat=True).distinct()

        clients = User.objects.filter(id__in=client_ids).order_by('first_name', 'last_name')

        # Build client data with matter counts
        results = []
        for client in clients:
            client_matters = Matter.objects.filter(attorney=profile, client=client)
            active_count = client_matters.filter(status__in=['open', 'in_progress', 'pending']).count()
            total_count = client_matters.count()
            last_matter = client_matters.order_by('-updated_at').first()

            results.append({
                'id': str(client.id),
                'user': {
                    'first_name': client.first_name,
                    'last_name': client.last_name,
                    'email': client.email,
                    'avatar': client.avatar.url if client.avatar else None,
                },
                'active_matters_count': active_count,
                'total_matters_count': total_count,
                'last_activity': last_matter.updated_at.isoformat() if last_matter else None,
            })

        return Response({
            'count': len(results),
            'results': results
        })


class AttorneyMatchingView(APIView):
    """Find matching attorneys for a matter (used by conflict check)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        practice_area_id = request.data.get('practice_area_id')
        jurisdiction_id = request.data.get('jurisdiction_id')
        excluded_attorney_ids = request.data.get('excluded_attorney_ids', [])

        queryset = AttorneyProfile.objects.filter(
            verification_status='verified',
            is_accepting_clients=True,
            user__is_active=True
        ).exclude(user_id__in=excluded_attorney_ids)

        if practice_area_id:
            queryset = queryset.filter(practice_areas__id=practice_area_id)

        if jurisdiction_id:
            queryset = queryset.filter(jurisdictions__id=jurisdiction_id)

        # Filter by availability
        queryset = queryset.filter(
            active_cases_count__lt=models.F('max_active_cases')
        )

        queryset = queryset.select_related('user').prefetch_related(
            'practice_areas', 'jurisdictions'
        ).order_by('-rating', '-years_of_experience')[:20]

        serializer = AttorneyProfileListSerializer(queryset, many=True)
        return Response(serializer.data)
