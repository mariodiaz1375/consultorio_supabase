from django.db import models
from pacientes.models import Pacientes
from personal.models import Personal
from django.utils import timezone

# Create your models here.
class PiezasDentales(models.Model):
    codigo_pd = models.CharField(max_length=10)

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

class Trtamientos(models.Model):
    nombre_trat = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre_trat
    
    class Meta:
        verbose_name = 'Tratamiento'
        verbose_name_plural = 'Tratamientos'

class HistoriasClinicas(models.Model):
    paciente = models.ForeignKey(Pacientes, 
                                 on_delete=models.PROTECT)
    odontologo = models.ForeignKey(Personal, 
                                 on_delete=models.PROTECT)
    desc_hc = models.TextField(max_length=200)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    finalizado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.paciente.dni} {self.paciente.nombre} {self.fecha_inicio} {self.finalizado}"
    
    def save(self, *args, **kwargs):
        if self.finalizado and not self.fecha_fin:
            self.fecha_fin = timezone.now()
        elif not self.finalizado:
            self.fecha_fin = None  # Opcional: Limpia la fecha_fin si se desmarca
        super(HistoriasClinicas, self).save(*args, **kwargs)
    
    class Meta:
        verbose_name = 'Historia clinica'
        verbose_name_plural = 'Historias clinicas'


class DetallesHC(models.Model):
    tratamiento = models.ForeignKey(Trtamientos, 
                                    on_delete=models.PROTECT)
    cara_dental = models.ForeignKey(CarasDentales, 
                                    on_delete=models.PROTECT)
    pieza_dental = models.ForeignKey(PiezasDentales,
                                    on_delete=models.PROTECT)
    hist_clin = models.ForeignKey(HistoriasClinicas, 
                                    on_delete=models.PROTECT)

    # def __str__(self):
    #     return self.nombre_trat
    
    class Meta:
        verbose_name = 'Detalle de historio clinica'
        verbose_name_plural = 'Detalles de historia clinica'


class SeguimientoHC(models.Model):
    hist_clin = models.ForeignKey(HistoriasClinicas, 
                                    on_delete=models.PROTECT)
    descripcion = models.TextField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)

    # def __str__(self):
    #     return self.nombre_trat
    
    class Meta:
        verbose_name = 'Seguimiento de historia clinica'
        verbose_name_plural = 'Seguimiento de historia clinica'



# CREATE TABLE piezas_dentales (
# id_pieza INT AUTO_INCREMENT,
# cod_pd VARCHAR(2) NOT NULL,
# CONSTRAINT pk_piezas PRIMARY KEY(id_pieza));

# CREATE TABLE caras_dentales (
# id_cara INT AUTO_INCREMENT,
# nomb_cara VARCHAR(20) NOT NULL,
# CONSTRAINT pk_cd PRIMARY KEY(id_cara));

# CREATE TABLE tratamientos (
# id_trat INT AUTO_INCREMENT,
# nom_trat VARCHAR(50) NOT NULL,
# desc_trat VARCHAR(100),
# CONSTRAINT pk_trat PRIMARY KEY(id_trat));

# CREATE TABLE historia_clinica (
# id_hc INT AUTO_INCREMENT,
# id_paciente_hc INT NOT NULL,
# id_odon_hc INT NOT NULL,
# desc_hc VARCHAR(100),
# fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
# fecha_fin DATE,
# CONSTRAINT pk_hc PRIMARY KEY(id_hc));

# CREATE TABLE trat_pd_cd (
# id_trat_pd_cd INT AUTO_INCREMENT,
# id_trat INT NOT NULL,
# id_cd INT NOT NULL,
# id_pd INT NOT NULL,
# id_hc INT NOT NULL,
# CONSTRAINT pk_trat_pd_cd PRIMARY KEY(id_trat_pd_cd));