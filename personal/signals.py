from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Personal

@receiver(pre_save, sender=Personal)
def sincronizar_estado_activo(sender, instance, **kwargs):
    """
    Signal que sincroniza el campo 'activo' del Personal 
    con el campo 'is_active' del User asociado.
    
    Se ejecuta ANTES de guardar el Personal (pre_save) para 
    actualizar el User en la misma transacción.
    """
    # Verificar que el Personal tenga un User asociado
    if instance.user:
        # Sincronizar el estado: activo del Personal -> is_active del User
        instance.user.is_active = instance.activo
        instance.user.save()