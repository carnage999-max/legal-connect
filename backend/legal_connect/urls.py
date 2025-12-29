"""
URL configuration for legal_connect project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # JWT Authentication
    path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # dj-rest-auth endpoints
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),

    # App APIs
    path('api/v1/users/', include('apps.users.urls', namespace='users')),
    path('api/v1/attorneys/', include('apps.attorneys.urls', namespace='attorneys')),
    path('api/v1/matters/', include('apps.matters.urls', namespace='matters')),
    path('api/v1/conflicts/', include('apps.conflicts.urls', namespace='conflicts')),
    path('api/v1/messaging/', include('apps.messaging.urls', namespace='messaging')),
    path('api/v1/documents/', include('apps.documents.urls', namespace='documents')),
    path('api/v1/payments/', include('apps.payments.urls', namespace='payments')),
    path('api/v1/scheduling/', include('apps.scheduling.urls', namespace='scheduling')),
    path('api/v1/notifications/', include('apps.notifications.urls', namespace='notifications')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
