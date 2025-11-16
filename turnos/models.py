from django.db import models
from personal.models import Personal
from pacientes.models import Pacientes
from django.core.exceptions import ValidationError

# Create your models here.

class EstadosTurnos(models.Model):
    nombre_est_tur = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_est_tur
    
    class Meta:
        verbose_name = 'Estado de turnos'
        verbose_name_plural = 'Estados de Turnos'

class HorarioFijo(models.Model):
    hora = models.TimeField(unique=True, verbose_name='Hora del Turno')

    def __str__(self):
        # Formato fácil de leer (ej. 17:00)
        return self.hora.strftime('%H:%M')

    class Meta:
        verbose_name = 'Horario Fijo'
        verbose_name_plural = 'Horarios Fijos'
        ordering = ['hora']


class DiaSemana(models.Model):
    # Usamos Choices para asegurar que solo se ingresen valores válidos y facilitar la lectura
    DIAS = [
        (0, 'Lunes'),
        (1, 'Martes'),
        (2, 'Miércoles'),
        (3, 'Jueves'),
        (4, 'Viernes'),
    ]
    
    # Campo clave que almacena el número, útil para cálculos de fechas
    numero_dia = models.IntegerField(
        choices=DIAS, 
        unique=True,
        verbose_name='Día de la Semana'
    )
    
    # Campo que solo devuelve el nombre para __str__
    def __str__(self):
        return dict(self.DIAS).get(self.numero_dia, 'Día Desconocido')

    class Meta:
        verbose_name = 'Día de la Semana'
        verbose_name_plural = 'Días de la Semana'


class Turnos(models.Model):
    odontologo = models.ForeignKey(Personal, on_delete=models.PROTECT)
    paciente = models.ForeignKey(Pacientes, on_delete=models.PROTECT)
    fecha_turno = models.DateField(verbose_name='Fecha')
    horario_turno = models.ForeignKey(HorarioFijo, on_delete=models.PROTECT, verbose_name='Hora', null=True, blank=True)
    estado_turno = models.ForeignKey(EstadosTurnos, on_delete=models.PROTECT)
    motivo = models.TextField(blank=True, null=True, verbose_name='Motivo del Turno')

    class Meta:
        verbose_name = 'Turno'
        verbose_name_plural = 'Turnos'
        unique_together = ('odontologo', 'fecha_turno', 'horario_turno')


# ============================================
# MODELO DE AUDITORÍA
# ============================================

class AuditoriaTurnos(models.Model):
    """
    Tabla de auditoría que registra todos los cambios en los turnos.
    Se llena automáticamente mediante signals (triggers de Django).
    """
    
    ACCIONES = [
        ('CREACION', 'Turno Agendado'),
        ('MODIFICACION', 'Turno Modificado'),
        ('CAMBIO_ESTADO', 'Cambio de Estado'),
        ('ELIMINACION', 'Turno Eliminado (Horario Liberado)'),
    ]
    
    # Información del turno
    turno = models.ForeignKey(
        Turnos, 
        on_delete=models.SET_NULL,
        null=True,
        related_name='auditoria_registros'
    )
    
    # Información de la acción
    accion = models.CharField(max_length=20, choices=ACCIONES)
    fecha_accion = models.DateTimeField(auto_now_add=True)
    
    # Usuario que realizó la acción
    usuario = models.ForeignKey(
        Personal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acciones_auditoria_turnos'
    )
    
    # Datos del contexto (desnormalizados para histórico)
    turno_numero = models.IntegerField(null=True, blank=True)  # Backup del ID
    paciente_nombre = models.CharField(max_length=255, null=True, blank=True)
    paciente_dni = models.CharField(max_length=20, null=True, blank=True)
    odontologo_nombre = models.CharField(max_length=255, null=True, blank=True)
    fecha_turno = models.DateField(null=True, blank=True)
    horario_turno = models.TimeField(null=True, blank=True)
    
    # Estado del turno
    estado_anterior = models.CharField(max_length=50, null=True, blank=True)
    estado_nuevo = models.CharField(max_length=50, null=True, blank=True)
    
    # Información adicional
    observaciones = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.accion} - Turno #{self.turno_numero} - {self.fecha_accion.strftime('%d/%m/%Y %H:%M')}"
    
    class Meta:
        verbose_name = 'Auditoría de Turno'
        verbose_name_plural = 'Auditorías de Turnos'
        ordering = ['-fecha_accion']
        indexes = [
            models.Index(fields=['fecha_accion']),
            models.Index(fields=['turno']),
            models.Index(fields=['turno_numero']),
        ]