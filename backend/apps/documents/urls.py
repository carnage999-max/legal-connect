from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    # Document CRUD
    path('', views.DocumentListView.as_view(), name='document-list'),
    path('upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('<uuid:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    path('<uuid:pk>/download/', views.DocumentDownloadView.as_view(), name='document-download'),

    # Versioning
    path('<uuid:pk>/new-version/', views.DocumentVersionCreateView.as_view(), name='document-version'),
    path('<uuid:pk>/versions/', views.DocumentVersionsView.as_view(), name='document-versions'),

    # Signatures
    path('<uuid:pk>/request-signature/', views.RequestSignatureView.as_view(), name='request-signature'),
    path('signatures/pending/', views.PendingSignaturesView.as_view(), name='pending-signatures'),
    path('signatures/<uuid:pk>/sign/', views.SignDocumentView.as_view(), name='sign-document'),

    # Access logs
    path('<uuid:pk>/access-logs/', views.DocumentAccessLogsView.as_view(), name='access-logs'),
]
