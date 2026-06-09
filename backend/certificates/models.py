import uuid
from django.db import models
from django.contrib.auth.models import User
from templates_app.models import DocumentTemplate
from specializations.models import Specialization


class Certificate(models.Model):
    # Shablon & raqam
    template = models.ForeignKey(
        DocumentTemplate, on_delete=models.PROTECT,
        related_name='certificates', verbose_name="Shablon"
    )
    series = models.CharField(max_length=50, blank=True, verbose_name="Seriya")
    certificate_number = models.CharField(max_length=100, verbose_name="Sertifikat raqami")

    # Xodim
    employee_name = models.CharField(max_length=255, verbose_name="Xodim F.I.O.")

    # Kasb va davomiylik
    specialization = models.ForeignKey(
        Specialization, on_delete=models.PROTECT,
        related_name='certificates', verbose_name="Kasb"
    )
    start_date = models.DateField(verbose_name="Boshlanish sanasi")
    duration_days = models.PositiveIntegerField(verbose_name="Davomiylik (kun)")
    end_date = models.DateField(verbose_name="Tugash sanasi")
    hours = models.PositiveIntegerField(verbose_name="Soat")

    # Direktor va ro'yxat
    director_name = models.CharField(max_length=255, verbose_name="Direktor F.I.Sh.")
    registration_number = models.CharField(max_length=100, blank=True, verbose_name="Ro'yxatga olish raqami")
    registration_date = models.DateField(null=True, blank=True, verbose_name="Ro'yxatga olish sanasi")

    # QR / Verification
    verification_code = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False,
        verbose_name="Tekshiruv kodi"
    )

    # Generated file
    generated_pdf = models.FileField(
        upload_to='certificates/', null=True, blank=True, verbose_name="DOCX fayl"
    )
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='certificates', verbose_name="Yaratdi"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sertifikat"
        verbose_name_plural = "Sertifikatlar"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.certificate_number} - {self.employee_name}"

    def get_verification_url(self, request=None):
        """Return the public verification URL for this certificate."""
        base = "http://localhost:3000"
        if request:
            origin = request.META.get('HTTP_ORIGIN', '')
            if origin:
                base = origin
            else:
                base = f"{request.scheme}://{request.get_host().replace(':8000', ':3000')}"
        return f"{base}/verify/{self.verification_code}"