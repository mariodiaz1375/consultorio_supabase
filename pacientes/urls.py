# pacientes/urls.py (VERSIÓN CORREGIDA PARA SOPORTAR CRUD COMPLETO)

from django.urls import path
from .views import (
    PacientesList, 
    PacientesDetail, 
    GenerosList, 
    
    # Listas/Creación (ListCreateAPIView)
    AntecedentesList, 
    AnalisisFuncionalList, 
    ObrasSocialesList,
    
    # Detalle/Edición/Eliminación (RetrieveUpdateDestroyAPIView)
    AntecedentesDetail,   # 🚨 NUEVA VISTA
    AnalisisFuncionalDetail, # 🚨 NUEVA VISTA
    ObrasSocialesDetail, # 🚨 NUEVA VISTA
)

urlpatterns = [
    # --- 1. CRUD de Pacientes ---
    path('', PacientesList.as_view(), name='pacientes_list'),
    path('<int:pk>/', PacientesDetail.as_view(), name='paciente_detail'),

    # --- 2. Listas Maestras ---
    
    # Generos (Solo Listar)
    path('generos/', GenerosList.as_view(), name='generos_list'),
    
    # Antecedentes (Listar y Crear)
    path('antecedentes/', AntecedentesList.as_view(), name='antecedentes_list'),
    # Antecedentes (Editar y Eliminar)
    path('antecedentes/<int:pk>/', AntecedentesDetail.as_view(), name='antecedente_detail'), # 🚨 RUTA AGREGADA
    
    # Análisis Funcional (Listar y Crear)
    path('analisis-funcional/', AnalisisFuncionalList.as_view(), name='analisis_funcional_list'),
    # Análisis Funcional (Editar y Eliminar)
    path('analisis-funcional/<int:pk>/', AnalisisFuncionalDetail.as_view(), name='analisis_funcional_detail'), # 🚨 RUTA AGREGADA
    
    # Obras Sociales (Listar y Crear)
    path('obras-sociales/', ObrasSocialesList.as_view(), name='obras_sociales_list'),
    # Obras Sociales (Editar y Eliminar)
    path('obras-sociales/<int:pk>/', ObrasSocialesDetail.as_view(), name='obras_sociales_detail'), # 🚨 RUTA AGREGADA
]