from rest_framework import serializers
from .models import Personal, Puestos, Especialidades
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

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
    

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer para solicitar el reseteo de contraseña"""
    email = serializers.EmailField()

    def validate_email(self, value):
        """Verifica que el email exista en la base de datos"""
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('No existe un usuario con este correo electrónico.')
        return value

    def save(self):
        """Envía el email con el enlace de recuperación"""
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generar token y uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Construir URL de recuperación
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Enviar email
        subject = 'Recuperación de Contraseña - Consultorio Manjón'
        message = f"""
Hola {user.first_name or user.username},

Has solicitado restablecer tu contraseña para el Sistema de Gestión del Consultorio Manjón.

Haz clic en el siguiente enlace para crear una nueva contraseña:
{reset_url}

Este enlace expirará en 24 horas.

Si no solicitaste este cambio, ignora este correo.

Saludos,
Equipo del Consultorio Manjón
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        
        return {'message': 'Se ha enviado un correo con instrucciones para recuperar tu contraseña.'}


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer para confirmar el cambio de contraseña"""
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        """Valida que las contraseñas coincidan"""
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Las contraseñas no coinciden.'
            })
        
        # Validar token y uid
        try:
            uid = force_str(urlsafe_base64_decode(data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({'uid': 'Enlace inválido.'})
        
        if not default_token_generator.check_token(user, data['token']):
            raise serializers.ValidationError({'token': 'El enlace ha expirado o es inválido.'})
        
        data['user'] = user
        return data

    def save(self):
        """Guarda la nueva contraseña"""
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return {'message': 'Contraseña actualizada exitosamente.'}