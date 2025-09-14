from django.contrib import admin
from .models import HistoriasClinicas
# Register your models here.

class HistClinAdmin(admin.ModelAdmin):
    list_display = ('paciente', 'odontologo', 'finalizado')
    search_fields = ('paciente',)

admin.site.register(HistoriasClinicas)