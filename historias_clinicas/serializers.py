from rest_framework import serializers
from .models import HistoriasClinicas, DetallesHC, SeguimientoHC, PiezasDentales, CarasDentales, Tratamientos

# Serializers para entidades simples o de catálogo (opcional, pero útil)
class PiezaDentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = PiezasDentales
        fields = '__all__'

class CaraDentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarasDentales
        fields = '__all__'

class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamientos
        fields = '__all__'





class HistClinSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriasClinicas
        fields = '__all__'

