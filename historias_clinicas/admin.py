from django.contrib import admin
from .models import HistoriasClinicas, PiezasDentales, CarasDentales, DetallesHC, SeguimientoHC, Tratamientos
# Register your models here.

class HistClinAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'odontologo', 'fecha_inicio', 'finalizado')
    search_fields = ('paciente',)

admin.site.register(HistoriasClinicas, HistClinAdmin)
admin.site.register(PiezasDentales)
admin.site.register(CarasDentales)
admin.site.register(DetallesHC)
admin.site.register(SeguimientoHC)
admin.site.register(Tratamientos)