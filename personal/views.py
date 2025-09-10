from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Personal
from .serializers import Personal1Serializer

# Create your views here.

class PersonalList(APIView):
    def get(self, request):
        personal = Personal.objects.all()
        serializer = Personal1Serializer(personal, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = Personal1Serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class PersonalDetail(APIView):
    # obtiene un paciente, pasando su id
    def get(self, request, pk):
        personal = Personal.objects.get(pk=pk)
        serializer = Personal1Serializer(personal)
        return Response(serializer.data)
    
    # puede editar un paciente, pasando su id
    def put(self, request, pk):
        personal = Personal.objects.get(pk=pk)
        serializer = Personal1Serializer(personal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    # puede borrar un paciente, pasando su id
    def delete(self, request, pk):
        personal = Personal.objects.get(pk=pk)
        personal.delete()
        return Response(status=204)