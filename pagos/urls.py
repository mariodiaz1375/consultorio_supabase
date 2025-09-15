from django.urls import path, include
from .views import PagosList

urlpatterns = [
    path('', PagosList.as_view(), name='pagos_list')
]