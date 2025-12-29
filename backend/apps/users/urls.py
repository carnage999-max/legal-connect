from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/client/', views.ClientProfileView.as_view(), name='client-profile'),
    path('password/change/', views.PasswordChangeView.as_view(), name='password-change'),
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-logs'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete-account'),
]
