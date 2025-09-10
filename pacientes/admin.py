from django.contrib import admin
from .models import Pacientes, Antecedentes, AnalisisFuncional
# Register your models here.

class PacientesAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'apellido', 'dni')
    search_fields = ('id',)

admin.site.register(Pacientes, PacientesAdmin)
admin.site.register(Antecedentes)
admin.site.register(AnalisisFuncional)