from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from certificates.views import verify_certificate
from rest_framework_simplejwt.views import (
    TokenRefreshView, TokenObtainPairView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/certificates/', include('certificates.urls')),
    path('api/templates/', include('templates_app.urls')),
    path('api/specializations/', include('specializations.urls')),
    # Public verification endpoint (no auth)
    path('api/verify/<uuid:code>/', verify_certificate, name='verify-certificate'),

    path('api/token-log-in/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token-log-in/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
