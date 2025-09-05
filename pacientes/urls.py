from django.urls import path, include
from .views import PacientesList

urlpatterns = [
    path('', PacientesList.as_view(), name='pacientes_list')
]