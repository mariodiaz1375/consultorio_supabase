from rest_framework.routers import DefaultRouter
from .views import (
    HistoriaClinicaViewSet,
    TratamientoViewSet, 
    PiezaDentalViewSet, 
    CaraDentalViewSet
)
from django.urls import path, include

router = DefaultRouter()

# 1. HC Principal: Ahora usa el prefijo 'historias'. 
# URL final: /api/historias_clinicas/historias/
router.register(r'historias', HistoriaClinicaViewSet, basename='historiasclinicas')

# 2. Catálogos: Estos prefijos ahora funcionarán correctamente.
# URL final: /api/historias_clinicas/tratamientos/
router.register(r'tratamientos', TratamientoViewSet, basename='tratamientos')
router.register(r'piezas', PiezaDentalViewSet, basename='piezasdentales')
router.register(r'caras', CaraDentalViewSet, basename='carasdentales')


urlpatterns = [
    path('', include(router.urls)),
]