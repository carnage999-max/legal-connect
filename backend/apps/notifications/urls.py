from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('mark-read/', views.MarkNotificationsReadView.as_view(), name='mark-read'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),

    # Preferences
    path('preferences/', views.NotificationPreferenceView.as_view(), name='preferences'),

    # Devices
    path('devices/', views.DeviceListView.as_view(), name='device-list'),
    path('devices/register/', views.RegisterDeviceView.as_view(), name='register-device'),
    path('devices/unregister/', views.UnregisterDeviceView.as_view(), name='unregister-device'),
]
