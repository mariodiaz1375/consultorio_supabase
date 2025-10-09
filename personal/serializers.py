from rest_framework import serializers
from .models import Personal, Puestos, Especialidades # Asegúrate de importar Puestos y Especialidades
from django.contrib.auth.models import User

# Serializer para Puestos (lectura)
class PuestosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puestos
        fields = ('id', 'nombre_puesto') 

# Serializer para Especialidades (lectura)
class EspecialidadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidades
        fields = ('id', 'nombre_esp')


class Personal1Serializer(serializers.ModelSerializer):
    
    # 1. CAMPOS DE LECTURA (GET): Muestran el objeto anidado completo (nombres).
    puesto_info = PuestosSerializer(source='puesto', read_only=True)
    especialidades_info = EspecialidadesSerializer(source='especialidades', many=True, read_only=True)
    
    # 2. CAMPOS DE ESCRITURA (POST/PUT): Reciben los IDs.
    puesto_id = serializers.IntegerField(write_only=True, source='puesto')
    especialidades_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        source='especialidades'
    )
    
    # 3. CAMPOS DE USUARIO (SOLO ESCRITURA): Son write_only.
    username = serializers.CharField(write_only=True) 
    password = serializers.CharField(write_only=True) 
    
    class Meta:
        model = Personal
        fields = (
            # Campos del modelo
            'id', 'nombre', 'apellido', 'dni', 'fecha_nacimiento', 
            'domicilio', 'telefono', 'email', 'matricula', 'activo', 
            'user', # Campo ForeignKey del modelo
            
            # Campos de Lectura (Nested)
            'puesto_info', 
            'especialidades_info',
            
            # Campos de Escritura (IDs)
            'puesto_id',       
            'especialidades_ids', 
            
            # <--- ¡LA CLAVE! AÑADIRLOS AQUÍ PARA SATISFACER EL ASSERTIONERROR
            'username', 
            'password' 
        )
        read_only_fields = ('user',) 

    # El método create() sigue siendo necesario para crear el objeto User y manejar relaciones
    def create(self, validated_data):
        # El pop ahora usa 'username', 'password', y 'especialidades' (que contiene la lista de IDs)
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        especialidades_data = validated_data.pop('especialidades', []) 
        puesto_id = validated_data.pop('puesto')
        
        # Crear el objeto User
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=validated_data.get('email', ''),
            first_name=validated_data.get('nombre', ''),
            last_name=validated_data.get('apellido', '')
        )
        
        # Crear el objeto Personal, 'puesto' se maneja correctamente porque validated_data 
        # contiene el ID numérico bajo la clave 'puesto'.
        personal = Personal.objects.create(user=user, puesto_id=puesto_id, **validated_data)

        if especialidades_data:
            personal.especialidades.set(especialidades_data)
        
        return personal
    
    # IMPORTANTE: También debes actualizar el método `update` si lo tienes.
    # El método `update` también debe manejar `puesto_id` y `especialidades_ids`.
    def update(self, instance, validated_data):
        # Manejo de la relación ManyToMany (Especialidades)
        if 'especialidades' in validated_data:
            especialidades_data = validated_data.pop('especialidades')
            instance.especialidades.set(especialidades_data)
        
        # Llama al método update del padre para manejar el resto de campos (incluyendo 'puesto')
        return super().update(instance, validated_data)


# class Personal2Serializer(serializers.ModelSerializer):
#     class Meta:
#         model = Personal
#         fields = ['nombre', 'apellido', 'matricula']
