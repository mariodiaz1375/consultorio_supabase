from django.contrib import admin
from .models import Personal, Puestos, Especialidades

# Register your models here.
class PersonalAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'apellido', 'dni', 'matricula',)
    search_fields = ('id',)


admin.site.register(Personal, PersonalAdmin)
admin.site.register(Puestos)
admin.site.register(Especialidades)