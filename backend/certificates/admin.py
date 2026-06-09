from django.contrib import admin

# Register your models here.
from .models import Certificate

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['series', 'employee_name', 'specialization', 'created_at']
    search_fields = ['certificate_number', 'employee_name']