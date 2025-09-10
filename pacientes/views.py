from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Pacientes
from .serializers import PacientesSerializer
# Create your views here.

class PacientesList(APIView):
    def get(self, request):
        pacientes = Pacientes.objects.all()
        serializer = PacientesSerializer(pacientes, many=True)
        return Response(serializer.data)
    

    # guarda un paciente en la lista de pacientes
    def post(self, request):
        serializer = PacientesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class PacienteDetail(APIView):
    # obtiene un paciente, pasando su id
    def get(self, request, pk):
        paciente = Pacientes.objects.get(pk=pk)
        serializer = PacientesSerializer(paciente)
        return Response(serializer.data)
    
    # puede editar un paciente, pasando su id
    def put(self, request, pk):
        paciente = Pacientes.objects.get(pk=pk)
        serializer = PacientesSerializer(paciente, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    # puede borrar un paciente, pasando su id
    def delete(self, request, pk):
        paciente = Pacientes.objects.get(pk=pk)
        paciente.delete()
        return Response(status=204)
    