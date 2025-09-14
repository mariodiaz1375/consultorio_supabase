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

class Turnos(models.Model):
    odontologo = models.ForeignKey(Personal, on_delete=models.PROTECT)
    paciente = models.ForeignKey(Pacientes, on_delete=models.PROTECT)
    fecha_turno = models.DateField()
    hora_turno = models.TimeField()
    estado_turno = models.ForeignKey(EstadosTurnos, on_delete=models.PROTECT)

    class Meta:
        verbose_name = 'Turno'
        verbose_name_plural = 'Turnos'

    def clean(self):
        # Validar que no haya otro turno en la misma fecha y hora
        if Turnos.objects.filter(fecha_turno=self.fecha_turno, hora_turno=self.hora_turno).exists():
            raise ValidationError("Este turno ya está ocupado")

    def save(self, *args, **kwargs):
        self.clean() # Llama a la validación antes de guardar
        super().save(*args, **kwargs)