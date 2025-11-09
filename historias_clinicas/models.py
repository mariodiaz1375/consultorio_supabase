from django.db import models
from pacientes.models import Pacientes
from personal.models import Personal
from django.utils import timezone

# Create your models here.
class PiezasDentales(models.Model):
    codigo_pd = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.codigo_pd
    
    class Meta:
        verbose_name = 'Pieza Dental'
        verbose_name_plural = 'Piezas Dentales'


class CarasDentales(models.Model):
    nombre_cara = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre_cara
    
    class Meta:
        verbose_name = 'Cara Dental'
        verbose_name_plural = 'Caras Dentales'

class Tratamientos(models.Model):
    nombre_trat = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_trat
    
    class Meta:
        verbose_name = 'Tratamiento'
        verbose_name_plural = 'Tratamientos'

class HistoriasClinicas(models.Model):
    # Change 2: Added related_name
    paciente = models.ForeignKey(Pacientes, 
                                 on_delete=models.PROTECT,
                                 related_name='historias_clinicas') 
    # Change 2: Added related_name
    odontologo = models.ForeignKey(Personal, 
                                 on_delete=models.PROTECT,
                                 related_name='historias_atendidas') 
    # Change 3 (Minor): Renamed field for clarity
    descripcion = models.TextField(null=True, blank=True ,max_length=200, verbose_name='Motivo de Consulta/Descripción Inicial') 
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    finalizado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.paciente.dni} {self.paciente.nombre} {self.fecha_inicio.strftime('%Y-%m-%d')} ({'Finalizada' if self.finalizado else 'Abierta'})"
    
    def save(self, *args, **kwargs):
        if self.finalizado and not self.fecha_fin:
            self.fecha_fin = timezone.now()
        elif not self.finalizado:
            self.fecha_fin = None  # Opcional: Limpia la fecha_fin si se desmarca
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Historia clinica'
        verbose_name_plural = 'Historias clinicas'


class DetallesHC(models.Model):
    # Change 2: Added related_name to all FKs
    tratamiento = models.ForeignKey(Tratamientos, 
                                    on_delete=models.PROTECT,
                                    related_name='detalles_hc') 
    # Change 2: Added related_name
    cara_dental = models.ForeignKey(CarasDentales, 
                                    on_delete=models.PROTECT,
                                    related_name='detalles_hc') 
    # Change 2: Added related_name
    pieza_dental = models.ForeignKey(PiezasDentales,
                                    on_delete=models.PROTECT,
                                    related_name='detalles_hc')
    # Change 2/3: Renamed for clarity and added related_name
    historia_clinica = models.ForeignKey(HistoriasClinicas, 
                                    on_delete=models.PROTECT,
                                    related_name='detalles')

    # def __str__(self):
    #     return self.nombre_trat
    
    class Meta:
        verbose_name = 'Detalle de historia clinica'
        verbose_name_plural = 'Detalles de historia clinica'
        unique_together = ('historia_clinica', 'tratamiento', 'pieza_dental', 'cara_dental')

    def __str__(self):
        return f'{self.historia_clinica.paciente} | {self.tratamiento.nombre_trat} en {self.pieza_dental.codigo_pd}'


class SeguimientoHC(models.Model):
    historia_clinica = models.ForeignKey(HistoriasClinicas, 
                                    on_delete=models.PROTECT,
                                    related_name='seguimientos')
    odontologo = models.ForeignKey(Personal, 
                                   on_delete=models.PROTECT, 
                                   related_name='seguimientos_creados')
    descripcion = models.TextField(max_length=100, null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Seguimiento {self.id} | HC: {self.historia_clinica.id} | Fecha: {self.fecha.strftime("%Y-%m-%d")}'
    
    class Meta:
        verbose_name = 'Seguimiento de historia clinica'
        verbose_name_plural = 'Seguimientos de historia clinica'