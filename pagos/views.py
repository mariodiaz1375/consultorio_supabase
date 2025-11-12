from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from .models import Pagos, TiposPagos
from .serializers import PagosSerializer, TiposPagosSerializer
from rest_framework.permissions import IsAuthenticated

# --- 1. Vistas CRUD para Pagos ---

class PagosList(APIView):
    """
    Vista para listar todos los Pagos (GET) y crear un nuevo Pago (POST).
    """
    # Si solo el personal puede acceder, descomentar la siguiente línea:
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        # Se podría aplicar filtrado o paginación aquí
        pagos = Pagos.objects.all().order_by('-id')
        serializer = PagosSerializer(pagos, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Para la creación, asumimos que 'registrado_por' viene en el body.
        # Si quieres que se use el usuario autenticado automáticamente, 
        # puedes modificar el .create() del Serializer.
        serializer = PagosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class PagosDetail(APIView):
    """
    Vista para obtener (GET), actualizar (PUT/PATCH) y eliminar (DELETE) un Pago específico.
    """
    # Si solo el personal puede acceder, descomentar la siguiente línea:
    # permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        # Utiliza get_object_or_404 para manejar automáticamente el 404
        return get_object_or_404(Pagos, pk=pk)

    def get(self, request, pk):
        pago = self.get_object(pk)
        serializer = PagosSerializer(pago)
        return Response(serializer.data)
    
    def put(self, request, pk):
        pago = self.get_object(pk)
        # PUT para actualización completa
        serializer = PagosSerializer(pago, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        pago = self.get_object(pk)
        # PATCH para actualización parcial (partial=True)
        serializer = PagosSerializer(pago, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        pago = self.get_object(pk)
        pago.delete()
        # 204 No Content es la respuesta estándar para una eliminación exitosa
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- 2. Vistas para Tablas Maestras (Opciones) ---

class TiposPagosList(generics.ListAPIView):
    """
    Devuelve la lista de todos los Tipos de Pagos.
    """
    queryset = TiposPagos.objects.all()
    serializer_class = TiposPagosSerializer
    # Se recomienda proteger esta lista
    # permission_classes = [IsAuthenticated]