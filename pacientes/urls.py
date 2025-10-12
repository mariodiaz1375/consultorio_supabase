from django.urls import path, include
from .views import PacientesList, PacientesDetail, GenerosList, AntecedentesList, AnalisisFuncionalList

urlpatterns = [
    path('', PacientesList.as_view(), name='pacientes_list'),
    path('<int:pk>/', PacientesDetail.as_view(), name='paciente_detail'),

    path('generos/', GenerosList.as_view(), name='generos_list'),
    path('antecedentes/', AntecedentesList.as_view(), name='antecedentes_list'),
    path('analisis-funcional/', AnalisisFuncionalList.as_view(), name='analisis_funcional_list'),
]