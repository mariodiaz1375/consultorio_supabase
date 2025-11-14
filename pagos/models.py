from django.db import models
from historias_clinicas.models import HistoriasClinicas
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from personal.models import Personal

# Create your models here.

class TiposPagos(models.Model):
    nombre_tipo_pago = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre_tipo_pago

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


# ============================================
# MODELO DE AUDITORÍA
# ============================================

class AuditoriaPagos(models.Model):
    """
    Tabla de auditoría que registra todos los cambios en los pagos.
    Se llena automáticamente mediante signals (triggers de Django).
    Solo registra cuando un pago se marca como pagado (REGISTRO) 
    o cuando se desmarca (CANCELACION).
    """
    
    ACCIONES = [
        ('REGISTRO', 'Pago Registrado'),
        ('CANCELACION', 'Pago Cancelado'),
    ]
    
    # Información del pago
    pago = models.ForeignKey(
        Pagos, 
        on_delete=models.SET_NULL,  # Si se elimina el pago, mantener el registro de auditoría
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
        related_name='acciones_auditoria_pagos'
    )
    
    # 🚨 RELACIÓN CON HISTORIA CLÍNICA
    hist_clin = models.ForeignKey(
        HistoriasClinicas,
        on_delete=models.SET_NULL,  # Si se elimina la HC, mantener el registro
        null=True,
        blank=True,
        related_name='auditoria_pagos'
    )
    
    # Datos del contexto (desnormalizados para histórico)
    tipo_pago_nombre = models.CharField(max_length=50, null=True, blank=True)
    hist_clin_numero = models.IntegerField(null=True, blank=True)  # 🚨 RENOMBRADO: Backup del ID de HC
    paciente_nombre = models.CharField(max_length=255, null=True, blank=True)
    paciente_dni = models.CharField(max_length=20, null=True, blank=True)
    
    # Estado del pago en el momento de la acción
    estado_pagado = models.BooleanField(default=False)
    fecha_pago = models.DateTimeField(null=True, blank=True)
    
    # Información adicional (opcional)
    observaciones = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.accion} - {self.tipo_pago_nombre} - {self.fecha_accion.strftime('%d/%m/%Y %H:%M')}"
    
    class Meta:
        verbose_name = 'Auditoría de Pago'
        verbose_name_plural = 'Auditorías de Pagos'
        ordering = ['-fecha_accion']  # Más recientes primero
        indexes = [
            models.Index(fields=['fecha_accion']),
            models.Index(fields=['pago']),
            models.Index(fields=['hist_clin_id']),
        ]