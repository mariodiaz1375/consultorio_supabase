from django.contrib import admin
from .models import Turnos, EstadosTurnos

# Register your models here.

class TurnosAdmin(admin.ModelAdmin):
    list_display = ('odontologo', 'paciente', 'fecha_turno', 'horario_turno', 'estado_turno')
    search_fields = ('odontologo', 'paciente', 'fecha_turno')

admin.site.register(Turnos, TurnosAdmin)
admin.site.register(EstadosTurnos)