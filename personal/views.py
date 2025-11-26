from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Personal
from .serializers import Personal1Serializer
from rest_framework import generics, status
from .models import Puestos, Especialidades
from .serializers import PuestosSerializer, EspecialidadesSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer


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
    
    # puede editar un paciente completo, pasando su id
    def put(self, request, pk):
        personal = Personal.objects.get(pk=pk)
        serializer = Personal1Serializer(personal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    # 🆕 NUEVO: Permite actualización parcial (solo algunos campos)
    def patch(self, request, pk):
        personal = Personal.objects.get(pk=pk)
        # partial=True permite actualizar solo los campos enviados
        serializer = Personal1Serializer(personal, data=request.data, partial=True)
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

class EspecialidadesList(generics.ListAPIView):
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadesSerializer

class PersonalMeView(generics.RetrieveAPIView):
    """
    Vista que devuelve la información del registro de Personal asociado 
    al usuario que realiza la solicitud (usuario autenticado).
    """
    permission_classes = [IsAuthenticated] 
    serializer_class = Personal1Serializer 

    def get_object(self):
        try:
            return Personal.objects.get(user=self.request.user)
        except Personal.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("No se encontró un registro de Personal asociado a este usuario.")
        
class PasswordResetRequestView(APIView):
    """
    Vista para solicitar el reseteo de contraseña.
    Envía un email con el enlace de recuperación.
    """
    permission_classes = []  # Permitir acceso sin autenticación

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Vista para confirmar el reseteo de contraseña.
    Valida el token y actualiza la contraseña.
    """
    permission_classes = []  # Permitir acceso sin autenticación

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            result = serializer.save()
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)