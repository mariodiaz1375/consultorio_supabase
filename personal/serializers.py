from rest_framework import serializers
from .models import Personal

class Personal1Serializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'

class Personal2Serializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = ['nombre', 'apellido', 'matricula']
