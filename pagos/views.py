from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.exceptions import NotFound

from .models import Pagos, Entregas, Cuotas
from .serializers import (
    PagosSerializer, 
    EntregasSerializer, 
    CuotasSerializer
)

# --- 1. Vistas Principales (CRUD de Pagos) ---

class PagosList(APIView):
    # LISTAR TODOS (GET /api/pagos/)
    def get(self, request):
        # Usamos select_related para optimizar la consulta de las Claves Foráneas
        pagos = Pagos.objects.all().select_related(
            'entrega', 
            'cuota', 
            'hist_clin'
        ).order_by('-fecha_limite')
        serializer = PagosSerializer(pagos, many=True)
        return Response(serializer.data)
    
    # CREAR UNO NUEVO (POST /api/pagos/)
    def post(self, request):
        serializer = PagosSerializer(data=request.data)
        if serializer.is_valid():
            # El método .save() ejecuta la lógica de cálculo de fecha_limite en models.py
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PagosDetail(APIView):
    def get_object(self, pk):
        try:
            return Pagos.objects.select_related('entrega', 'cuota', 'hist_clin').get(pk=pk)
        except Pagos.DoesNotExist:
            raise NotFound()

    # OBTENER DETALLE, EDITAR, ELIMINAR (GET, PUT, DELETE /api/pagos/1/)
    def get(self, request, pk):
        pago = self.get_object(pk)
        serializer = PagosSerializer(pago)
        return Response(serializer.data)

    def put(self, request, pk):
        pago = self.get_object(pk)
        serializer = PagosSerializer(pago, data=request.data) 
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        pago = self.get_object(pk)
        pago.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- 2. Vistas para Catálogos (CRUD de Entregas y Cuotas) ---
# Usamos generics.ListCreateAPIView y RetrieveUpdateDestroyAPIView
# (Se asume que quieres poder crear, listar, editar y borrar estos catálogos)

class EntregasList(generics.ListCreateAPIView):
    queryset = Entregas.objects.all().order_by('nombre_ent')
    serializer_class = EntregasSerializer

class EntregasDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Entregas.objects.all()
    serializer_class = EntregasSerializer

class CuotasList(generics.ListCreateAPIView):
    queryset = Cuotas.objects.all().order_by('nombre_cuota')
    serializer_class = CuotasSerializer

class CuotasDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cuotas.objects.all()
    serializer_class = CuotasSerializer