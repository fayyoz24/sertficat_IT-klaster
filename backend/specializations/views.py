from rest_framework import viewsets, filters
from .models import Specialization
from .serializers import SpecializationSerializer
from rest_framework.permissions import IsAuthenticated

class SpecializationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_latin', 'name_cyrillic', 'name_russian', 'code']
    ordering_fields = ['code', 'name_latin', 'created_at']