from rest_framework import serializers
from .models import Pagos

class PagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagos
        fields = '__all__'

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagos
        fields = [Pagos.__str__, 'pagado']