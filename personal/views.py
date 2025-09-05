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