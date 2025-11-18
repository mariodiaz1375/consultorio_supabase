from rest_framework import serializers
from .models import Personal, Puestos, Especialidades
from django.contrib.auth.models import User

# Serializer para Puestos (no cambia)
class PuestosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Puestos
        fields = ('id', 'nombre_puesto') 

# Serializer para Especialidades (no cambia)
class EspecialidadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidades
        fields = ('id', 'nombre_esp')


class Personal1Serializer(serializers.ModelSerializer):
    
    # ... (Campos de lectura no cambian) ...
    puesto_info = PuestosSerializer(source='puesto', read_only=True)
    especialidades_info = EspecialidadesSerializer(source='especialidades', many=True, read_only=True)
    username = serializers.SerializerMethodField(read_only=True)
    
    # ... (Campos de escritura no cambian) ...
    puesto_id = serializers.IntegerField(write_only=True, source='puesto', required=False)
    especialidades_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        source='especialidades',
        required=False
    )
    
    username_input = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    # 👇 --- CAMBIO 1: Añadir campo para la contraseña actual ---
    # Lo hacemos 'write_only' (no se mostrará en GETs) y 'required=False'
    current_password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Personal
        fields = (
            'id', 'nombre', 'apellido', 'dni', 'fecha_alta',
            'domicilio', 'telefono', 'email', 'matricula', 'activo', 
            'user', 
            'puesto_info', 
            'especialidades_info',
            'username',  
            'puesto_id',       
            'especialidades_ids', 
            'username_input',
            'password',
            # 👇 --- CAMBIO 2: Añadir el campo nuevo al Meta ---
            'current_password'
        )
        read_only_fields = ('user', 'username', 'fecha_alta')
    
    def get_username(self, obj):
        # ... (Este método no cambia) ...
        if obj.user:
            return obj.user.username
        return None

    def create(self, validated_data):
        # ... (Este método no cambia, se usa para crear nuevo personal) ...
        username = validated_data.pop('username_input', None)
        password = validated_data.pop('password')
        especialidades_data = validated_data.pop('especialidades', []) 
        puesto_id = validated_data.pop('puesto')
        
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=validated_data.get('email', ''),
            first_name=validated_data.get('nombre', ''),
            last_name=validated_data.get('apellido', '')
        )
        
        personal = Personal.objects.create(user=user, puesto_id=puesto_id, **validated_data)

        if especialidades_data:
            personal.especialidades.set(especialidades_data)
        
        return personal
    
    # 👇 --- CAMBIO 3: Lógica de actualización con validación ---
    def update(self, instance, validated_data):
        username = validated_data.pop('username_input', None)
        password = validated_data.pop('password', None)
        # Obtenemos la contraseña actual que envió el frontend
        current_password = validated_data.pop('current_password', None)
        
        user = instance.user
        
        if username:
            # Validar unicidad del username si se está cambiando
            if User.objects.filter(username=username).exclude(pk=user.pk).exists():
                raise serializers.ValidationError({'username': 'Este nombre de usuario ya está en uso.'})
            user.username = username

        if password:
            # Si se quiere cambiar la contraseña, AHORA validamos
            if not current_password:
                raise serializers.ValidationError(
                    {'current_password': ['Se requiere la contraseña actual para cambiarla.']}
                )
            
            # ¡Esta es la validación que faltaba!
            if not user.check_password(current_password):
                raise serializers.ValidationError(
                    {'current_password': ['La contraseña actual es incorrecta.']}
                )
            
            # Si todo es correcto, guardamos la nueva contraseña
            user.set_password(password)
        
        user.save()
        
        # ... (El resto de la lógica de update no cambia) ...
        if 'especialidades' in validated_data:
            especialidades_data = validated_data.pop('especialidades')
            instance.especialidades.set(especialidades_data)
        
        if 'puesto' in validated_data:
            puesto_id = validated_data.pop('puesto')
            instance.puesto_id = puesto_id
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance