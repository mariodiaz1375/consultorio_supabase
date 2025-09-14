from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Turnos
from .serializers import Turnos1Serializer

# Create your views here.

class TurnosList(APIView):
    def get(self, request):
        turnos = Turnos.objects.all()
        serializer = Turnos1Serializer(turnos, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = Turnos1Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class TurnosDetail(APIView):
    # obtiene un miembro del personal, pasando su id
    def get(self, request, pk):
        turnos = Turnos.objects.get(pk=pk)
        serializer = Turnos1Serializer(turnos)
        return Response(serializer.data)
    
    # puede editar un miembro del personal, pasando su id
    def put(self, request, pk):
        turnos = Turnos.objects.get(pk=pk)
        serializer = Turnos1Serializer(turnos, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    