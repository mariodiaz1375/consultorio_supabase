from django.contrib import admin
from .models import Pagos 
# Register your models here.

class PagosAdmin(admin.ModelAdmin):
    list_display = ('hist_clin', 'pagado')
    search_fields = ('hist_clin',)

admin.site.register(Pagos)