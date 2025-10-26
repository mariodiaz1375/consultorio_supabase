// src/components/turnosForm/TurnosForm.jsx

import React, { useState, useEffect } from 'react';
// 🚨 CORRECCIÓN 1: Debería apuntar a su propio archivo CSS
import styles from './TurnosForm.module.css'; 
// Importamos las funciones API necesarias para crear/editar
// 🚨 CORRECCIÓN 2: Eliminada la importación incorrecta de TurnoCard

    // 💡 Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDateString = () => {
    const today = new Date();
    // Obtener las partes
    const year = today.getFullYear();
    // Sumamos 1 a getMonth() porque es base 0 (Enero=0). Agregamos '0' si es necesario.
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

const TODAY_DATE = getTodayDateString(); 

const initialFormData = {
    // 1. Foreign Keys - se envían como IDs
    paciente: '',
    odontologo: '',
    horario_turno: '',
    estado_turno: '3',

    // 2. Campos de datos
    fecha_turno: TODAY_DATE,
    motivo: '',
};

export default function TurnosForm({
    onSubmit,           
    pacientes = [],     
    odontologos = [],   
    horariosFijos = [], 
    initialData = null, 
    isEditing = false,
    submissionError = null,
    turnosExistentes = [],
}) {
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState('');

    const horariosDisponibles = React.useMemo(() => {
        const { paciente, odontologo, fecha_turno } = formData;
        
        // 1. Si no hay odontólogo y fecha, todos están disponibles (o ninguno)
        if (!odontologo || !fecha_turno) {
            return horariosFijos; // Mostrar todos si faltan datos clave
        }

        // 2. Encontrar los IDs de los horarios ya ocupados en la fecha y con el odontólogo
        const horariosOcupadosIDs = turnosExistentes
            .filter(turno => 
                // Filtramos por la fecha seleccionada
                turno.fecha_turno === fecha_turno && 
                // Filtramos por el odontólogo seleccionado
                turno.odontologo === odontologo &&
                // IMPORTANTE: Permitir editar el turno actual sin que se filtre a sí mismo.
                (!isEditing || turno.id !== initialData?.id)
            )
            .map(turno => turno.horario_turno); // Devolvemos solo el ID del horario

        // 3. Filtrar la lista completa de horarios fijos
        return horariosFijos.filter(horario => 
            !horariosOcupadosIDs.includes(horario.id)
        );

    }, [formData.odontologo, formData.fecha_turno, horariosFijos, turnosExistentes, isEditing, initialData]);

    // Cargar datos iniciales para edición
    useEffect(() => {
        if (initialData) {
            // Mapear los datos de lectura (ej: paciente.id) a los campos de escritura (paciente_id)
            setFormData({
                paciente: initialData.paciente, // Usamos los IDs planos que mapeamos en TurnosList
                odontologo: initialData.odontologo, 
                horario_turno: initialData.horario_turno,
                estado_turno: initialData.estado_turno,
                fecha_turno: initialData.fecha_turno,
                motivo: initialData.motivo || '',
            });
        } else {
             // Modo Creación: Reinicia al valor por defecto (incluyendo estado_turno: '1')
            setFormData(initialFormData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = (name === 'paciente' || name === 'odontologo' || name === 'horario_turno' || name === 'estado_turno') && value !== ''
            ? parseInt(value, 10)
            : value;
        setFormData(prev => ({
            ...prev,
            [name]: parsedValue,
        }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.paciente || !formData.odontologo || !formData.fecha_turno || !formData.horario_turno) {
            setError('Por favor, complete todos los campos obligatorios (Paciente, Odontólogo, Fecha y Horario).');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form className={styles['turnos-form']} onSubmit={handleSubmit}>
            {/* Si tienes un mensaje de error */}
            {error && <p className={styles.error}>{error}</p>}
            
            {/* Selector de PACIENTE */}
            <label htmlFor="paciente">Paciente (*)</label>
            <select
                id="paciente"
                name="paciente" // 🚨 CORREGIDO
                value={formData.paciente}
                onChange={handleChange}
                required
            >
                <option value="">Seleccione Paciente</option>
                {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.nombre} {p.apellido}
                    </option>
                ))}
            </select>
            
            {/* Selector de ODONTÓLOGO (¡Debes implementarlo en tu JSX!) */}
            <label htmlFor="odontologo">Odontólogo (*)</label>
            <select
                id="odontologo"
                name="odontologo" // 🚨 CORREGIDO
                value={formData.odontologo}
                onChange={handleChange}
                required
            >
                <option value="">Seleccione Odontólogo</option>
                {odontologos.map(o => (
                    <option key={o.id} value={o.id}>
                        {o.nombre} {o.apellido}
                    </option>
                ))}
            </select>

            
            {/* Campo FECHA */}
            <label htmlFor="fecha_turno">Fecha (*)</label>
            <input
                id="fecha_turno"
                type="date"
                name="fecha_turno"
                value={formData.fecha_turno}
                onChange={handleChange}
                min={TODAY_DATE}
                required
            />

                {/* Selector de HORARIO */}
             <label htmlFor="horario_turno">Horario (*)</label>
            <select
                id="horario_turno"
                name="horario_turno" // 🚨 CORREGIDO
                value={formData.horario_turno}
                onChange={handleChange}
                required
            >
                <option value="">
                {/* Mensaje dinámico */}
                {formData.odontologo && formData.fecha_turno 
                    ? 'Seleccione Horario Libre' 
                    : 'Seleccione Odontólogo y Fecha primero'}
                </option>
        
            {/* 🚨 USAR LA LISTA FILTRADA 🚨 */}
            {horariosDisponibles.map(horario => (
                <option key={horario.id} value={horario.id}>
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