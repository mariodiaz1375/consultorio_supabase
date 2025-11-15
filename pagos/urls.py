from django.urls import path
from .views import (
    PagosList, 
    PagosDetail, 
    TiposPagosList,
    AuditoriaPagosList,
    AuditoriaPagosDetail
)

urlpatterns = [
    path('', PagosList.as_view(), name='pagos-list'), 
    path('<int:pk>/', PagosDetail.as_view(), name='pagos-detail'),
    path('tipos-pagos/', TiposPagosList.as_view(), name='tipos-pagos-list'),
    
    # Auditoría
    path('auditoria/', AuditoriaPagosList.as_view(), name='auditoria-list'),
    path('auditoria/<int:pk>/', AuditoriaPagosDetail.as_view(), name='auditoria-detail'),
]