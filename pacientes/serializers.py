from rest_framework import serializers
# Asegúrate de importar todos los modelos necesarios
from .models import Pacientes, Generos, Antecedentes, AnalisisFuncional

# --- Serializers para Lectura de Relaciones ---
# Son necesarios para devolver el nombre completo en las listas/detalles.

class GenerosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Generos
        fields = ('id', 'nombre_ge')

class AntecedentesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Antecedentes
        fields = ('id', 'nombre_ant')

class AnalisisFuncionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalisisFuncional
        fields = ('id', 'nombre_analisis')


# --- Serializer Principal ---

class PacientesSerializer(serializers.ModelSerializer):
    
    # 1. CAMPOS DE LECTURA (GET): Muestran el objeto anidado completo
    # Usamos *_info para evitar conflictos de nombre.
    genero_info = GenerosSerializer(source='genero', read_only=True)
    antecedentes_info = AntecedentesSerializer(source='antecedentes', many=True, read_only=True)
    analisis_funcional_info = AnalisisFuncionalSerializer(source='analisis_funcional', many=True, read_only=True)

    # 2. CAMPOS DE ESCRITURA (POST/PUT): Reciben IDs desde el frontend
    
    # Foreign Key (Género)
    # Mapea el ID recibido (genero_id) a la clave 'genero' del modelo.
    genero_id = serializers.IntegerField(write_only=True, source='genero')
    
    # Many-to-Many (Antecedentes)
    # Mapea el array de IDs (antecedentes_ids) a la clave 'antecedentes' del modelo.
    antecedentes_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        source='antecedentes'
    )

    # Many-to-Many (Análisis Funcional)
    # Mapea el array de IDs (analisis_funcional_ids) a la clave 'analisis_funcional' del modelo.
    analisis_funcional_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        source='analisis_funcional'
    )
    
    class Meta:
        model = Pacientes
        fields = (
            # Campos básicos
            'id', 'nombre', 'apellido', 'dni', 'fecha_nacimiento', 
            'domicilio', 'telefono', 'email', 'activo', 'edad',
            
            # Campos de Lectura (objetos anidados)
            'genero_info', 
            'antecedentes_info', 
            'analisis_funcional_info',
            
            # Campos de Escritura (IDs) - ¡DEBEN IR AQUÍ!
            'genero_id',       
            'antecedentes_ids', 
            'analisis_funcional_ids', 
        )
        # 'activo' y 'edad' son read_only
        read_only_fields = ('activo', 'edad',) 

    def create(self, validated_data):
        # 1. Extraer las listas de IDs M2M usando pop() 
        # (Se usa la clave mapeada por `source`: 'antecedentes', 'analisis_funcional')
        antecedentes_data = validated_data.pop('antecedentes', []) 
        analisis_funcional_data = validated_data.pop('analisis_funcional', [])
        genero_id = validated_data.pop('genero')
        
        # 2. Crear el objeto Paciente
        # Django ahora puede manejar la Foreign Key 'genero' automáticamente porque 
        # validated_data['genero'] es un ID, y no tenemos que usar puesto_id=puesto_id 
        # como en Personal (que tenía que crear un User antes).
        paciente = Pacientes.objects.create(
            genero_id=genero_id, # <-- CORRECCIÓN: Pasar el ID con el sufijo '_id'
            **validated_data
        )
        
        # 3. Asignar las relaciones M2M usando .set()
        if antecedentes_data:
            paciente.antecedentes.set(antecedentes_data)
            
        if analisis_funcional_data:
            paciente.analisis_funcional.set(analisis_funcional_data)
        
        return paciente
