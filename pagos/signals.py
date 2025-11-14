from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Pagos, AuditoriaPagos

@receiver(pre_save, sender=Pagos)
def guardar_estado_anterior(sender, instance, **kwargs):
    """
    Antes de guardar, almacenamos el estado anterior del pago
    para poder compararlo después.
    """
    if instance.pk:  # Solo si el objeto ya existe (es una actualización)
        try:
            instance._estado_anterior = Pagos.objects.get(pk=instance.pk)
        except Pagos.DoesNotExist:
            instance._estado_anterior = None
    else:
        instance._estado_anterior = None


@receiver(post_save, sender=Pagos)
def registrar_auditoria_pago(sender, instance, created, **kwargs):
    """
    Signal que se ejecuta después de guardar un Pago.
    Registra en auditoría SOLO cuando se marca o desmarca como pagado.
    """
    
    # Obtener información del paciente
    paciente = instance.hist_clin.paciente if instance.hist_clin else None
    paciente_nombre = str(paciente) if paciente else 'N/A'
    paciente_dni = paciente.dni if paciente else 'N/A'
    
    # Obtener el nombre del tipo de pago
    tipo_pago_nombre = str(instance.tipo_pago) if instance.tipo_pago else 'Sin tipo'
    
    # Determinar si hubo cambio en el estado 'pagado'
    accion = None
    observaciones = ""
    
    if created:
        # Es un nuevo registro
        if instance.pagado:
            accion = 'REGISTRO'
            observaciones = f"Pago registrado como pagado al momento de crear."
        # Si se crea sin marcar como pagado, NO registramos en auditoría
    else:
        # Es una actualización - verificar si cambió el estado
        estado_anterior = getattr(instance, '_estado_anterior', None)
        
        if estado_anterior:
            if not estado_anterior.pagado and instance.pagado:
                # Se marcó como pagado
                accion = 'REGISTRO'
                observaciones = f"Pago marcado como pagado."
            elif estado_anterior.pagado and not instance.pagado:
                # Se canceló el pago
                accion = 'CANCELACION'
                observaciones = f"Pago cancelado (desmarcado)."
            # Si no cambió el estado 'pagado', no registramos nada
    
    # Solo crear registro de auditoría si hubo una acción relevante
    if accion:
        AuditoriaPagos.objects.create(
            pago=instance,
            accion=accion,
            usuario=instance.registrado_por,
            hist_clin=instance.hist_clin,  # 🚨 RELACIÓN CON HC
            tipo_pago_nombre=tipo_pago_nombre,
            hist_clin_numero=instance.hist_clin.id if instance.hist_clin else None,  # 🚨 BACKUP DEL ID
            paciente_nombre=paciente_nombre,
            paciente_dni=paciente_dni,
            estado_pagado=instance.pagado,
            fecha_pago=instance.fecha_pago,
            observaciones=observaciones,
        )