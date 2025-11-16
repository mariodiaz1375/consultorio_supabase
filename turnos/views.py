from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from .models import Turnos, EstadosTurnos, HorarioFijo, DiaSemana 
from .serializers import (
    TurnosSerializer, 
    EstadosTurnosSerializer, 
    HorarioFijoSerializer, 
    DiaSemanaSerializer,
    AuditoriaTurnosSerializer
)



class TurnosList(APIView):
    # LISTAR TODOS (GET /api/turnos/)
    def get(self, request):
        turnos = Turnos.objects.all()
        # Usamos el serializer actualizado que muestra nombres
        serializer = TurnosSerializer(turnos, many=True) 
        return Response(serializer.data)
    
    # CREAR UNO NUEVO (POST /api/turnos/)
    def post(self, request):
        serializer = TurnosSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED) # Usamos status.HTTP_201
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class TurnosDetail(APIView):
    # Función auxiliar para obtener el objeto o devolver 404
    def get_object(self, pk):
        # Usamos get_object_or_404 para manejar errores de ID inexistente
        return get_object_or_404(Turnos, pk=pk)

    # OBTENER DETALLE (GET /api/turnos/1/)
    def get(self, request, pk):
        turno = self.get_object(pk)
        serializer = TurnosSerializer(turno)
        return Response(serializer.data)
    
    # ACTUALIZAR COMPLETO (PUT /api/turnos/1/)
    def put(self, request, pk):
        turno = self.get_object(pk)
        serializer = TurnosSerializer(turno, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ACTUALIZAR PARCIAL (PATCH /api/turnos/1/)
    def patch(self, request, pk):
        turno = self.get_object(pk)
        # Usar partial=True permite actualizar solo algunos campos
        serializer = TurnosSerializer(turno, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    # ELIMINAR (DELETE /api/turnos/1/)
    def delete(self, request, pk):
        turno = self.get_object(pk)
        turno.delete()
        # 204 No Content es la respuesta estándar para eliminaciones exitosas
        return Response(status=status.HTTP_204_NO_CONTENT)


# =======================================================
# 2. Vistas para Listados de Opciones (Generics)
#    Necesarias para llenar los <select> del frontend.
# =======================================================

class EstadosTurnosList(generics.ListCreateAPIView):
    # Usamos ListCreateAPIView si quieres poder CREAR nuevos estados desde el admin/frontend
    queryset = EstadosTurnos.objects.all()
    serializer_class = EstadosTurnosSerializer

class HorarioFijoList(generics.ListCreateAPIView):
    # Listamos todos los horarios fijos
    queryset = HorarioFijo.objects.all()
    serializer_class = HorarioFijoSerializer
    
class HorarioFijoDetail(generics.RetrieveUpdateDestroyAPIView):
    # Maneja GET (Detalle), PUT/PATCH (Editar) y DELETE (Eliminar)
    queryset = HorarioFijo.objects.all()
    serializer_class = HorarioFijoSerializer
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            # Respuesta exitosa (204 No Content) si la eliminación procede
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except IntegrityError:
            # 🚨 MANEJO CLAVE: Si hay IntegrityError (ej: Foreign Key Constraint)
            # Devolvemos 400 Bad Request con un mensaje claro.
            return Response(
                {"detail": "No se puede eliminar este horario porque ya tiene turnos asignados."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Manejo de cualquier otro error no esperado.
            print(f"Error inesperado al eliminar HorarioFijo: {e}")
            return Response(
                {"detail": "Ocurrió un error inesperado en el servidor."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DiaSemanaList(generics.ListAPIView):
    # Los días de la semana no deberían ser creados/editados una vez definidos
    queryset = DiaSemana.objects.all().order_by('numero_dia')
    serializer_class = DiaSemanaSerializer

# =======================================================
# 3. Vistas para Auditoría de Turnos
# =======================================================

class AuditoriaTurnosList(APIView):
    """
    Vista para listar los registros de auditoría de turnos.
    Permite filtrar por paciente, odontólogo, acción y fechas.
    """
    
    def get(self, request):
        try:
            # Obtener todos los registros de auditoría
            auditorias = AuditoriaTurnos.objects.all().order_by('-fecha_accion')
            
            # 🚨 FILTRO OPCIONAL: Por Número de Turno
            turno_numero = request.query_params.get('turno_numero', None)
            if turno_numero:
                auditorias = auditorias.filter(turno_numero=turno_numero)
            
            # 🚨 FILTRO OPCIONAL: Por Paciente (DNI)
            paciente_dni = request.query_params.get('paciente_dni', None)
            if paciente_dni:
                auditorias = auditorias.filter(paciente_dni=paciente_dni)
            
            # 🚨 FILTRO OPCIONAL: Por Acción
            accion = request.query_params.get('accion', None)
            if accion:
                auditorias = auditorias.filter(accion=accion)
            
            # 🚨 FILTRO OPCIONAL: Por rango de fechas de la acción
            fecha_desde = request.query_params.get('fecha_desde', None)
            fecha_hasta = request.query_params.get('fecha_hasta', None)
            if fecha_desde:
                auditorias = auditorias.filter(fecha_accion__gte=fecha_desde)
            if fecha_hasta:
                auditorias = auditorias.filter(fecha_accion__lte=fecha_hasta)
            
            # 🚨 FILTRO OPCIONAL: Por fecha del turno
            fecha_turno = request.query_params.get('fecha_turno', None)
            if fecha_turno:
                auditorias = auditorias.filter(fecha_turno=fecha_turno)
            
            serializer = AuditoriaTurnosSerializer(auditorias, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            # Log del error para debug
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