from django.db import models
from historias_clinicas.models import HistoriasClinicas
from django.utils import timezone
from dateutil.relativedelta import relativedelta

# Create your models here.

class Entregas(models.Model):
    nombre_ent = models.CharField(max_length=20)

class Cuotas(models.Model):
    nombre_cuota = models.CharField(max_length=20)

class Pagos(models.Model):
    entrega = models.ForeignKey(Entregas, 
                              on_delete=models.PROTECT)
    cuota = models.ForeignKey(Cuotas, 
                              on_delete=models.PROTECT)
    hist_clin = models.ForeignKey(HistoriasClinicas, 
                              on_delete=models.PROTECT)
    fecha_limite = models.DateField()
    fecha_pago = models.DateTimeField()
    pagado = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.id:  # Solo establece la fecha límite si es un nuevo registro
            if self.cuota: 
                # Establecer la fecha límite en función de la entrega
                fecha_actual = timezone.now().date()
                if not self.fecha_limite:
                    self.fecha_limite = fecha_actual
                else:
                    # Ajustar la fecha límite por cada cuota
                    total_pagos = Pagos.objects.filter(entrega=self.entrega).count()
                    self.fecha_limite = fecha_actual + relativedelta(months=total_pagos)  # Incrementa un mes por cada cuota existente

        if self.pagado and not self.fecha_fin:
            self.fecha_fin = timezone.now()
        elif not self.finalizado:
            self.fecha_fin = None  # Opcional: Limpia la fecha_fin si se desmarca
        super(Pagos, self).save(*args, **kwargs)

    def __str__(self):
        return self.hist_clin.paciente




















# CREATE TABLE entregas (
# id_entrega INT AUTO_INCREMENT,
# nom_entrega VARCHAR(20) NOT NULL,
# CONSTRAINT pk_entregas PRIMARY KEY(id_entrega));

# CREATE TABLE cuotas (
# id_cuota INT AUTO_INCREMENT,
# nom_cuota VARCHAR(20),
# CONSTRAINT pk_cuotas PRIMARY KEY(id_cuota));

# CREATE TABLE pagos (
# id_pago INT AUTO_INCREMENT,
# id_cuota INT NOT NULL,
# id_entrega INT NOT NULL,
# id_hc INT NOT NULL,
# pagado BOOLEAN,
# fecha_limite DATE,
# fecha_pago DATETIME,
# CONSTRAINT pk_pagos PRIMARY KEY(id_pago));