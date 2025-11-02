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