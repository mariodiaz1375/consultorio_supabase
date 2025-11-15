from django.contrib import admin
from .models import Pagos, TiposPagos, AuditoriaPagos

class PagosAdmin(admin.ModelAdmin):
    list_display = ('id', 'hist_clin', 'tipo_pago', 'pagado', 'registrado_por', 'fecha_pago')
    list_filter = ('pagado', 'tipo_pago', 'fecha_pago')
    search_fields = ('hist_clin__id', 'hist_clin__paciente__nombre', 'hist_clin__paciente__apellido')
    readonly_fields = ('fecha_pago',)
    
    fieldsets = (
        ('Información del Pago', {
            'fields': ('hist_clin', 'tipo_pago', 'pagado', 'fecha_pago')
        }),
        ('Auditoría', {
            'fields': ('registrado_por',)
        }),
    )


class AuditoriaPagosAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'accion', 
        'tipo_pago_nombre',
        'hist_clin',
        'paciente_nombre', 
        'estado_pagado', 
        'usuario', 
        'fecha_accion'
    )
    list_filter = ('accion', 'estado_pagado', 'fecha_accion', 'hist_clin')
    search_fields = (
        'paciente_nombre', 
        'paciente_dni', 
        'tipo_pago_nombre',
        'hist_clin_numero',
        'hist_clin__id'
    )
    readonly_fields = (
        'pago', 
        'accion', 
        'fecha_accion', 
        'usuario',
        'hist_clin',
        'tipo_pago_nombre',
        'hist_clin_numero',
        'paciente_nombre', 
        'paciente_dni',
        'estado_pagado', 
        'fecha_pago', 
        'observaciones'
    )
    
    fieldsets = (
        ('Acción Realizada', {
            'fields': ('accion', 'fecha_accion', 'usuario')
        }),
        ('Información del Pago', {
            'fields': ('pago', 'tipo_pago_nombre', 'estado_pagado', 'fecha_pago')
        }),
        ('Historia Clínica y Paciente', {
            'fields': ('hist_clin', 'hist_clin_numero', 'paciente_nombre', 'paciente_dni')
        }),
        ('Detalles', {
            'fields': ('observaciones',)
        }),
    )
    
    # No permitir edición ni eliminación de registros de auditoría
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


admin.site.register(Pagos, PagosAdmin)
admin.site.register(TiposPagos)
admin.site.register(AuditoriaPagos, AuditoriaPagosAdmin)