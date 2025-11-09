from rest_framework import serializers
from .models import HistoriasClinicas, DetallesHC, SeguimientoHC, PiezasDentales, CarasDentales, Tratamientos

# Serializers para entidades simples o de catálogo (opcional, pero útil)
class PiezaDentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PiezasDentales
        fields = '__all__'

class CaraDentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarasDentales
        fields = '__all__'

class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamientos
        fields = '__all__'


class DetalleHCSerializer(serializers.ModelSerializer):
    # Opcional: Para mostrar el nombre del Tratamiento, Cara y Pieza en lugar de solo el ID
    tratamiento_nombre = serializers.CharField(source='tratamiento.nombre_trat', read_only=True)
    pieza_codigo = serializers.CharField(source='pieza_dental.codigo_pd', read_only=True)
    cara_nombre = serializers.CharField(source='cara_dental.nombre_cara', read_only=True)

    class Meta:
        model = DetallesHC
        # Incluimos los IDs (para escritura/creación) y los nombres (para lectura)
        fields = [
            'id', 
            'tratamiento', 'tratamiento_nombre',
            'cara_dental', 'cara_nombre',
            'pieza_dental', 'pieza_codigo'
        ]

class SeguimientoHCSerializer(serializers.ModelSerializer):
    odontologo_nombre = serializers.CharField(source='odontologo.__str__', read_only=True)
    class Meta:
        model = SeguimientoHC
        fields = [
            'id', 
            'descripcion', 
            'fecha', 
            'historia_clinica',
            'odontologo',  
            'odontologo_nombre'
        ]
        # Excluimos 'historia_clinica' ya que se establecerá automáticamente al crear el seguimiento anidado
        read_only_fields = ('fecha', 'historia_clinica', 'odontologo_nombre')


class HistClinSerializer(serializers.ModelSerializer):
    # 🌟 Serialización Anidada 🌟
    # Usamos el 'related_name' que definiste en models.py: related_name='detalles'
    # many=True porque una historia tiene muchos detalles.
    detalles = DetalleHCSerializer(many=True, required=False)
    
    # Usamos el 'related_name' que definiste: related_name='seguimientos'
    seguimientos = SeguimientoHCSerializer(many=True, read_only=True) 

    # Para lectura: Mostrar el nombre del paciente y del odontólogo en lugar de solo su ID
    # Asume que Pacientes y Personal tienen un campo 'nombre' y/o 'dni'
    paciente_nombre = serializers.CharField(source='paciente.__str__', read_only=True)
    odontologo_nombre = serializers.CharField(source='odontologo.__str__', read_only=True)

    class Meta:
        model = HistoriasClinicas
        fields = [
            'id', 
            'paciente', 'paciente_nombre', 
            'odontologo', 'odontologo_nombre', 
            'descripcion', 'fecha_inicio', 
            'fecha_fin', 'finalizado', 
            'detalles', # <--- El array de DetalleHC
            'seguimientos' # <--- El array de SeguimientoHC
        ]
        read_only_fields = ('fecha_inicio',)


    # Sobrescribir el método create para manejar la creación de DetallesHC anidados
    def create(self, validated_data):
        # 1. Extraer los datos de 'detalles'
        detalles_data = validated_data.pop('detalles', [])
        
        # 2. Crear la instancia de HistoriasClinicas
        historia_clinica = HistoriasClinicas.objects.create(**validated_data)
        
        # 3. Crear los DetallesHC y vincularlos a la nueva Historia Clínica
        for detalle_data in detalles_data:
            DetallesHC.objects.create(historia_clinica=historia_clinica, **detalle_data)
            
        return historia_clinica
