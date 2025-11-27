# Archivo: views.py (Corregido)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.shortcuts import get_object_or_404

from django.utils.dateparse import parse_date
from datetime import datetime, time
from django.utils import timezone
# --- IMPORTAR PAGINADOR ---
from rest_framework.pagination import PageNumberPagination
from .models import Pagos, TiposPagos, AuditoriaPagos
from .serializers import PagosSerializer, TiposPagosSerializer, AuditoriaPagosSerializer
from rest_framework.permissions import IsAuthenticated


# (PagosList, PagosDetail, TiposPagosList no cambian)
# --- 1. Vistas CRUD para Pagos ---

class PagosList(APIView):
    # ... (código sin cambios) ...
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
    # ... (código sin cambios) ...
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
    queryset = TiposPagos.objects.all()
    serializer_class = TiposPagosSerializer


# --- 3. Vistas para Auditoría ---

# --- DEFINIR CLASE DE PAGINACIÓN ---
class AuditoriaPagination(PageNumberPagination):
    page_size = 10  # 10 elementos por página
    page_size_query_param = 'page_size'
    max_page_size = 50

class AuditoriaPagosList(APIView):
    pagination_class = AuditoriaPagination

    @property
    def paginator(self):
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator
    
    def get(self, request):
        auditorias = AuditoriaPagos.objects.all().select_related(
            'usuario', 'hist_clin', 'pago'
        ).order_by('-fecha_accion')
        
        # (Filtros hist_clin_id, paciente_dni, accion no cambian)
        hist_clin_id = request.query_params.get('hist_clin_id', None)
        if hist_clin_id:
            auditorias = auditorias.filter(hist_clin_numero=hist_clin_id)
        
        paciente_dni = request.query_params.get('paciente_dni', None)
        if paciente_dni:
            auditorias = auditorias.filter(paciente_dni=paciente_dni)
        
        accion = request.query_params.get('accion', None)
        if accion:
            auditorias = auditorias.filter(accion=accion)
        
        # # --- CORRECCIÓN AQUÍ ---
        # fecha_desde = request.query_params.get('fecha_desde', None)
        # fecha_hasta = request.query_params.get('fecha_hasta', None)
        
        # if fecha_desde:
        #     # gte (mayor o igual) ya funciona bien con 'date'
        #     auditorias = auditorias.filter(fecha_accion__date__gte=fecha_desde)
        
        # if fecha_hasta:
        #     # 👇 CAMBIO: Usar '__date__lte' en lugar de '__lte'
        #     auditorias = auditorias.filter(fecha_accion__date__lte=fecha_hasta)

        # 👇👇👇 --- CORRECCIÓN MYSQL AQUÍ --- 👇👇👇
        
        fecha_desde = request.query_params.get('fecha_desde', None)
        fecha_hasta = request.query_params.get('fecha_hasta', None)
        
        # Lógica manual de rangos para evitar usar __date en MySQL
        if fecha_desde:
            date_obj = parse_date(fecha_desde)
            if date_obj:
                # Desde el inicio del día (00:00:00)
                start_dt = datetime.combine(date_obj, time.min)
                if timezone.is_naive(start_dt):
                    start_dt = timezone.make_aware(start_dt)
                
                # Usamos __gte (mayor o igual al datetime completo)
                auditorias = auditorias.filter(fecha_accion__gte=start_dt)
        
        if fecha_hasta:
            date_obj = parse_date(fecha_hasta)
            if date_obj:
                # Hasta el final del día (23:59:59.999999)
                end_dt = datetime.combine(date_obj, time.max)
                if timezone.is_naive(end_dt):
                    end_dt = timezone.make_aware(end_dt)
                
                # Usamos __lte (menor o igual al datetime completo)
                auditorias = auditorias.filter(fecha_accion__lte=end_dt)
        
        # (Lógica de paginación no cambia)
        if self.paginator:
            paginated_auditorias = self.paginator.paginate_queryset(auditorias, request, view=self)
            serializer = AuditoriaPagosSerializer(paginated_auditorias, many=True)
            return self.paginator.get_paginated_response(serializer.data)

        serializer = AuditoriaPagosSerializer(auditorias, many=True)
        return Response(serializer.data)


class AuditoriaPagosDetail(APIView):
    # (Esta vista no cambia)
    def get(self, request, pk):
        auditoria = get_object_or_404(AuditoriaPagos, pk=pk)
        serializer = AuditoriaPagosSerializer(auditoria)
        return Response(serializer.data)