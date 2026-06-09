from django.db import models
from django.contrib.auth.models import User


class DocumentTemplate(models.Model):
    TEMPLATE_TYPES = [
        ('sertifikat', 'Sertifikat'),
        ('guvohnoma', 'Guvohnoma'),
    ]

    name = models.CharField(max_length=255, verbose_name="Nomi")
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES, verbose_name="Turi")
    file = models.FileField(upload_to='templates/', verbose_name="Fayl")
    is_active = models.BooleanField(default=True, verbose_name="Faol")
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='templates',
        verbose_name="Yaratdi"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Hujjat shabloni"
        verbose_name_plural = "Hujjat shablonlari"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_template_type_display()})"

    @property
    def file_name(self):
        if self.file:
            return self.file.name.split('/')[-1]
        return ''