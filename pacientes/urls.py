from django.urls import path, include
from .views import PacientesList, PacienteDetail

urlpatterns = [
    path('', PacientesList.as_view(), name='pacientes_list'),
    path('<int:pk>/', PacienteDetail.as_view(), name='paciente_detail')
]