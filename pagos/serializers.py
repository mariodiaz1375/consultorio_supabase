from rest_framework import serializers
from .models import Pagos, TiposPagos
# Importar modelos relacionados de otras aplicaciones para acceso (aunque usamos StringRelatedField)
# from historias_clinicas.models import HistoriasClinicas # Asumimos que existe
# from personal.models import Personal # Asumimos que existe

# --- Serializer para Tablas Maestras ---
class TiposPagosSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo TiposPagos.
    Usado para llenar select/dropdowns en el frontend.
    """
    class Meta:
        model = TiposPagos
        fields = '__all__'


# --- Serializer Principal de Pagos ---
class PagosSerializer(serializers.ModelSerializer):
    
    # 1. CAMPOS DE LECTURA (GET): Muestran el nombre legible de las relaciones.
    
    # Asume que el modelo HistoriasClinicas tiene un método __str__ que incluye el paciente
    hist_clin_display = serializers.StringRelatedField(source='hist_clin', read_only=True)
    # Muestra el nombre del Tipo de Pago
    tipo_pago_nombre = serializers.StringRelatedField(source='tipo_pago', read_only=True)
    # Muestra el nombre del Personal que registró el pago
    registrado_por_nombre = serializers.StringRelatedField(source='registrado_por', read_only=True)

    class Meta:
        model = Pagos
        fields = (
            'id', 
            'pagado', 
            'fecha_pago', 
            
            # Foreign Keys (para envío de IDs en POST/PUT)
            'tipo_pago', 
            'hist_clin', 
            'registrado_por',
            
            # Campos Read-Only para la visualización
            'hist_clin_display', 
            'tipo_pago_nombre',
            'registrado_por_nombre',
        )
        
        # 'fecha_pago' se sigue manejando en el modelo/vista.
        # read_only_fields = ('fecha_pago',)
        # Aseguramos que 'id' y campos display sean read-only
        read_only_fields = ('id', 'hist_clin_display', 'tipo_pago_nombre', 'registrado_por_nombre')


    def update(self, instance, validated_data):
        # Si 'pagado' cambia a True y 'fecha_pago' es None, el método .save() del modelo
        # (que incluye la lógica de timezone.now()) se encargará de actualizar 'fecha_pago'.
        return super().update(instance, validated_data)