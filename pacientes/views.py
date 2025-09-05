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