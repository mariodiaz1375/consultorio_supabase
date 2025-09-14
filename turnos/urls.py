from django.urls import path, include
from .views import TurnosList, TurnosDetail

urlpatterns = [
    path('', TurnosList.as_view(), name='turnos_list'),
    path('<int:pk>/', TurnosDetail.as_view(), name='turnos_detail')
]