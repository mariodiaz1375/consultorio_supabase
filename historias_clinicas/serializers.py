from rest_framework import serializers
from .models import HistoriasClinicas

class HistClinSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriasClinicas
        fields = '__all__'

