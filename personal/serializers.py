from rest_framework import serializers
from .models import Personal, Puestos, Especialidades
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
    
    # 2. CAMPOS DE ESCRITURA (POST/PUT/PATCH): Reciben los IDs.
    # 🔧 MEJORA: Hacerlos opcionales para que PATCH funcione sin enviar todos los datos
    puesto_id = serializers.IntegerField(write_only=True, source='puesto', required=False)
    especialidades_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        source='especialidades',
        required=False  # 🆕 Opcional para PATCH
    )
    
    # 3. CAMPOS DE USUARIO (SOLO ESCRITURA): Son write_only y opcionales
    username = serializers.CharField(write_only=True, required=False) 
    password = serializers.CharField(write_only=True, required=False) 
    
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
            
            # Campos de usuario
            'username', 
            'password' 
        )
        read_only_fields = ('user',)

    def create(self, validated_data):
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
        
        # Crear el objeto Personal
        personal = Personal.objects.create(user=user, puesto_id=puesto_id, **validated_data)

        if especialidades_data:
            personal.especialidades.set(especialidades_data)
        
        return personal
    
    def update(self, instance, validated_data):
        # 🔧 MEJORA: Manejo de username y password en actualizaciones
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)
        
        # Si se proporcionó username o password, actualizar el User asociado
        if username or password:
            user = instance.user
            if username:
                user.username = username
            if password:
                user.set_password(password)  # Importante: usar set_password para hashear
            user.save()
        
        # Manejo de la relación ManyToMany (Especialidades)
        if 'especialidades' in validated_data:
            especialidades_data = validated_data.pop('especialidades')
            instance.especialidades.set(especialidades_data)
        
        # Manejo del puesto (ForeignKey)
        if 'puesto' in validated_data:
            puesto_id = validated_data.pop('puesto')
            instance.puesto_id = puesto_id
        
        # Actualizar el resto de campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance