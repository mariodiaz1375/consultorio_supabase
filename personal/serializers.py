from rest_framework import serializers
from .models import Personal
from django.contrib.auth.models import User

# class Personal1Serializer(serializers.ModelSerializer):
#     class Meta:
#         model = Personal
#         fields = '__all__'

# En tu serializers.py

from rest_framework import serializers
from .models import Personal
from django.contrib.auth.models import User
# Asegúrate de importar la función assign_user_group si la mantuviste en models.py o muévela aquí
# from .models import assign_user_group 

class Personal1Serializer(serializers.ModelSerializer):
    # Campos adicionales solo para la creación (escritura)
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    
    # Campo de usuario para lectura, si lo necesitas.
    # user = serializers.PrimaryKeyRelatedField(read_only=True) # O un Serializer para User

    class Meta:
        model = Personal
        fields = (
            'id', 'nombre', 'apellido', 'dni', 'fecha_nacimiento', 
            'domicilio', 'telefono', 'email', 'matricula', 'activo', 
            'puesto', 'especialidades', 'user',
            # Campos de escritura para crear el User
            'username', 'password' 
        )
        read_only_fields = ('user',) # El campo 'user' se manejará internamente

    def create(self, validated_data):
        # 1. Obtener datos del usuario
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        especialidades_data = validated_data.pop('especialidades', []) 
        
        # 2. Crear el objeto User
        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=validated_data.get('email', ''), # Usar el email del personal
            first_name=validated_data.get('nombre', ''),
            last_name=validated_data.get('apellido', '')
        )
        
        # 3. Crear el objeto Personal, asignando el usuario
        personal = Personal.objects.create(user=user, **validated_data)

        if especialidades_data:
            personal.especialidades.set(especialidades_data)
        
        # 4. Asignar grupo (si quieres mantener la lógica de grupos)
        # assign_user_group(personal) 
        
        return personal


class Personal2Serializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = ['nombre', 'apellido', 'matricula']
