from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
    CaraDentalSerializer,
    SeguimientoHCSerializer

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

    @action(detail=True, methods=['post'], url_path='seguimientos')
    def create_seguimiento(self, request, pk=None):
        """
        Crea un nuevo SeguimientoHC para una Historia Clínica específica.
        URL generada: /historias/{pk}/seguimientos/ [POST]
        """
        try:
            historia = HistoriasClinicas.objects.get(pk=pk)
        except HistoriasClinicas.DoesNotExist:
            return Response({'detail': 'Historia Clínica no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        
        # 1. Preparamos los datos: Añadimos la FK de la HC al payload
        data = request.data.copy()
        data['historia_clinica'] = historia.pk
        
        # 2. Usamos SeguimientoHCSerializer para validar y crear
        serializer = SeguimientoHCSerializer(data=data)
        
        if serializer.is_valid():
            # 3. Guardamos el seguimiento (incluirá el Odontólogo por la data)
            seguimiento = serializer.save(historia_clinica=historia)
            # 4. Devolvemos el Seguimiento recién creado
            return Response(SeguimientoHCSerializer(seguimiento).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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