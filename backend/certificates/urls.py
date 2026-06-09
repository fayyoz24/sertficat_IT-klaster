from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CertificateViewSet, verify_certificate

router = DefaultRouter()
router.register('', CertificateViewSet, basename='certificate')

urlpatterns = [
    path('', include(router.urls)),
]