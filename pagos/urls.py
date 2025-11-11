from django.urls import path
from .views import (
    PagosList, 
    PagosDetail, 
    EntregasList,
    EntregasDetail,
    CuotasList,
    CuotasDetail
)

urlpatterns = [
    # --- 1. CRUD de Pagos (Endpoints principales) ---
    path('', PagosList.as_view(), name='pagos_list'),
    path('<int:pk>/', PagosDetail.as_view(), name='pago_detail'),

    # --- 2. Catálogos ---
    
    # Entregas (CRUD completo)
    path('entregas/', EntregasList.as_view(), name='entregas_list'),
    path('entregas/<int:pk>/', EntregasDetail.as_view(), name='entrega_detail'),
    
    # Cuotas (CRUD completo)
    path('cuotas/', CuotasList.as_view(), name='cuotas_list'),
    path('cuotas/<int:pk>/', CuotasDetail.as_view(), name='cuota_detail'),
]