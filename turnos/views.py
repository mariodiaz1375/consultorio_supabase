from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
# 👇 --- IMPORTAR PAGINADOR ---
from rest_framework.pagination import PageNumberPagination 
# -----------------------------
from .models import Turnos, EstadosTurnos, HorarioFijo, DiaSemana, AuditoriaTurnos
from .serializers import (
    TurnosSerializer, 
    EstadosTurnosSerializer, 
    HorarioFijoSerializer, 
    DiaSemanaSerializer,
    AuditoriaTurnosSerializer
)

# (El resto de tus Vistas: TurnosList, TurnosDetail, etc. quedan igual)
# ...
class TurnosList(APIView):
    def get(self, request):
        turnos = Turnos.objects.all()
        serializer = TurnosSerializer(turnos, many=True) 
        return Response(serializer.data)
    
    def post(self, request):
        serializer = TurnosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class TurnosDetail(APIView):
    def get_object(self, pk):
        return get_object_or_404(Turnos, pk=pk)

    def get(self, request, pk):
        turno = self.get_object(pk)
        serializer = TurnosSerializer(turno)
        return Response(serializer.data)
    
    def put(self, request, pk):
        turno = self.get_object(pk)
        serializer = TurnosSerializer(turno, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        turno = self.get_object(pk)
        serializer = TurnosSerializer(turno, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        turno = self.get_object(pk)
        turno.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EstadosTurnosList(generics.ListCreateAPIView):
    queryset = EstadosTurnos.objects.all()
    serializer_class = EstadosTurnosSerializer

class HorarioFijoList(generics.ListCreateAPIView):
    queryset = HorarioFijo.objects.all()
    serializer_class = HorarioFijoSerializer
    
class HorarioFijoDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = HorarioFijo.objects.all()
    serializer_class = HorarioFijoSerializer
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except IntegrityError:
            return Response(
                {"detail": "No se puede eliminar este horario porque ya tiene turnos asignados."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"Error inesperado al eliminar HorarioFijo: {e}")
            return Response(
                {"detail": "Ocurrió un error inesperado en el servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DiaSemanaList(generics.ListAPIView):
    queryset = DiaSemana.objects.all().order_by('numero_dia')
    serializer_class = DiaSemanaSerializer


# =======================================================
# 3. Vistas para Auditoría de Turnos (¡ACTUALIZADA!)
# =======================================================

# 👇 --- DEFINIR UNA CLASE DE PAGINACIÓN ---
class AuditoriaPagination(PageNumberPagination):
    page_size = 10  # Número de elementos por página
    page_size_query_param = 'page_size'
    max_page_size = 50
# ----------------------------------------


class AuditoriaTurnosList(APIView):
    """
    Vista para listar los registros de auditoría de turnos (CON PAGINACIÓN).
    Permite filtrar por paciente, odontólogo, acción y fechas.
    """
    
    # 👇 --- AÑADIR LA CLASE DE PAGINACIÓN A LA VISTA ---
    pagination_class = AuditoriaPagination

    @property
    def paginator(self):
        """Instancia el paginador si está definido."""
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator
    # --------------------------------------------------

    def get(self, request):
        try:
            auditorias = AuditoriaTurnos.objects.all().order_by('-fecha_accion')
            
            # (Todos tus filtros existentes se mantienen igual)
            turno_numero = request.query_params.get('turno_numero', None)
            if turno_numero:
                auditorias = auditorias.filter(turno_numero=turno_numero)
            
            paciente_dni = request.query_params.get('paciente_dni', None)
            if paciente_dni:
                auditorias = auditorias.filter(paciente_dni=paciente_dni)
            
            accion = request.query_params.get('accion', None)
            if accion:
                auditorias = auditorias.filter(accion=accion)
            
            fecha_accion = request.query_params.get('fecha_accion', None)
            if fecha_accion:
                auditorias = auditorias.filter(fecha_accion__date=fecha_accion)
            
            fecha_turno = request.query_params.get('fecha_turno', None)
            if fecha_turno:
                auditorias = auditorias.filter(fecha_turno=fecha_turno)
            
            # 👇 --- LÓGICA DE PAGINACIÓN ---
            if self.paginator:
                # Paginar el queryset filtrado
                paginated_auditorias = self.paginator.paginate_queryset(auditorias, request, view=self)
                # Serializar solo la página actual
                serializer = AuditoriaTurnosSerializer(paginated_auditorias, many=True)
                # Devolver la respuesta paginada (incluye 'count', 'next', 'previous', 'results')
                return self.paginator.get_paginated_response(serializer.data)
            # -----------------------------

            # (Fallback si no hay paginador)
            serializer = AuditoriaTurnosSerializer(auditorias, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error en AuditoriaTurnosList: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AuditoriaTurnosDetail(APIView):
    """
    Vista para obtener el detalle de un registro de auditoría específico.
    """
    
    def get(self, request, pk):
        auditoria = get_object_or_404(AuditoriaTurnos, pk=pk)
        serializer = AuditoriaTurnosSerializer(auditoria)
        return Response(serializer.data)