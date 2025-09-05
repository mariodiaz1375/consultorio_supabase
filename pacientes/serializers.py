from rest_framework import serializers
from .models import Pacientes

class PacientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pacientes
        fields = '__all__'

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pacientes
        fields = ['nombre', 'apellido', 'dni']
