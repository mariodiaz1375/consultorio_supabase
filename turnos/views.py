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
    DiaSemanaSerializer
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