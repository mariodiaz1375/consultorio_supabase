from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated # Si quieres proteger las vistas

# Importar modelos y serializers. Asegúrate de que los serializers existan en pacientes/serializers.py
from .models import Pacientes, Generos, Antecedentes, AnalisisFuncional, ObrasSociales
from .serializers import (
    PacientesSerializer, 
    GenerosSerializer, 
    AntecedentesSerializer, 
    AnalisisFuncionalSerializer,
    # Asume que ObrasSocialesSerializer también existe
    # ObrasSocialesSerializer, 
)

# --- Vistas Principales (CRUD de Pacientes) ---

class PacientesList(APIView):
    # Opcional: Proteger la vista
    # permission_classes = [IsAuthenticated] 

    # LISTAR TODOS (GET /api/pacientes/)
    def get(self, request):
        pacientes = Pacientes.objects.all()
        serializer = PacientesSerializer(pacientes, many=True)
        return Response(serializer.data)

    # CREAR UNO NUEVO (POST /api/pacientes/)
    def post(self, request):
        serializer = PacientesSerializer(data=request.data)
        if serializer.is_valid():
            # El método .save() llamará al create() personalizado en el Serializer
            serializer.save() 
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class PacientesDetail(APIView):
    # Opcional: Proteger la vista
    # permission_classes = [IsAuthenticated] 
    
    # Función de utilidad para manejar el 404 si el objeto no existe
    def get_object(self, pk):
        try:
            return Pacientes.objects.get(pk=pk)
        except Pacientes.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound()

    # OBTENER DETALLE (GET /api/pacientes/1/)
    def get(self, request, pk):
        paciente = self.get_object(pk)
        serializer = PacientesSerializer(paciente)
        return Response(serializer.data)

    # EDITAR (PUT /api/pacientes/1/)
    def put(self, request, pk):
        paciente = self.get_object(pk)
        serializer = PacientesSerializer(paciente, data=request.data)
        if serializer.is_valid():
            # El método .save() llamará al update() personalizado en el Serializer
            serializer.save() 
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # ELIMINAR (DELETE /api/pacientes/1/)
    def delete(self, request, pk):
        paciente = self.get_object(pk)
        paciente.delete()
        return Response(status=204)


# --- Vistas para Listados de Opciones (Generics) ---
# Estas son importantes para cargar los <select> en el formulario de React.

class GenerosList(generics.ListAPIView):
    queryset = Generos.objects.all()
    serializer_class = GenerosSerializer

class AntecedentesList(generics.ListAPIView):
    queryset = Antecedentes.objects.all()
    serializer_class = AntecedentesSerializer

class AnalisisFuncionalList(generics.ListAPIView):
    queryset = AnalisisFuncional.objects.all()
    serializer_class = AnalisisFuncionalSerializer

# class ObrasSocialesList(generics.ListAPIView):
#     queryset = ObrasSociales.objects.all()
#     serializer_class = ObrasSocialesSerializer