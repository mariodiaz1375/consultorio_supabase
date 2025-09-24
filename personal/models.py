from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

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

@receiver(post_save, sender=Personal)
def create_user_for_personal(sender, instance, created, **kwargs):
    if created and not instance.user:
        username = f"{instance.nombre.lower()}.{instance.apellido.lower()}"
        user = User.objects.create_user(
            username=username,
            email=instance.email if hasattr(instance, 'email') else '',
            first_name=instance.nombre,
            last_name=instance.apellido,
            password=str(instance.dni)  # Contraseña inicial = DNI
        )
        instance.user = user
        instance.save()