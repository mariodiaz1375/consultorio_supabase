// src/components/turnosCard/TurnoCard.jsx

import React from 'react';
// IMPORTANTE: Reutilizamos los estilos de la lista para no crear un nuevo archivo CSS solo para la tarjeta.
import styles from '../turnosList/TurnosList.module.css'; 


const getEstadoIcono = (estadoNombre) => {
    // Convertimos a minúsculas y limpiamos espacios para hacer la comparación robusta
    const estadoLimpio = estadoNombre.toLowerCase().trim();
    
    switch (estadoLimpio) {
        case 'agendado':
        case 'pendiente':
        case 'por atender':
            return '📝'; // Para estados que requieren acción futura
        case 'cancelado':
            return '❌'; // Para estados de anulación
        case 'finalizado':
        case 'atendido':
            return '✅'; // Para estados completados
        default:
            return 'ℹ️'; // Icono por defecto
    }
}

/**
 * Componente que muestra una tarjeta individual de turno.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.turno - El objeto turno tal como viene de la API.
 * @param {function} props.onDElete - Función para iniciar la edición.
 * @param {function} props.onEdit - Función para iniciar la edición.
 */
export default function TurnoCard({ turno, onDelete, onEdit, isSelected, onToggleSelect }) {
    // 🚨 CORRECCIÓN: Usamos las propiedades planas (flat) que proporciona tu API
    const fecha = turno.fecha_turno;
    const hora = turno.horario_display || 'N/A';
    const estado = turno.estado_nombre || 'Desconocido';
    const paciente = turno.paciente_nombre || 'N/A';
    const odontologo = turno.odontologo_nombre || 'N/A';
    const estadoIcono = getEstadoIcono(estado);
    
    // Genera la clase CSS para el estado (ej: estado-ocupado, estado-pendiente)
    const handleDeleteClick = () => {
        if (window.confirm(`¿Está seguro de que desea eliminar el turno de ${paciente} con ${odontologo} el ${fecha} a las ${hora}?`)) {
            onDelete(turno.id);
        }
    };

    const handleEditClick = () => {
        onEdit(turno); // Llama a la función onEdit pasada desde TurnosList
    };

    const handleCheckChange = (e) => {
        onToggleSelect(turno.id, e.target.checked); 
    };
    
    return (
        <div className={styles['turno-card']}>

            <div className={styles['checkbox-wrapper']}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckChange}
                    className={styles['checkbox-turno']}
                />
            </div>

            <div className={styles['turno-info']}>
                <p className={styles['turno-fecha']}>📅 {fecha} - 🕒 {hora}</p>
                <p>👤 Paciente: {paciente}</p>
                <p>🧑‍⚕️ Odontólogo: {odontologo}</p>
                <p>{estadoIcono} {estado}</p>
                {/* Aplicamos la clase dinámica usando la notación de corchetes */}
            </div>
            <div className={styles['turno-actions']}>
                <button 
                    className={styles['edit-btn']} // Asume que tienes un estilo para 'edit-btn'
                    onClick={handleEditClick}
                >
                    Editar
                </button>
                <button 
                    className={styles['delete-btn']} 
                    onClick={handleDeleteClick}
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}