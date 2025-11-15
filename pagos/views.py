from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from .models import Pagos, TiposPagos, AuditoriaPagos
from .serializers import PagosSerializer, TiposPagosSerializer, AuditoriaPagosSerializer
from rest_framework.permissions import IsAuthenticated


# --- 1. Vistas CRUD para Pagos ---

class PagosList(APIView):
    """
    Vista para listar todos los Pagos (GET) y crear un nuevo Pago (POST).
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        pagos = Pagos.objects.all().order_by('-id')
        serializer = PagosSerializer(pagos, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = PagosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class PagosDetail(APIView):
    """
    Vista para obtener (GET), actualizar (PUT/PATCH) y eliminar (DELETE) un Pago específico.
    """
    # permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Pagos, pk=pk)

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

    def patch(self, request, pk):
        pago = self.get_object(pk)
        serializer = PagosSerializer(pago, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        pago = self.get_object(pk)
        pago.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- 2. Vistas para Tablas Maestras (Opciones) ---

class TiposPagosList(generics.ListAPIView):
    """
    Devuelve la lista de todos los Tipos de Pagos.
    """
    queryset = TiposPagos.objects.all()
    serializer_class = TiposPagosSerializer
    # permission_classes = [IsAuthenticated]


# --- 3. Vistas para Auditoría ---

class AuditoriaPagosList(APIView):
    """
    Vista para listar los registros de auditoría de pagos.
    Permite filtrar por Historia Clínica.
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Obtener todos los registros de auditoría
        auditorias = AuditoriaPagos.objects.all().select_related(
            'usuario', 'hist_clin', 'pago'
        ).order_by('-fecha_accion')
        
        # 🚨 FILTRO OPCIONAL: Por Historia Clínica
        hist_clin_id = request.query_params.get('hist_clin_id', None)
        if hist_clin_id:
            auditorias = auditorias.filter(hist_clin_numero=hist_clin_id)
        
        # 🚨 FILTRO OPCIONAL: Por Paciente (DNI)
        paciente_dni = request.query_params.get('paciente_dni', None)
        if paciente_dni:
            auditorias = auditorias.filter(paciente_dni=paciente_dni)
        
        # 🚨 FILTRO OPCIONAL: Por Acción (REGISTRO/CANCELACION)
        accion = request.query_params.get('accion', None)
        if accion:
            auditorias = auditorias.filter(accion=accion)
        
        # 🚨 FILTRO OPCIONAL: Por rango de fechas
        fecha_desde = request.query_params.get('fecha_desde', None)
        fecha_hasta = request.query_params.get('fecha_hasta', None)
        if fecha_desde:
            auditorias = auditorias.filter(fecha_accion__gte=fecha_desde)
        if fecha_hasta:
            auditorias = auditorias.filter(fecha_accion__lte=fecha_hasta)
        
        serializer = AuditoriaPagosSerializer(auditorias, many=True)
        return Response(serializer.data)


class AuditoriaPagosDetail(APIView):
    """
    Vista para obtener el detalle de un registro de auditoría específico.
    """
    # permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        auditoria = get_object_or_404(AuditoriaPagos, pk=pk)
        serializer = AuditoriaPagosSerializer(auditoria)
        return Response(serializer.data)