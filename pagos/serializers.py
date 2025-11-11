from rest_framework import serializers
# Importamos los 3 modelos principales del archivo models.py de pagos
from .models import Pagos, Entregas, Cuotas
# Importamos el modelo de HistoriasClinicas para la relación de la FK
from historias_clinicas.models import HistoriasClinicas 


# --- Serializers para Catálogos (Lectura/Escritura simple) ---

class EntregasSerializer(serializers.ModelSerializer):
    """ Serializador para el catálogo Entregas (Tipo de Pago Inicial/Final). """
    class Meta:
        model = Entregas
        fields = ('id', 'nombre_ent')

class CuotasSerializer(serializers.ModelSerializer):
    """ Serializador para el catálogo Cuotas. """
    class Meta:
        model = Cuotas
        fields = ('id', 'nombre_cuota')

# --- Serializer Principal ---

class PagosSerializer(serializers.ModelSerializer):
    
    # 1. CAMPOS DE LECTURA (GET): Muestran el objeto anidado o su nombre.
    entrega_info = EntregasSerializer(source='entrega', read_only=True)
    cuota_info = CuotasSerializer(source='cuota', read_only=True)
    
    # Muestra el nombre del paciente a través de la relación Pagos -> HistClin -> Paciente
    # (El método __str__ del modelo Pagos está enlazado a hist_clin.paciente)
    hist_clin_paciente = serializers.CharField(source='hist_clin.paciente', read_only=True)

    # 2. CAMPOS DE ESCRITURA (POST/PUT): Reciben los IDs.
    # Mapean a los campos de Clave Foránea del modelo (entrega, cuota, hist_clin).
    entrega_id = serializers.IntegerField(write_only=True, source='entrega')
    cuota_id = serializers.IntegerField(write_only=True, source='cuota')
    hist_clin_id = serializers.IntegerField(write_only=True, source='hist_clin')

    class Meta:
        model = Pagos
        fields = (
            'id', 
            'fecha_limite', 
            'fecha_pago', 
            'pagado',
            
            # Lectura
            'entrega_info',
            'cuota_info',
            'hist_clin_paciente',
            
            # Escritura
            'entrega_id',
            'cuota_id',
            'hist_clin_id',
        )