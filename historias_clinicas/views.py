from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import (
    HistoriasClinicas, 
    PiezasDentales, 
    CarasDentales, 
    Tratamientos,
    SeguimientoHC
)
from .serializers import (
    HistClinSerializer,
    TratamientoSerializer, 
    PiezaDentalSerializer, 
    CaraDentalSerializer,
    SeguimientoHCSerializer
)

# 🆕 Clase de paginación personalizada
class HistoriaClinicaPagination(PageNumberPagination):
    page_size = 10  # Número de items por página
    page_size_query_param = 'page_size'  # Permite al cliente cambiar el tamaño
    max_page_size = 100  # Límite máximo

class HistoriaClinicaViewSet(viewsets.ModelViewSet):
    """
    ViewSet que proporciona operaciones CRUD completas para HistoriasClinicas.
    """
    
    serializer_class = HistClinSerializer
    # pagination_class = HistoriaClinicaPagination  # 🔧 Comentado: Paginación en frontend
    
    queryset = HistoriasClinicas.objects.all().select_related(
        'paciente', 
        'odontologo'
    ).prefetch_related(
        'detalles', 
        'seguimientos'
    ).order_by('-fecha_inicio')

    def get_queryset(self):
        """
        Opcionalmente permite deshabilitar la paginación con ?no_page=true
        """
        queryset = super().get_queryset()
        return queryset

    def paginate_queryset(self, queryset):
        """
        🔧 Permite deshabilitar paginación con parámetro no_page=true
        """
        if self.request.query_params.get('no_page') == 'true':
            return None
        return super().paginate_queryset(queryset)

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

    @action(detail=True, methods=['patch'], url_path='seguimientos/(?P<seguimiento_id>[^/.]+)')
    def update_seguimiento(self, request, pk=None, seguimiento_id=None):
        """
        Actualiza un SeguimientoHC específico de una Historia Clínica.
        URL generada: /historias/{pk}/seguimientos/{seguimiento_id}/ [PATCH]
        
        Al editar, se actualiza el odontólogo al que está editando.
        """
        try:
            historia = HistoriasClinicas.objects.get(pk=pk)
            seguimiento = SeguimientoHC.objects.get(pk=seguimiento_id, historia_clinica=historia)
        except HistoriasClinicas.DoesNotExist:
            return Response({'detail': 'Historia Clínica no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        except SeguimientoHC.DoesNotExist:
            return Response({'detail': 'Seguimiento no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Serializar con datos parciales
        serializer = SeguimientoHCSerializer(seguimiento, data=request.data, partial=True)
        
        if serializer.is_valid():
            # ✅ El odontólogo se actualiza automáticamente desde request.data
            seguimiento_actualizado = serializer.save()
            return Response(SeguimientoHCSerializer(seguimiento_actualizado).data, status=status.HTTP_200_OK)
        
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