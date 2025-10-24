import React, { useState, useEffect } from 'react';
import styles from './TurnosForm.module.css'; // Asegúrate de crear este archivo CSS
// Importa las funciones API necesarias (asumo que existen)
// import { createTurno, updateTurno } from '../../api/turnos.api'; 

const initialFormData = {
    // 1. Foreign Keys - se envían como IDs
    paciente_id: '',       // ID del Paciente que pide el turno
    horario_turno_id: '',  // ID del Horario Fijo (ej: 09:00 AM)

    // 2. Campos de datos
    fecha_turno: '',       // Fecha seleccionada
    motivo: '',            // Motivo o Notas del turno
    // estado_turno_id: '1', // Podría ser 'Pendiente' por defecto, si es necesario
};

export default function TurnosForm({
    onSubmit,           // Función que se llama al enviar (maneja create/update)
    pacientes = [],     // Lista de pacientes (para el select)
    horariosFijos = [], // Lista de Horarios Fijos (para el select)
    initialData = null, // Para el modo edición
    isEditing = false,
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');

    // Cargar datos iniciales para edición
    useEffect(() => {
        if (initialData) {
            // Mapear los datos de lectura (ej: paciente.id) a los campos de escritura (paciente_id)
            setFormData({
                paciente_id: initialData.paciente.id,
                horario_turno_id: initialData.horario_turno.id,
                fecha_turno: initialData.fecha_turno,
                motivo: initialData.motivo,
                // ... otros campos
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError(''); // Limpiar errores al cambiar
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Validación simple
        if (!formData.paciente_id || !formData.fecha_turno || !formData.horario_turno_id) {
            setError('Por favor, complete todos los campos obligatorios (Paciente, Fecha y Horario).');
            return;
        }

        // 2. Llamar a la función onSubmit del componente padre
        onSubmit(formData);
    };

    return (
        <form className={styles['turnos-form']} onSubmit={handleSubmit}>
            <h3>{isEditing ? 'Editar Turno' : 'Registrar Nuevo Turno'}</h3>
            
            {error && <p className={styles.error}>{error}</p>}

            {/* Selector de PACIENTE */}
            <label htmlFor="paciente_id">Paciente (*)</label>
            <select
                id="paciente_id"
                name="paciente_id"
                value={formData.paciente_id}
                onChange={handleChange}
                required
            >
                <option value="">Seleccione Paciente</option>
                {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                        {/* Asumiendo que Paciente tiene nombre y apellido */}
                        {`${paciente.nombre} ${paciente.apellido} (${paciente.dni})`} 
                    </option>
                ))}
            </select>

            {/* Selector de FECHA */}
            <label htmlFor="fecha_turno">Fecha (*)</label>
            <input
                id="fecha_turno"
                type="date"
                name="fecha_turno"
                value={formData.fecha_turno}
                onChange={handleChange}
                required
            />

            {/* Selector de HORARIO */}
            <label htmlFor="horario_turno_id">Horario (*)</label>
            <select
                id="horario_turno_id"
                name="horario_turno_id"
                value={formData.horario_turno_id}
                onChange={handleChange}
                required
            >
                <option value="">Seleccione Horario</option>
                {horariosFijos.map(horario => (
                    <option key={horario.id} value={horario.id}>
                        {/* Asumiendo que HorarioFijo tiene un campo 'hora' */}
                        {horario.hora} 
                    </option>
                ))}
            </select>

            {/* Campo MOTIVO */}
            <label htmlFor="motivo">Motivo / Notas</label>
            <textarea
                id="motivo"
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                rows="3"
                placeholder="Escriba un breve motivo o nota del turno..."
            />

            <button type="submit">
                {isEditing ? 'Guardar Cambios' : 'Agendar Turno'}
            </button>
        </form>
    );
}