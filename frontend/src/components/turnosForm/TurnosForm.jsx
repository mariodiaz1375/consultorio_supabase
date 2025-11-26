// src/components/turnosForm/TurnosForm.jsx

import React, { useState, useEffect } from 'react';
import Select from 'react-select'; // 1. Importamos la librería
import styles from './TurnosForm.module.css'; 
import { useAlert } from '../../hooks/useAlert';

// obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

const TODAY_DATE = getTodayDateString();

const getCurrentTimeString = () => {
    const today = new Date();
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const seconds = String(today.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
};
const ACTUAL_TIME = getCurrentTimeString();

const initialFormData = {
    paciente: '',
    odontologo: '',
    horario_turno: '',
    estado_turno: '3', // Por defecto 'Pendiente' (o el ID que corresponda)
    fecha_turno: TODAY_DATE,
    motivo: '',
};

// 2. Estilos personalizados para que React-Select coincida con tu CSS Module
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        borderColor: state.isFocused ? '#0f1419' : '#1a1f36',
        borderWidth: '2px',
        borderRadius: '8px',
        padding: '5px',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(26, 31, 54, 0.2)' : 'none',
        '&:hover': {
            borderColor: '#0f1419'
        }
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#1a1f36' : state.isFocused ? 'rgba(26, 31, 54, 0.1)' : 'white',
        color: state.isSelected ? 'white' : '#1a1f36',
        cursor: 'pointer',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#1a1f36',
        fontWeight: '500',
    }),
    input: (base) => ({
        ...base,
        color: '#1a1f36',
    })
};

export default function TurnosForm({
    onSubmit,           
    pacientes = [],     
    odontologos = [],   
    horariosFijos = [],
    estadosTurno = [],
    initialData = null, 
    isEditing = false,
    turnosExistentes = [],
    isFilterBlocked = false,
    loggedInUserId = null,
    onCancel,
    onAddHorarioClick,
}) {
    const { showWarning, showError } = useAlert();
    const [formData, setFormData] = useState(initialFormData);
    const [dateError, setDateError] = useState('');

    // 3. Transformamos los pacientes al formato que pide react-select: { value, label }
    const pacienteOptions = React.useMemo(() => {
        return pacientes.map(p => ({
            value: p.id,
            label: `${p.nombre} ${p.apellido} (DNI: ${p.dni})`
        }));
    }, [pacientes]);

    const horariosDisponibles = React.useMemo(() => {
        const { odontologo, fecha_turno } = formData;
        
        if (!odontologo || !fecha_turno) {
            return horariosFijos; 
        }

        const horariosOcupadosIDs = turnosExistentes
            .filter(turno => 
                turno.fecha_turno === fecha_turno && 
                turno.odontologo === odontologo &&
                (!isEditing || turno.id !== initialData?.id)
            )
            .map(turno => turno.horario_turno); 

        return horariosFijos.filter(horario => {
        // Si es hoy, filtrar solo horarios futuros
            if (fecha_turno === TODAY_DATE) {
                return horario.hora > ACTUAL_TIME && 
                    !horariosOcupadosIDs.includes(horario.id);
            }
            // Si es otra fecha, mostrar todos los horarios disponibles
            return !horariosOcupadosIDs.includes(horario.id);
        });
        
    }, [formData, horariosFijos, turnosExistentes, isEditing, initialData]);

    

    // Cargar datos iniciales para edición
    useEffect(() => {
        let initialDataForForm = initialFormData;
        if (initialData) {
            initialDataForForm = {
                paciente: initialData.paciente, 
                odontologo: initialData.odontologo, 
                horario_turno: initialData.horario_turno,
                estado_turno: initialData.estado_turno,
                fecha_turno: initialData.fecha_turno,
                motivo: initialData.motivo || '',
            };
        } else if (isFilterBlocked && loggedInUserId) {
            initialDataForForm = {
                 ...initialFormData,
                 odontologo: loggedInUserId,
             };
        } 
        setFormData(initialDataForForm);
    }, [initialData, isFilterBlocked, loggedInUserId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDateError(''); 

        if (name === 'fecha_turno') {
            const selectedDate = new Date(value + 'T00:00:00'); 
            const dayOfWeek = selectedDate.getUTCDay(); 

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                setDateError('🚫 No se pueden agendar turnos en Sábados ni Domingos.');
            } else {
                setDateError('');
            }
        }
        
        const parsedValue = (name === 'odontologo' || name === 'horario_turno' || name === 'estado_turno') && value !== ''
            ? parseInt(value, 10)
            : value;

        setFormData(prev => ({
            ...prev,
            [name]: parsedValue,
        }));
    };

    // 4. Nuevo handler específico para el Select de React-Select
    const handlePacienteChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            paciente: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (dateError) {
             showWarning(dateError);
             return;
        }

        if (!formData.paciente || !formData.odontologo || !formData.fecha_turno || !formData.horario_turno || !formData.estado_turno) {
            showError('Por favor, complete todos los campos obligatorios (Paciente, Odontólogo, Fecha y Horario).');
            return;
        }

        onSubmit(formData);
    };

    // Helper para encontrar el valor seleccionado actual para React-Select
    const selectedPacienteOption = pacienteOptions.find(option => option.value === formData.paciente);

    return (
        <form className={styles['turnos-form']} onSubmit={handleSubmit}>
            <h3>{isEditing ? 'Editar Turno' : 'Nuevo Turno'}</h3>

            {/* 5. Selector de PACIENTE con Buscador Integrado */}
            <label htmlFor="paciente">Paciente (*)</label>
            <Select
                id="paciente"
                value={selectedPacienteOption}
                onChange={handlePacienteChange}
                options={pacienteOptions}
                placeholder="Buscar por Nombre o DNI..."
                isClearable
                styles={customSelectStyles} // Aplicamos estilos
                noOptionsMessage={() => "No se encontraron pacientes"}
                required // Nota: React-Select no soporta 'required' nativo perfecto, validamos en handleSubmit
            />
            
            {/* Selector de ODONTÓLOGO */}
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
                    odontologos
                        .filter(o => o.id === formData.odontologo)
                        .map(o => (
                            <option key={o.id} value={o.id}>
                                {`${o.nombre} ${o.apellido} (Mi cuenta)`}
                            </option>
                        ))
                ) : (
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

            {dateError && <p className={styles['error-message']}>{dateError}</p>}

            {/* Selector de HORARIO */}
            <label htmlFor="horario_turno">Horario (*)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
                <select
                    id="horario_turno"
                    name="horario_turno"
                    value={formData.horario_turno}
                    onChange={handleChange}
                    required
                    style={{ flexGrow: 1 }} 
                >
                    <option value="">
                        {formData.odontologo && formData.fecha_turno 
                            ? 'Seleccione Horario Libre' 
                            : 'Seleccione Odontólogo y Fecha primero'}
                        </option>
                
                        {horariosDisponibles.map(horario => (
                        <option key={horario.id} value={horario.id}>
                            {horario.hora}
                        </option>
                    ))}
                </select>
                <button 
                    type="button" 
                    onClick={onAddHorarioClick} 
                    title="Administrar Horarios"
                    style={{ 
                        height: '38px', 
                        width: '38px',
                        padding: '0',
                        fontSize: '1.2rem',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                        marginBottom: '16px',
                    }}
                >
                    +
                </button>
            </div>

            <label htmlFor="estado_turno">Estado del Turno</label>
            <select
                id="estado_turno"
                name="estado_turno"
                value={formData.estado_turno}
                onChange={handleChange}
                required
                disabled={!isEditing}
            >
                <option value="">Seleccione el Estado</option>
                {estadosTurno.map(estado => (
                    <option key={estado.id} value={estado.id}>
                        {estado.nombre_est_tur}
                    </option>
                ))}
            </select>

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

            {isEditing && (
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className={styles['cancel-edit-btn']} 
                >
                    Cancelar Edición
                </button>
            )}
        </form>
    );
}