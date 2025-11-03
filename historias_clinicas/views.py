from rest_framework import viewsets
from .models import HistoriasClinicas
from .serializers import HistClinSerializer

class HistoriaClinicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet que proporciona operaciones CRUD completas para HistoriasClinicas.
    """
    
    serializer_class = HistClinSerializer
    
    queryset = HistoriasClinicas.objects.all().select_related(
        'paciente', 
        'odontologo'
    ).prefetch_related(
        'detalles', 
        'seguimientos'
    ).order_by('-fecha_inicio') 
    