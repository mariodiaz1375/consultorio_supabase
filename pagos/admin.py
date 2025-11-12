
from django.contrib import admin
from .models import Pagos, TiposPagos
# Register your models here.

class PagosAdmin(admin.ModelAdmin):
    list_display = ('hist_clin', 'registrado_por', 'tipo_pago', 'pagado')
    search_fields = ('hist_clin',)

admin.site.register(Pagos)
admin.site.register(TiposPagos)
# admin.site.register(Entregas)
# admin.site.register(Cuotas)