from rest_framework import serializers
from .models import Turnos

class Turnos1Serializer(serializers.ModelSerializer):
    class Meta:
        model = Turnos
        fields = '__all__'

