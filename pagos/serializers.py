from rest_framework import serializers
from .models import Pagos, Entregas, Cuotas
from personal.serializers import Personal1Serializer # Asegúrate de que este serializer exista
from historias_clinicas.models import HistoriasClinicas

# --- Serializers de Catálogo ---
class EntregasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entregas
        fields = ('id', 'nombre_ent')

class CuotasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuotas
        fields = ('id', 'nombre_cuota')

# --- Serializer Principal de Pagos ---
class PagosSerializer(serializers.ModelSerializer):
    
    # --- CAMPOS DE LECTURA (GET) ---
    entrega_info = EntregasSerializer(source='entrega', read_only=True)
    cuota_info = CuotasSerializer(source='cuota', read_only=True)
    hist_clin_paciente = serializers.CharField(source='hist_clin.paciente.__str__', read_only=True)
    registrado_por_info = Personal1Serializer(source='registrado_por', read_only=True)

    # --- CAMPOS DE ESCRITURA (POST/PUT) ---
    entrega_id = serializers.IntegerField(write_only=True, source='entrega', allow_null=True, required=False)
    cuota_id = serializers.IntegerField(write_only=True, source='cuota', allow_null=True, required=False)
    
    # 🚨 CAMBIO AQUÍ: Campo ahora obligatorio
    hist_clin_id = serializers.IntegerField(write_only=True, source='hist_clin') # Se quitaron allow_null y required=False
    
    class Meta:
        model = Pagos
        fields = (
            'id', 
            'fecha_pago', 
            'pagado',
            
            # Lectura
            'entrega_info',
            'cuota_info',
            'hist_clin_paciente',
            'registrado_por_info',
            
            # Escritura
            'entrega_id',
            'cuota_id',
            'hist_clin_id', # <-- Ahora requerido
            
            'registrado_por',
        )
        
        read_only_fields = ('registrado_por', 'fecha_pago')