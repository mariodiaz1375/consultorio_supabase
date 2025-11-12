from django.db import models
from historias_clinicas.models import HistoriasClinicas
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from personal.models import Personal

# Create your models here.

class TiposPagos(models.Model):
    nombre_tipo_pago = models.CharField(max_length=20)

    class Meta:
        verbose_name = 'Tipo de pagos'
        verbose_name_plural = 'Tipos de pagos'

# class Cuotas(models.Model):
#     nombre_cuota = models.CharField(max_length=20)

#     class Meta:
#         verbose_name = 'Cuota'
#         verbose_name_plural = 'Cuotas'

class Pagos(models.Model):
    tipo_pago = models.ForeignKey(TiposPagos, 
                                 on_delete=models.PROTECT,
                                 null=True, blank=True)
    # cuota = models.ForeignKey(Cuotas, 
    #                           on_delete=models.PROTECT,
    #                           null=True, blank=True) 
    
    # 🚨 CAMBIO AQUÍ: Campo ahora obligatorio
    hist_clin = models.ForeignKey(HistoriasClinicas, 
                                 on_delete=models.PROTECT) # Se quitaron null=True y blank=True
    
    registrado_por = models.ForeignKey(Personal,
                                       on_delete=models.PROTECT,
                                       related_name='pagos_registrados',
                                       null=True, blank=True)
    
    fecha_pago = models.DateTimeField(null=True, blank=True)
    pagado = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # La lógica de fecha_limite fue eliminada
        
        if self.pagado and not self.fecha_pago:
            self.fecha_pago = timezone.now()
        elif not self.pagado:
            self.fecha_pago = None
            
        super(Pagos, self).save(*args, **kwargs)

    def __str__(self):
        # Ahora podemos asumir que hist_clin siempre existe
        return f"Pago de {self.hist_clin.paciente}"

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