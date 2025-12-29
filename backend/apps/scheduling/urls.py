from django.urls import path
from . import views

app_name = 'scheduling'

urlpatterns = [
    # Appointments
    path('appointments/', views.AppointmentListView.as_view(), name='appointment-list'),
    path('appointments/create/', views.AppointmentCreateView.as_view(), name='appointment-create'),
    path('appointments/<uuid:pk>/', views.AppointmentDetailView.as_view(), name='appointment-detail'),
    path('appointments/<uuid:pk>/confirm/', views.AppointmentConfirmView.as_view(), name='appointment-confirm'),
    path('appointments/<uuid:pk>/cancel/', views.AppointmentCancelView.as_view(), name='appointment-cancel'),
    path('appointments/<uuid:pk>/reschedule/', views.AppointmentRescheduleView.as_view(), name='appointment-reschedule'),
    path('appointments/<uuid:pk>/complete/', views.AppointmentCompleteView.as_view(), name='appointment-complete'),
    path('appointments/upcoming/', views.UpcomingAppointmentsView.as_view(), name='upcoming-appointments'),

    # Availability
    path('available-slots/', views.AvailableSlotsView.as_view(), name='available-slots'),

    # Blocked times
    path('blocked-times/', views.BlockedTimeListCreateView.as_view(), name='blocked-time-list'),
    path('blocked-times/<uuid:pk>/', views.BlockedTimeDeleteView.as_view(), name='blocked-time-delete'),

    # Calendar integrations
    path('calendar-integrations/', views.CalendarIntegrationListView.as_view(), name='calendar-integrations'),
]
