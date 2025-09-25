from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User, Group, Permission

class Puestos(models.Model):
    nombre_puesto = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_puesto
    class Meta:
        verbose_name = 'Puesto'
        verbose_name_plural = 'Puestos'


class Especialidades(models.Model):
    nombre_esp = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_esp
    
    class Meta:
        verbose_name = 'Especialidad'
        verbose_name_plural = 'Especialidades'


class Personal(models.Model):
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    dni = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField()
    domicilio = models.CharField(max_length=255)
    telefono = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    matricula = models.CharField(max_length=255, default='-')
    activo = models.BooleanField(default=True)
    puesto = models.ForeignKey(Puestos, on_delete=models.PROTECT, default=3)
    especialidades = models.ManyToManyField(
        Especialidades, 
        related_name='personal',
        blank=True
        )
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.dni} {self.nombre} {self.apellido}"
    
    class Meta:
        verbose_name = 'Personal'
        verbose_name_plural = 'Personal'



def assign_user_group(personal_instance):
    """Asigna grupo según el puesto del personal"""
    user = personal_instance.user
    puesto_nombre = personal_instance.puesto.nombre_puesto.lower()
    
    # Limpiar grupos anteriores
    user.groups.clear()
    
    # Mapeo de puestos a grupos
    puesto_grupo_map = {
        'admin': 'Admin',
        'odontólogo/a': 'Odontólogo/a', 
        'secretario/a': 'Secretario/a',
    }
    
    grupo_nombre = puesto_grupo_map.get(puesto_nombre)
    if grupo_nombre:
        try:
            grupo = Group.objects.get(name=grupo_nombre)
            user.groups.add(grupo)
            print(f"Usuario {user.username} asignado al grupo {grupo_nombre}")
        except Group.DoesNotExist:
            print(f"Grupo '{grupo_nombre}' no existe en el sistema")

@receiver(post_save, sender=Personal)
def manage_user_for_personal(sender, instance, created, **kwargs):
    """Crea usuario y asigna grupo al personal"""
    # Crear usuario si es nuevo registro
    if created and not instance.user:
        username = f"{instance.nombre.lower()}.{instance.apellido.lower()}"
        user = User.objects.create_user(
            username=username,
            email=instance.email,
            first_name=instance.nombre,
            last_name=instance.apellido,
            password=str(instance.dni)
        )
        instance.user = user
        instance.save()

    # Asignar grupo (tanto para creación como actualización)
    if instance.user:
        assign_user_group(instance)

# @receiver(post_save, sender=Personal)
# def create_user_for_personal(sender, instance, created, **kwargs):
#     if created and not instance.user:
#         username = f"{instance.nombre.lower()}.{instance.apellido.lower()}"
#         user = User.objects.create_user(
#             username=username,
#             email=instance.email if hasattr(instance, 'email') else '',
#             first_name=instance.nombre,
#             last_name=instance.apellido,
#             password=str(instance.dni)  # Contraseña inicial = DNI
#         )
#         instance.user = user
#         instance.save()

#     if instance.user:
#         assign_user_group(instance)

# def assign_user_group(personal_instance):
#     from django.contrib.auth.models import Group
    
#     user = personal_instance.user
#     puesto_nombre = personal_instance.puesto.nombre_puesto.lower()
    
#     user.groups.clear()
    
#     puesto_grupo_map = {
#         'admin': 'Admin',
#         'odontólogo/a': 'Odontólogo/a', 
#         'secretario/a': 'Secretario/a',
#     }
    
#     grupo_nombre = puesto_grupo_map.get(puesto_nombre)
#     if grupo_nombre:
#         try:
#             grupo = Group.objects.get(name=grupo_nombre)
#             user.groups.add(grupo)
#         except Group.DoesNotExist:
#             pass

# @receiver(post_save, sender=Personal)
# def update_user_group_on_puesto_change(sender, instance, **kwargs):
#     """Actualiza el grupo cuando cambia el puesto"""
#     if instance.user and not kwargs.get('created', False):
#         assign_user_group(instance)

