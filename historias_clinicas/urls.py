from rest_framework.routers import DefaultRouter
from .views import HistoriaClinicaViewSet
from django.urls import path, include

# 1. Crear el Router
router = DefaultRouter()

# 2. Registrar el ViewSet (esto crea todas las rutas CRUD automáticamente)
# El primer argumento es el prefijo de la URL (ej: /api/historias/)
router.register(r'', HistoriaClinicaViewSet, basename='historiasclinicas')

urlpatterns = [
    # Incluye todas las URLs generadas por el Router
    path('', include(router.urls)),
]