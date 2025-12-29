import django_filters
from .models import AttorneyProfile


class AttorneyFilter(django_filters.FilterSet):
    """Filter for attorney search."""

    practice_area = django_filters.UUIDFilter(
        field_name='practice_areas__id',
        lookup_expr='exact'
    )
    jurisdiction = django_filters.UUIDFilter(
        field_name='jurisdictions__id',
        lookup_expr='exact'
    )
    min_rating = django_filters.NumberFilter(
        field_name='rating',
        lookup_expr='gte'
    )
    max_hourly_rate = django_filters.NumberFilter(
        field_name='hourly_rate',
        lookup_expr='lte'
    )
    min_experience = django_filters.NumberFilter(
        field_name='years_of_experience',
        lookup_expr='gte'
    )
    free_consultation = django_filters.BooleanFilter(
        field_name='free_consultation'
    )
    fee_structure = django_filters.CharFilter(
        field_name='fee_structure',
        lookup_expr='exact'
    )
    state = django_filters.CharFilter(
        field_name='office_state',
        lookup_expr='iexact'
    )
    city = django_filters.CharFilter(
        field_name='office_city',
        lookup_expr='icontains'
    )

    class Meta:
        model = AttorneyProfile
        fields = [
            'practice_area', 'jurisdiction', 'min_rating',
            'max_hourly_rate', 'min_experience', 'free_consultation',
            'fee_structure', 'state', 'city'
        ]
