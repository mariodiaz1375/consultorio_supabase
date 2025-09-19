from django.contrib import admin
from .models import Pacientes, Antecedentes, AnalisisFuncional, Generos, ObrasSociales, OsPacientes

# Register your models here.

class PacientesAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'apellido', 'dni', 'edad')
    search_fields = ('id',)

admin.site.register(Pacientes, PacientesAdmin)
admin.site.register(Antecedentes)
admin.site.register(AnalisisFuncional)
admin.site.register(Generos)
admin.site.register(OsPacientes)
admin.site.register(ObrasSociales)