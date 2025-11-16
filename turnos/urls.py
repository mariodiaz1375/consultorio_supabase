from django.urls import path, include
from .views import (
    TurnosList, 
    TurnosDetail,
    EstadosTurnosList,
    HorarioFijoList,
    HorarioFijoDetail,
    DiaSemanaList,
    AuditoriaTurnosList,
    AuditoriaTurnosDetail,
)

urlpatterns = [
    # 1. Rutas Principales (CRUD de Turnos)
    # GET (Listar) y POST (Crear)
    path('', TurnosList.as_view(), name='turnos-list'), 
    # GET (Detalle), PUT/PATCH (Actualizar) y DELETE (Eliminar)
    path('<int:pk>/', TurnosDetail.as_view(), name='turnos-detail'),
    
    # 2. Rutas para Listados de Opciones (Tablas Maestras)
    # Usadas por el frontend para llenar los select/dropdowns
    path('estados/', EstadosTurnosList.as_view(), name='estados-turnos-list'),
    path('horarios/', HorarioFijoList.as_view(), name='horarios-fijos-list'),
    path('horarios/<int:pk>/', HorarioFijoDetail.as_view(), name='horariofijo-detail'),
    path('dias/', DiaSemanaList.as_view(), name='dias-semana-list'),

    # 3. Rutas para Auditoría (🚨 NUEVO)
    path('auditoria/', AuditoriaTurnosList.as_view(), name='auditoria-turnos-list'),
    path('auditoria/<int:pk>/', AuditoriaTurnosDetail.as_view(), name='auditoria-turno-detail'),
]