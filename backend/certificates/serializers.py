from rest_framework import serializers
from datetime import timedelta
from .models import Certificate
from templates_app.serializers import DocumentTemplateSerializer
from specializations.serializers import SpecializationSerializer


class CertificateListSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    specialization_name = serializers.CharField(source='specialization.name_latin', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'template', 'template_name', 'series', 'certificate_number',
            'employee_name', 'specialization', 'specialization_name',
            'start_date', 'end_date', 'duration_days', 'hours',
            'director_name', 'registration_number', 'registration_date',
            'generated_pdf', 'verification_code', 'created_at',
        ]


class CertificateDetailSerializer(serializers.ModelSerializer):
    template_info = DocumentTemplateSerializer(source='template', read_only=True)
    specialization_info = SpecializationSerializer(source='specialization', read_only=True)
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'generated_pdf', 'verification_code']

    def get_verification_url(self, obj):
        request = self.context.get('request')
        return obj.get_verification_url(request)


class CertificateCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = [
            'template', 'series', 'certificate_number',
            'employee_name', 'specialization',
            'start_date', 'duration_days', 'end_date', 'hours',
            'director_name', 'registration_number', 'registration_date',
        ]

    def validate(self, data):
        start = data.get('start_date')
        duration = data.get('duration_days')
        end = data.get('end_date')
        if start and duration and not end:
            data['end_date'] = start + timedelta(days=duration)
        return data


class CertificateVerifySerializer(serializers.ModelSerializer):
    """Public serializer — no sensitive data, used on verification page."""
    specialization_name = serializers.CharField(source='specialization.name_latin', read_only=True)
    specialization_code = serializers.CharField(source='specialization.code', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    template_type = serializers.CharField(source='template.template_type_display', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'series', 'certificate_number', 'employee_name',
            'specialization_name', 'specialization_code',
            'start_date', 'end_date', 'duration_days', 'hours',
            'director_name', 'registration_number', 'registration_date',
            'template_name', 'template_type',
            'verification_code', 'created_at',
        ]