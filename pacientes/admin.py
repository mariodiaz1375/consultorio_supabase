from django.contrib import admin
from .models import Pacientes, Antecedentes, AnalisisFuncional
# Register your models here.

admin.site.register(Pacientes)
admin.site.register(Antecedentes)
admin.site.register(AnalisisFuncional)