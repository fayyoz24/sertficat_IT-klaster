from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from .models import DocumentTemplate
from .serializers import DocumentTemplateSerializer
from rest_framework.permissions import IsAuthenticated

class DocumentTemplateViewSet(viewsets.ModelViewSet):

    permission_classes=[IsAuthenticated]
    queryset = DocumentTemplate.objects.all()
    serializer_class = DocumentTemplateSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'template_type']
    ordering_fields = ['created_at', 'name']

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)