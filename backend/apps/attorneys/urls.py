from django.urls import path
from . import views

app_name = 'attorneys'

urlpatterns = [
    # Public endpoints
    path('practice-areas/', views.PracticeAreaListView.as_view(), name='practice-areas'),
    path('jurisdictions/', views.JurisdictionListView.as_view(), name='jurisdictions'),
    path('', views.AttorneyListView.as_view(), name='attorney-list'),
    path('<uuid:user_id>/', views.AttorneyDetailView.as_view(), name='attorney-detail'),
    path('<uuid:attorney_id>/reviews/', views.AttorneyReviewListView.as_view(), name='attorney-reviews'),

    # Attorney profile management
    path('profile/', views.AttorneyProfileView.as_view(), name='profile'),
    path('onboarding/', views.AttorneyOnboardingView.as_view(), name='onboarding'),
    path('dashboard/', views.AttorneyDashboardView.as_view(), name='dashboard'),

    # Availability management
    path('availability/', views.AttorneyAvailabilityListView.as_view(), name='availability-list'),
    path('availability/<uuid:pk>/', views.AttorneyAvailabilityDetailView.as_view(), name='availability-detail'),

    # Reviews
    path('reviews/create/', views.AttorneyReviewCreateView.as_view(), name='review-create'),

    # Matching
    path('match/', views.AttorneyMatchingView.as_view(), name='matching'),
]
