from django.db import models


class Specialization(models.Model):
    code = models.CharField(max_length=20, unique=True, verbose_name="Kod")
    name_latin = models.CharField(max_length=255, verbose_name="Lotin (UZ)")
    name_cyrillic = models.CharField(max_length=255, verbose_name="Kirill (UZ)", null=True, blank=True)
    name_russian = models.CharField(max_length=255, verbose_name="Русский", null=True, blank=True)
    name_english = models.CharField(max_length=255, verbose_name="English", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Kurs"
        verbose_name_plural = "Kurslar"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name_latin}"