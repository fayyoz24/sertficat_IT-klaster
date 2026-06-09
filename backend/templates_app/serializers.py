from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DocumentTemplate


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class DocumentTemplateSerializer(serializers.ModelSerializer):
    created_by_info = UserBriefSerializer(source='created_by', read_only=True)
    file_name = serializers.ReadOnlyField()
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)

    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'name', 'template_type', 'template_type_display',
            'file', 'file_name', 'is_active', 'created_by',
            'created_by_info', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']