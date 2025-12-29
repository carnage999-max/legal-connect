from django.urls import path
from . import views

app_name = 'matters'

urlpatterns = [
    # Matter CRUD
    path('', views.MatterListCreateView.as_view(), name='matter-list-create'),
    path('<uuid:pk>/', views.MatterDetailView.as_view(), name='matter-detail'),

    # Matter workflow
    path('<uuid:pk>/submit/', views.MatterSubmitView.as_view(), name='matter-submit'),
    path('<uuid:pk>/status/', views.MatterStatusUpdateView.as_view(), name='matter-status'),
    path('<uuid:pk>/assign-attorney/', views.MatterAssignAttorneyView.as_view(), name='matter-assign'),

    # Matter parties
    path('<uuid:matter_id>/parties/', views.MatterPartyListCreateView.as_view(), name='party-list-create'),
    path('<uuid:matter_id>/parties/<uuid:pk>/', views.MatterPartyDeleteView.as_view(), name='party-delete'),

    # Matter notes
    path('<uuid:matter_id>/notes/', views.MatterNoteListCreateView.as_view(), name='note-list-create'),

    # Dashboard
    path('dashboard/client/', views.ClientDashboardView.as_view(), name='client-dashboard'),
    path('dashboard/attorney/requests/', views.AttorneyNewRequestsView.as_view(), name='attorney-requests'),
]
