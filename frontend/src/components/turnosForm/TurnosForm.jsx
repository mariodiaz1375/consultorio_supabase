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
    isFilterBlocked = false,
    loggedInUserId = null
}) {

    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState(initialFormData);

    const horariosDisponibles = React.useMemo(() => {
        const { odontologo, fecha_turno } = formData;
        
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

    }, [formData, horariosFijos, turnosExistentes, isEditing, initialData]);

    // ----------------------------------------------------
    // 1. LÓGICA DE FILTRADO DE PACIENTES
    // ----------------------------------------------------
    const filteredPacientes = React.useMemo(() => {
        if (!searchTerm) {
            return pacientes;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        return pacientes.filter(p => {
            // Asumiendo que cada paciente tiene al menos nombre, apellido y dni
            const fullName = `${p.nombre} ${p.apellido}`.toLowerCase();
            const dni = p.dni ? String(p.dni).toLowerCase() : '';
            
            return fullName.includes(lowerCaseSearchTerm) || 
                   dni.includes(lowerCaseSearchTerm);
        });
    }, [pacientes, searchTerm]);
    
    // ... (useEffect, handleChange, handleSubmit) ...

    // 💡 NUEVO MANEJADOR para el campo de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Cargar datos iniciales para edición
    useEffect(() => {
        let initialDataForForm = initialFormData;
        if (initialData) {
            // Mapear los datos de lectura (ej: paciente.id) a los campos de escritura (paciente_id)
            initialDataForForm = {
                paciente: initialData.paciente, // Usamos los IDs planos que mapeamos en TurnosList
                odontologo: initialData.odontologo, 
                horario_turno: initialData.horario_turno,
                estado_turno: initialData.estado_turno,
                fecha_turno: initialData.fecha_turno,
                motivo: initialData.motivo || '',
            };
        } else if (isFilterBlocked && loggedInUserId) {
            initialDataForForm = {
                 ...initialFormData,
                 odontologo: loggedInUserId, // Forzar el ID del odontólogo
             };
        } 
        setFormData(initialDataForForm);
    }, [initialData, isFilterBlocked, loggedInUserId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = (name === 'paciente' || name === 'odontologo' || name === 'horario_turno' || name === 'estado_turno') && value !== ''
            ? parseInt(value, 10)
            : value;
        setFormData(prev => ({
            ...prev,
            [name]: parsedValue,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.paciente || !formData.odontologo || !formData.fecha_turno || !formData.horario_turno) {
            alert('Por favor, complete todos los campos obligatorios (Paciente, Odontólogo, Fecha y Horario).');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form className={styles['turnos-form']} onSubmit={handleSubmit}>
            {/* Selector de PACIENTE */}
            <label htmlFor="search_paciente">Buscar Paciente (Nombre, Apellido o DNI)</label>
            {/* 💡 Campo de Búsqueda */}
            <input
                id="search_paciente"
                type="text"
                placeholder="Escriba aquí para filtrar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles['search-input']} // Puedes estilizar este input en tu CSS
            />

            <label htmlFor="paciente">Paciente (*)</label>
            <select
                id="paciente"
                name="paciente"
                value={formData.paciente}
                onChange={handleChange}
                required
            >
                <option value="">
                    {searchTerm ? `Resultados: ${filteredPacientes.length}` : 'Seleccione Paciente'}
                </option>
                
                {/* 🚨 USAR LA LISTA FILTRADA 🚨 */}
                {filteredPacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                        {`${paciente.nombre} ${paciente.apellido} (DNI: ${paciente.dni})`}
                    </option>
                ))}
            </select>
            
            {/* 💡 Mensaje si no hay resultados */}
            {searchTerm && filteredPacientes.length === 0 && (
                <p className={styles['alert-info']}>
                    No se encontraron pacientes que coincidan con la búsqueda.
                </p>
            )}
            
            {/* Selector de ODONTÓLOGO (¡Debes implementarlo en tu JSX!) */}
            <label htmlFor="odontologo">Odontólogo (*)</label>
            <select
                id="odontologo"
                name="odontologo"
                value={formData.odontologo}
                onChange={handleChange}
                disabled={isFilterBlocked}
                required
            >
                {isFilterBlocked ? (
                    // Mostrar solo la opción del odontólogo logueado si está bloqueado
                    odontologos
                        .filter(o => o.id === formData.odontologo)
                        .map(o => (
                            <option key={o.id} value={o.id}>
                                {`${o.nombre} ${o.apellido} (Mi cuenta)`}
                            </option>
                        ))
                ) : (
                    // Mostrar todas las opciones si no está bloqueado (Admin o no Odontólogo)
                    <>
                        <option value="">Seleccione un Odontólogo</option>
                        {odontologos.map(o => (
                            <option key={o.id} value={o.id}>
                                {`${o.nombre} ${o.apellido}`}
                            </option>
                        ))}
                    </>
                )}
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