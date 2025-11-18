// src/components/turnosCard/TurnoCard.jsx

import React from 'react';
import { useConfirm } from '../../hooks/useConfirm';
import styles from '../turnosList/TurnosList.module.css'; 


const getEstadoIcono = (estadoNombre) => {
    const estadoLimpio = estadoNombre.toLowerCase().trim();
    
    switch (estadoLimpio) {
        case 'agendado':
        case 'pendiente':
        case 'por atender':
            return '📋';
        case 'cancelado':
            return '❌';
        case 'finalizado':
        case 'atendido':
            return '✅';
        default:
            return 'ℹ️';
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
    const { showConfirm } = useConfirm();
    
    const fecha = turno.fecha_turno;
    const hora = turno.horario_display || 'N/A';
    const estado = turno.estado_nombre || 'Desconocido';
    const paciente = turno.paciente_nombre || 'N/A';
    const odontologo = turno.odontologo_nombre || 'N/A';
    const estadoIcono = getEstadoIcono(estado);
    
    const handleDeleteClick = async () => {
        const confirmed = await showConfirm(`¿Está seguro de que desea eliminar el turno de ${paciente} con ${odontologo} el ${fecha} a las ${hora}?`);
        if (confirmed) {
            onDelete(turno.id);
        }
    };

    const handleEditClick = () => {
        onEdit(turno);
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
                {/* 🆕 ELIMINADO EL ID - Solo mostramos fecha y hora */}
                <p className={styles['turno-fecha']}>📅 {fecha} - 🕒 {hora}</p>
                <p>👤 Paciente: {paciente}</p>
                <p>🧑‍⚕️ Odontólogo: {odontologo}</p>
                <p>{estadoIcono} {estado}</p>
            </div>
            <div className={styles['turno-actions']}>
                <button 
                    className={styles['edit-btn']}
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