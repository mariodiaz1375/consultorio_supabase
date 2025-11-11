from django.db import models
from historias_clinicas.models import HistoriasClinicas
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from personal.models import Personal

# Create your models here.

class Entregas(models.Model):
    nombre_ent = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Entrega'
        verbose_name_plural = 'Entregas'

class Cuotas(models.Model):
    nombre_cuota = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Cuota'
        verbose_name_plural = 'Cuotas'

class Pagos(models.Model):
    entrega = models.ForeignKey(Entregas, 
                                 on_delete=models.PROTECT,
                                 null=True, blank=True)
    # 🚨 CAMBIO SOLICITADO: Permitir NULL en 'cuota'
    cuota = models.ForeignKey(Cuotas, 
                              on_delete=models.PROTECT,
                              null=True, blank=True) 
    hist_clin = models.ForeignKey(HistoriasClinicas, 
                                 on_delete=models.PROTECT,
                                 null=True, blank=True)
    registrado_por = models.ForeignKey(Personal,
                                       on_delete=models.PROTECT,
                                       related_name='pagos_registrados',
                                       default=18)
    #fecha_limite = models.DateField(null=True, blank=True)
    fecha_pago = models.DateTimeField(null=True, blank=True)
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

        # 🚨 CORRECCIÓN DE BUG: Se reemplazó 'fecha_fin' por 'fecha_pago' y 'finalizado' por 'pagado'
        if self.pagado and not self.fecha_pago:
            self.fecha_pago = timezone.now()
        elif not self.pagado:
            self.fecha_pago = None  # Limpia la fecha_pago si se desmarca
            
        super(Pagos, self).save(*args, **kwargs)

    def __str__(self):
        # Asumiendo que self.hist_clin puede ser nulo ahora
        return self.hist_clin.paciente if self.hist_clin else f"Pago sin HC ({self.id})"

    class Meta:
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'



















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