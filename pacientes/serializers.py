from rest_framework import serializers
# Asegúrate de importar todos los modelos necesarios
from .models import Pacientes, Generos, Antecedentes, AnalisisFuncional, ObrasSociales, OsPacientes

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

# --- 1. Serializer Base para ObrasSociales (Lookup) ---
# Usado para listar opciones en el frontend y para la lectura anidada.
class ObrasSocialesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObrasSociales
        fields = ('id', 'nombre_os')


# --- 2. Serializer del Modelo Intermedio (OsPacientes) ---
# Se utiliza para escribir y leer la relación y el campo extra (num_afiliado).
class OsPacientesSerializer(serializers.ModelSerializer):
    
    # Campo para la escritura (recibe el ID numérico de ObrasSociales desde el frontend)
    # Mapea 'os_id' a la clave 'os' del modelo.
    os_id = serializers.IntegerField(write_only=True, source='os')
    
    # Campo para la lectura (devuelve el objeto Obra Social completo para mostrar el nombre)
    os_info = ObrasSocialesSerializer(source='os', read_only=True)
    
    class Meta:
        model = OsPacientes
        # Excluimos 'paciente' ya que será establecido por el serializador padre (PacientesSerializer)
        fields = ('id', 'os_id', 'os_info', 'num_afiliado')

# --- Serializer Principal ---

class PacientesSerializer(serializers.ModelSerializer):
    
    # 1. CAMPOS DE LECTURA (GET): Muestran el objeto anidado completo
    # Usamos *_info para evitar conflictos de nombre.
    genero_info = GenerosSerializer(source='genero', read_only=True)
    antecedentes_info = AntecedentesSerializer(source='antecedentes', many=True, read_only=True)
    analisis_funcional_info = AnalisisFuncionalSerializer(source='analisis_funcional', many=True, read_only=True)

# 🚨 NUEVOS CAMPOS ANIDADOS 🚨
    # Para LECTURA: Usamos el nombre de la relación inversa ('ospacientes_set')
    os_pacientes_info = OsPacientesSerializer(source='ospacientes_set', many=True, read_only=True)
    
    # Para ESCRITURA: El frontend debe enviar un array de objetos bajo esta clave
    os_pacientes_data = OsPacientesSerializer(many=True, write_only=True, required=False)

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
            # 🚨 NUEVO CAMPO DE LECTURA ANIDADA 🚨
            'os_pacientes_info',
            
            # Campos de Escritura (IDs) - ¡DEBEN IR AQUÍ!
            'genero_id',       
            'antecedentes_ids', 
            'analisis_funcional_ids', 
            # 🚨 NUEVO CAMPO DE ESCRITURA ANIDADA 🚨
            'os_pacientes_data',
        )
        # 'activo' y 'edad' son read_only
        read_only_fields = ('activo', 'edad',) 

    def create(self, validated_data):
        # 1. Extraer las listas de IDs M2M usando pop() 
        # (Se usa la clave mapeada por `source`: 'antecedentes', 'analisis_funcional')
        antecedentes_data = validated_data.pop('antecedentes', []) 
        analisis_funcional_data = validated_data.pop('analisis_funcional', [])
        genero_id = validated_data.pop('genero')
        
        # 🚨 NUEVO: Extraer datos anidados de OsPacientes
        os_pacientes_data = validated_data.pop('os_pacientes_data', [])

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

        # 4. 🚨 NUEVO: Crear los registros de OsPacientes
        for os_paciente_item in os_pacientes_data:
            # `os_paciente_item['os']` contiene el ID numérico de la Obra Social
            OsPacientes.objects.create(
                paciente=paciente, 
                os_id=os_paciente_item['os'], 
                num_afiliado=os_paciente_item['num_afiliado']
            )
        
        return paciente
