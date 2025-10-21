from rest_framework import serializers
from .models import Turnos, EstadosTurnos, HorarioFijo, DiaSemana
from pacientes.models import Pacientes
from personal.models import Personal
# Asegúrate de que los modelos externos (Personal, Pacientes) también están disponibles
# Generalmente se importan en el Serializer si se necesitan, o se asume su existencia.
# Usaremos StringRelatedField, por lo que no necesitamos el import directo de Personal/Pacientes.


# --- Serializers para Listas Maestras ---
# Necesarios para cargar las opciones de <select> en el frontend.

class EstadosTurnosSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosTurnos
        fields = '__all__'

class HorarioFijoSerializer(serializers.ModelSerializer):
    # El campo 'hora' se serializa como cadena (ej. "17:30:00")
    class Meta:
        model = HorarioFijo
        fields = '__all__'

class DiaSemanaSerializer(serializers.ModelSerializer):
    # Devuelve el número y el nombre del día
    nombre_dia = serializers.CharField(source='__str__', read_only=True)
    
    class Meta:
        model = DiaSemana
        fields = ['id', 'numero_dia', 'nombre_dia']


# ----------------------------------------
# --- Serializer Principal de Turnos ---
# ----------------------------------------

class TurnosSerializer(serializers.ModelSerializer):
    # Campos Read-Only para mostrar el nombre completo de las FKs en la lectura (GET)
    # StringRelatedField usa el método __str__ de los modelos relacionados.
    
    # Muestra el nombre del odontólogo
    odontologo_nombre = serializers.StringRelatedField(source='odontologo', read_only=True)
    # Muestra el nombre del paciente
    paciente_nombre = serializers.StringRelatedField(source='paciente', read_only=True)
    # Muestra la hora del turno (usando __str__ de HorarioFijo)
    horario_display = serializers.StringRelatedField(source='horario_turno', read_only=True)
    # Muestra el nombre del estado
    estado_nombre = serializers.StringRelatedField(source='estado_turno', read_only=True)

    class Meta:
        model = Turnos
        fields = (
            'id', 
            
            # Campos de Foreign Key (para enviar IDs al crear/editar)
            'odontologo', 
            'paciente', 
            'horario_turno', 
            'estado_turno', 
            
            # Campos de datos simples
            'fecha_turno',
            
            # Campos Read-Only para la visualización (muestran nombres)
            'odontologo_nombre', 
            'paciente_nombre', 
            'horario_display',
            'estado_nombre',
            # 'motivo', # Si agregaste el campo motivo al modelo Turnos
        )
        
        # Los campos de nombre solo se incluyen en las respuestas (GET), no son modificables.
        read_only_fields = ('odontologo_nombre', 'paciente_nombre', 'horario_display', 'estado_nombre')