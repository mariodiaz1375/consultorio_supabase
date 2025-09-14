from django.urls import path
from .views import HistClinList

urlpatterns = [
    path('', HistClinList.as_view(), name='histclin_list'),
    # path('<int:pk>/', PacienteDetail.as_view(), name='paciente_detail')
]