from django.contrib import admin
from .models import Turnos, EstadosTurnos, HorarioFijo, DiaSemana, AuditoriaTurnos

# Register your models here.

class TurnosAdmin(admin.ModelAdmin):
    list_display = ('odontologo', 'paciente', 'fecha_turno', 'horario_turno', 'estado_turno')
    search_fields = ('odontologo', 'paciente', 'fecha_turno')

class AuditoriaTurnosAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'accion',
        'turno_numero',
        'paciente_nombre',
        'odontologo_nombre',
        'fecha_turno',
        'horario_turno',
        'estado_anterior',
        'estado_nuevo',
        'usuario',
        'fecha_accion'
    )
    list_filter = ('accion', 'fecha_accion', 'fecha_turno', 'estado_nuevo')
    search_fields = (
        'paciente_nombre',
        'paciente_dni',
        'odontologo_nombre',
        'turno_numero'
    )
    readonly_fields = (
        'turno',
        'accion',
        'fecha_accion',
        'usuario',
        'turno_numero',
        'paciente_nombre',
        'paciente_dni',
        'odontologo_nombre',
        'fecha_turno',
        'horario_turno',
        'estado_anterior',
        'estado_nuevo',
        'observaciones'
    )
    
    fieldsets = (
        ('Acción Realizada', {
            'fields': ('accion', 'fecha_accion', 'usuario')
        }),
        ('Información del Turno', {
            'fields': (
                'turno',
                'turno_numero',
                'fecha_turno',
                'horario_turno',
                'odontologo_nombre'
            )
        }),
        ('Información del Paciente', {
            'fields': ('paciente_nombre', 'paciente_dni')
        }),
        ('Cambios de Estado', {
            'fields': ('estado_anterior', 'estado_nuevo')
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



admin.site.register(Turnos, TurnosAdmin)
admin.site.register(EstadosTurnos)
admin.site.register(HorarioFijo)
admin.site.register(DiaSemana)
admin.site.register(AuditoriaTurnos, AuditoriaTurnosAdmin)