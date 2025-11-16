from django.db.models.signals import post_save, pre_save, post_delete, pre_delete
from django.dispatch import receiver
from .models import Turnos, AuditoriaTurnos

@receiver(pre_save, sender=Turnos)
def guardar_estado_anterior_turno(sender, instance, **kwargs):
    """
    Antes de guardar, almacenamos el estado anterior del turno
    para poder compararlo después.
    """
    if instance.pk:  # Solo si el objeto ya existe (es una actualización)
        try:
            instance._estado_anterior = Turnos.objects.get(pk=instance.pk)
        except Turnos.DoesNotExist:
            instance._estado_anterior = None
    else:
        instance._estado_anterior = None


@receiver(post_save, sender=Turnos)
def registrar_auditoria_turno(sender, instance, created, **kwargs):
    """
    Signal que se ejecuta después de guardar un Turno.
    Registra en auditoría las creaciones y modificaciones.
    """
    
    # Obtener información del paciente
    paciente = instance.paciente if instance.paciente else None
    paciente_nombre = str(paciente) if paciente else 'N/A'
    paciente_dni = paciente.dni if paciente else 'N/A'
    
    # Obtener información del odontólogo
    odontologo_nombre = str(instance.odontologo) if instance.odontologo else 'N/A'
    
    # Obtener el horario
    horario = instance.horario_turno.hora if instance.horario_turno else None
    
    # Determinar la acción y observaciones
    accion = None
    observaciones = ""
    estado_anterior_nombre = None
    estado_nuevo_nombre = str(instance.estado_turno) if instance.estado_turno else 'N/A'
    
    # 🚨 Usuario que realizó la acción
    usuario_que_realizo_accion = instance.modificado_por
    
    if created:
        # Es un nuevo turno (siempre debería ser "Agendado")
        accion = 'CREACION'
        observaciones = f"Turno agendado para {paciente_nombre} con {odontologo_nombre} el {instance.fecha_turno} a las {horario or 'N/A'}."
    else:
        # Es una actualización
        estado_anterior = getattr(instance, '_estado_anterior', None)
        
        if estado_anterior:
            # 🚨 PRIORIDAD: Verificar si cambió el estado
            if estado_anterior.estado_turno != instance.estado_turno:
                accion = 'CAMBIO_ESTADO'
                estado_anterior_nombre = str(estado_anterior.estado_turno)
                
                # Mensajes específicos según el cambio de estado
                if estado_nuevo_nombre == 'Atendido':
                    observaciones = f"Turno marcado como ATENDIDO (antes: {estado_anterior_nombre})."
                elif estado_nuevo_nombre == 'Cancelado':
                    observaciones = f"Turno CANCELADO por inasistencia o imposibilidad (antes: {estado_anterior_nombre}). El horario NO fue liberado."
                else:
                    observaciones = f"Estado cambiado de '{estado_anterior_nombre}' a '{estado_nuevo_nombre}'."
            
            # Si NO cambió el estado, verificar otros cambios
            else:
                cambios = []
                
                if estado_anterior.fecha_turno != instance.fecha_turno:
                    cambios.append(f"fecha ({estado_anterior.fecha_turno} → {instance.fecha_turno})")
                
                if estado_anterior.horario_turno != instance.horario_turno:
                    hora_anterior = estado_anterior.horario_turno.hora if estado_anterior.horario_turno else 'N/A'
                    hora_nueva = instance.horario_turno.hora if instance.horario_turno else 'N/A'
                    cambios.append(f"horario ({hora_anterior} → {hora_nueva})")
                
                if estado_anterior.odontologo != instance.odontologo:
                    cambios.append(f"odontólogo ({estado_anterior.odontologo} → {instance.odontologo})")
                
                if estado_anterior.paciente != instance.paciente:
                    cambios.append(f"paciente")
                
                if cambios:
                    accion = 'MODIFICACION'
                    observaciones = f"Turno reprogramado: {', '.join(cambios)}."
    
    # Crear el registro de auditoría si hubo una acción relevante
    if accion:
        AuditoriaTurnos.objects.create(
            turno=instance,
            accion=accion,
            usuario=usuario_que_realizo_accion,
            turno_numero=instance.id,
            paciente_nombre=paciente_nombre,
            paciente_dni=paciente_dni,
            odontologo_nombre=odontologo_nombre,
            fecha_turno=instance.fecha_turno,
            horario_turno=horario,
            estado_anterior=estado_anterior_nombre,
            estado_nuevo=estado_nuevo_nombre,
            observaciones=observaciones,
        )


# 🚨 NUEVO: Guardar información ANTES de eliminar
@receiver(pre_delete, sender=Turnos)
def guardar_info_antes_de_eliminar(sender, instance, **kwargs):
    """
    Antes de eliminar, guardamos la información del turno en el objeto
    para usarla después en el registro de auditoría.
    """
    # Guardar toda la información que necesitamos
    instance._info_eliminacion = {
        'id': instance.id,
        'paciente': instance.paciente,
        'odontologo': instance.odontologo,
        'fecha_turno': instance.fecha_turno,
        'horario_turno': instance.horario_turno,
        'estado_turno': instance.estado_turno,
        'modificado_por': instance.modificado_por,  # 🚨 GUARDAMOS EL USUARIO
    }


# 🚨 ACTUALIZADO: Usar la información guardada en pre_delete
@receiver(post_delete, sender=Turnos)
def registrar_eliminacion_turno(sender, instance, **kwargs):
    """
    Signal que se ejecuta después de ELIMINAR un Turno.
    Esto significa que se LIBERÓ el horario, no que se canceló el turno.
    """
    
    # Recuperar la información que guardamos en pre_delete
    info = getattr(instance, '_info_eliminacion', {})
    
    # Obtener información del paciente
    paciente = info.get('paciente')
    paciente_nombre = str(paciente) if paciente else 'N/A'
    paciente_dni = paciente.dni if paciente else 'N/A'
    
    # Obtener información del odontólogo
    odontologo = info.get('odontologo')
    odontologo_nombre = str(odontologo) if odontologo else 'N/A'
    
    # Obtener el horario
    horario_turno = info.get('horario_turno')
    horario = horario_turno.hora if horario_turno else None
    
    # Estado del turno al momento de eliminarlo
    estado_turno = info.get('estado_turno')
    estado_nombre = str(estado_turno) if estado_turno else 'N/A'
    
    # 🚨 USUARIO QUE ELIMINÓ EL TURNO
    usuario_que_elimino = info.get('modificado_por')
    
    # Crear registro de ELIMINACIÓN (liberación de horario)
    AuditoriaTurnos.objects.create(
        turno=None,  # Ya no existe el turno
        accion='ELIMINACION',
        usuario=usuario_que_elimino,  # 🚨 AHORA SÍ TENEMOS EL USUARIO
        turno_numero=info.get('id'),
        paciente_nombre=paciente_nombre,
        paciente_dni=paciente_dni,
        odontologo_nombre=odontologo_nombre,
        fecha_turno=info.get('fecha_turno'),
        horario_turno=horario,
        estado_anterior=estado_nombre,
        estado_nuevo='ELIMINADO',
        observaciones=f"Turno ELIMINADO para liberar horario. Paciente: {paciente_nombre}. Estado previo: {estado_nombre}.",
    )