from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated # 🚨 REQUERIDO
from rest_framework.exceptions import NotFound
from .models import Pagos, Entregas, Cuotas
from .serializers import PagosSerializer, EntregasSerializer, CuotasSerializer

# --- 1. Vistas Principales (CRUD de Pagos) ---

class PagosList(APIView):
    permission_classes = [IsAuthenticated] # 🚨 Proteger el endpoint

    # LISTAR TODOS (GET /api/pagos/)
    def get(self, request):
        pagos = Pagos.objects.all().select_related(
            'entrega', 
            'cuota', 
            'hist_clin', 
            'hist_clin__paciente',
            'registrado_por'
        ).order_by('-id') # O -fecha_limite si lo prefieres
        serializer = PagosSerializer(pagos, many=True)
        return Response(serializer.data)
    
    # CREAR UNO NUEVO (POST /api/pagos/)
    def post(self, request):
        data = request.data.copy()
        
        # 🚨 LÓGICA DE AUDITORÍA: Inyectar el personal autenticado
        try:
            # request.user.personal (asumiendo related_name='personal' o default)
            personal_instance = request.user.personal 
            data['registrado_por'] = personal_instance.id
        except AttributeError:
             # El usuario autenticado no tiene un perfil 'Personal' vinculado
            return Response(
                {"detail": "El usuario autenticado no tiene un perfil de Personal asociado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PagosSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PagosDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Pagos.objects.select_related(
                'entrega', 'cuota', 'hist_clin', 'registrado_por'
            ).get(pk=pk)
        except Pagos.DoesNotExist:
            raise NotFound()

    # OBTENER DETALLE (GET /api/pagos/1/)
    def get(self, request, pk):
        pago = self.get_object(pk)
        serializer = PagosSerializer(pago)
        return Response(serializer.data)

    # EDITAR (PUT/PATCH /api/pagos/1/)
    def put(self, request, pk):
        pago = self.get_object(pk)
        data = request.data.copy()
        
        # 🚨 Seguridad: No permitir que el 'registrado_por' se cambie en una edición
        if 'registrado_por' in data:
            del data['registrado_por']
        
        serializer = PagosSerializer(pago, data=data, partial=True) # partial=True para PATCH
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ELIMINAR (DELETE /api/pagos/1/)
    def delete(self, request, pk):
        pago = self.get_object(pk)
        pago.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- 2. Vistas para Catálogos (CRUD de Entregas y Cuotas) ---
# (Usando 'generics' como en tu Dashboard.jsx)

class EntregasList(generics.ListCreateAPIView):
    queryset = Entregas.objects.all().order_by('nombre_ent')
    serializer_class = EntregasSerializer
    permission_classes = [IsAuthenticated] 

class EntregasDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Entregas.objects.all()
    serializer_class = EntregasSerializer
    permission_classes = [IsAuthenticated] 

class CuotasList(generics.ListCreateAPIView):
    queryset = Cuotas.objects.all().order_by('nombre_cuota')
    serializer_class = CuotasSerializer
    permission_classes = [IsAuthenticated] 

class CuotasDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cuotas.objects.all()
    serializer_class = CuotasSerializer
    permission_classes = [IsAuthenticated]