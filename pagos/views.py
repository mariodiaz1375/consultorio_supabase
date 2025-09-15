from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Pagos
from .serializers import PagosSerializer

# Create your views here.

class PagosList(APIView):
    def get(self, request):
        pagos = Pagos.objects.all()
        serializer = PagosSerializer(pagos, many=True)
        return Response(serializer.data)