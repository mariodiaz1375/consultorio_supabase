from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Personal
from .serializers import Personal1Serializer
from rest_framework import generics # Importar para usar ListAPIView
from .models import Puestos, Especialidades
from .serializers import PuestosSerializer, EspecialidadesSerializer # Importar los nuevos serializers


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
    
class PuestosList(generics.ListAPIView):
    queryset = Puestos.objects.all()
    serializer_class = PuestosSerializer
    # Opcional: Proteger también esta lista si solo usuarios logueados pueden verla
    # permission_classes = [IsAuthenticated] 

# Vista para obtener la lista completa de Especialidades
class EspecialidadesList(generics.ListAPIView):
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadesSerializer
    # Opcional: Proteger también esta lista
    # permission_classes = [IsAuthenticated]

class PersonalMeView(generics.RetrieveAPIView):
    """
    Vista que devuelve la información del registro de Personal asociado 
    al usuario que realiza la solicitud (usuario autenticado).
    """
    # 1. Requiere que el usuario esté autenticado con un token
    permission_classes = [IsAuthenticated] 
    
    # 2. Especifica qué Serializer usar para dar formato a los datos
    serializer_class = Personal1Serializer 

    def get_object(self):
        # 3. La lógica clave: filtra el modelo 'Personal' para encontrar 
        #    el objeto cuyo campo 'user' (Foreign Key) coincida con el usuario 
        #    actual de la solicitud (self.request.user).
        try:
            return Personal.objects.get(user=self.request.user)
        except Personal.DoesNotExist:
            # Puedes manejar el error si un usuario está logeado pero 
            # no tiene un registro de Personal asociado
            from rest_framework.exceptions import NotFound
            raise NotFound("No se encontró un registro de Personal asociado a este usuario.")
