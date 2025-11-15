from rest_framework import serializers
from .models import Pagos, TiposPagos, AuditoriaPagos
from historias_clinicas.models import HistoriasClinicas

# --- Serializer de TiposPagos ---
class TiposPagosSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposPagos
        fields = ('id', 'nombre_tipo_pago')

# --- Serializer de Auditoría ---
class AuditoriaPagosSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = AuditoriaPagos
        fields = (
            'id',
            'accion',
            'fecha_accion',
            'usuario',
            'usuario_nombre',
            'tipo_pago_nombre',
            'hist_clin',
            'hist_clin_numero',
            'paciente_nombre',
            'paciente_dni',
            'estado_pagado',
            'fecha_pago',
            'observaciones',
        )
        # 🚨 CORRECCIÓN: Sin read_only_fields o usar tupla
    
    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return f"{obj.usuario.nombre} {obj.usuario.apellido}"
        return "N/A"

# --- Serializer Principal de Pagos ---
class PagosSerializer(serializers.ModelSerializer):
    
    registrado_por_nombre = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Pagos
        fields = (
            'id',
            'tipo_pago',
            'hist_clin',
            'registrado_por',
            'pagado',
            'fecha_pago',
            'registrado_por_nombre',
        )
        read_only_fields = ('fecha_pago',)
    
    def get_registrado_por_nombre(self, obj):
        if obj.registrado_por:
            return f"{obj.registrado_por.nombre} {obj.registrado_por.apellido}"
        return "N/A"