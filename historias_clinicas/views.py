from rest_framework.views import APIView
from rest_framework.response import Response
from .models import HistoriasClinicas
from .serializers import HistClinSerializer

# Create your views here.

class HistClinList(APIView):
    def get(self, request):
        historias = HistoriasClinicas.objects.all()
        serializer = HistClinSerializer(historias, many=True)
        return Response(serializer.data)