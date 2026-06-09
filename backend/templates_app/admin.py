from django.contrib import admin

# Register your models here.
from .models import DocumentTemplate


@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'file_name', 'is_active', 'created_by', 'created_at']
    search_fields = ['name', 'template_type__code', 'template_type__name']
    list_filter = ['template_type', 'is_active', 'created_at']