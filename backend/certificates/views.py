from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import FileResponse
from datetime import timedelta
import os

from .models import Certificate
from .serializers import (
    CertificateListSerializer,
    CertificateDetailSerializer,
    CertificateCreateSerializer,
    CertificateVerifySerializer,
)
from .utils import generate_certificate_pdf   # PDF, not DOCX
from rest_framework.permissions import AllowAny, IsAdminUser

class CertificateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Certificate.objects.select_related(
        'template', 'specialization', 'created_by'
    ).all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['certificate_number', 'employee_name', 'series', 'director_name']
    ordering_fields = ['created_at', 'certificate_number', 'employee_name']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CertificateCreateSerializer
        if self.action == 'retrieve':
            return CertificateDetailSerializer
        return CertificateListSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        instance = serializer.save(created_by=user)
        self._generate_doc(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._generate_doc(instance)

    def _generate_doc(self, instance):
        """Render template → PDF and save to generated_pdf field."""
        try:
            verification_url = instance.get_verification_url(self.request)
            pdf_file = generate_certificate_pdf(instance, verification_url)
            instance.generated_pdf.save(pdf_file.name, pdf_file, save=True)
        except Exception as e:
            print(f"PDF generation warning: {e}")

    # ── Download ──────────────────────────────────────────────────────────────
    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        certificate = self.get_object()

        # Re-generate if missing
        if not certificate.generated_pdf:
            try:
                self._generate_doc(certificate)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        file_path = certificate.generated_pdf.path
        if not os.path.exists(file_path):
            return Response(
                {'error': 'Fayl topilmadi'}, status=status.HTTP_404_NOT_FOUND
            )

        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
        )
        filename = os.path.basename(file_path)
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    # ── Regenerate ────────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='regenerate')
    def regenerate(self, request, pk=None):
        certificate = self.get_object()
        try:
            verification_url = certificate.get_verification_url(request)
            pdf_file = generate_certificate_pdf(certificate, verification_url)
            certificate.generated_pdf.save(pdf_file.name, pdf_file, save=True)
            return Response({
                'message': 'PDF muvaffaqiyatli qayta yaratildi',
                'file': certificate.generated_pdf.url,
                'verification_url': verification_url,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # ── Calculate end date ────────────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='calculate-end-date')
    def calculate_end_date(self, request):
        from datetime import datetime
        start_date_str = request.query_params.get('start_date')
        duration = request.query_params.get('duration_days')
        if not start_date_str or not duration:
            return Response(
                {'error': 'start_date va duration_days kerak'}, status=400
            )
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = start_date + timedelta(days=int(duration))
            return Response({'end_date': end_date.strftime('%Y-%m-%d')})
        except (ValueError, TypeError) as e:
            return Response({'error': str(e)}, status=400)


# ── Public verification endpoint ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([AllowAny])
def verify_certificate(request, code):
    """
    Public endpoint: verify a certificate by its UUID code.
    No auth required — anyone with the QR link can verify.
    """
    try:
        cert = Certificate.objects.select_related(
            'template', 'specialization'
        ).get(verification_code=code)
    except Certificate.DoesNotExist:
        return Response(
            {'valid': False, 'message': "Sertifikat topilmadi yoki kod noto'g'ri."},
            status=status.HTTP_404_NOT_FOUND,
        )
    data = CertificateVerifySerializer(cert).data
    data['valid'] = True
    return Response(data)