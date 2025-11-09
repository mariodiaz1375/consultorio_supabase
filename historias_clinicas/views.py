from rest_framework import viewsets
from .models import (
    HistoriasClinicas, 
    PiezasDentales, 
    CarasDentales, 
    Tratamientos
)
from .serializers import (
    HistClinSerializer,
    TratamientoSerializer, 
    PiezaDentalSerializer, 
    CaraDentalSerializer
)

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
    
class TratamientoViewSet(viewsets.ModelViewSet):
    """ CRUD para el catálogo de Tratamientos. """
    queryset = Tratamientos.objects.all().order_by('nombre_trat')
    serializer_class = TratamientoSerializer

class PiezaDentalViewSet(viewsets.ModelViewSet):
    """ CRUD para el catálogo de Piezas Dentales. """
    # Ordenamos por el código para una lista lógica
    queryset = PiezasDentales.objects.all().order_by('codigo_pd') 
    serializer_class = PiezaDentalSerializer

class CaraDentalViewSet(viewsets.ModelViewSet):
    """ CRUD para el catálogo de Caras Dentales. """
    queryset = CarasDentales.objects.all().order_by('nombre_cara')
    serializer_class = CaraDentalSerializer