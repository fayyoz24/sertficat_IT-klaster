from django.contrib import admin
from .models import Specialization

@admin.register(Specialization)
class SpecializationAdmin(admin.ModelAdmin):
    list_display = ['code', 'name_latin', 'name_cyrillic', 'name_russian', 'is_active']
    search_fields = ['code', 'name_latin']