from django.urls import path
from . import views

app_name = 'conflicts'

urlpatterns = [
    # Attorney client records management
    path('attorney/records/', views.AttorneyClientRecordListView.as_view(), name='attorney-records'),
    path('attorney/records/add/', views.AttorneyClientRecordCreateView.as_view(), name='add-record'),
    path('attorney/records/bulk-import/', views.BulkClientImportView.as_view(), name='bulk-import'),
    path('attorney/records/<uuid:pk>/', views.AttorneyClientRecordDeleteView.as_view(), name='delete-record'),

    # Conflict check operations
    path('check/', views.ConflictCheckRequestView.as_view(), name='request-check'),
    path('check/<uuid:pk>/', views.ConflictCheckResultView.as_view(), name='check-result'),
    path('matter/<uuid:matter_id>/history/', views.ConflictCheckHistoryView.as_view(), name='check-history'),
    path('matter/<uuid:matter_id>/available-attorneys/', views.MatterAvailableAttorneysView.as_view(), name='available-attorneys'),
]
