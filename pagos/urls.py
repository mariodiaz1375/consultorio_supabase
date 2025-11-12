from django.urls import path
from .views import PagosList, PagosDetail, TiposPagosList

urlpatterns = [
    # 1. Rutas Principales (CRUD de Pagos)
    # GET (Listar) y POST (Crear)
    path('', PagosList.as_view(), name='pagos-list'), 
    # GET (Detalle), PUT/PATCH (Actualizar) y DELETE (Eliminar)
    path('<int:pk>/', PagosDetail.as_view(), name='pagos-detail'),
    
    # 2. Rutas para Listados de Opciones (Tablas Maestras)
    # Usadas por el frontend para llenar los select/dropdowns
    path('tipos/', TiposPagosList.as_view(), name='tipos-pagos-list'),
]