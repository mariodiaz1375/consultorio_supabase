// src/components/turnosCard/TurnoCard.jsx

import React from 'react';
// IMPORTANTE: Reutilizamos los estilos de la lista para no crear un nuevo archivo CSS solo para la tarjeta.
import styles from '../turnosList/TurnosList.module.css'; 

/**
 * Componente que muestra una tarjeta individual de turno.
 * @param {object} props - Propiedades del componente.
 * @param {object} props.turno - El objeto turno tal como viene de la API.
 * @param {function} props.onEditStart - Función para iniciar la edición.
 */
export default function TurnoCard({ turno, onEditStart }) {
    // 🚨 CORRECCIÓN: Usamos las propiedades planas (flat) que proporciona tu API
    const fecha = turno.fecha_turno;
    const hora = turno.horario_display || 'N/A';
    const estado = turno.estado_nombre || 'Desconocido';
    const paciente = turno.paciente_nombre || 'N/A';
    const odontologo = turno.odontologo_nombre || 'N/A';
    
    // Genera la clase CSS para el estado (ej: estado-ocupado, estado-pendiente)
    const estadoClassName = `estado-${estado.toLowerCase().replace(/ /g, '-')}`; 

    return (
        <div className={styles['turno-card']}>
            <div className={styles['turno-info']}>
                <p className={styles['turno-fecha']}>📅 {fecha} - 🕒 {hora}</p>
                <p>👤 **Paciente:** {paciente}</p>
                <p>🧑‍⚕️ **Odontólogo:** {odontologo}</p>
                {/* Aplicamos la clase dinámica usando la notación de corchetes */}
                <p className={styles[estadoClassName]}>
                    **Estado:** {estado}
                </p>
            </div>
            <div className={styles['turno-actions']}>
                <button 
                    className={styles['edit-btn']} 
                    onClick={() => onEditStart(turno)}
                >
                    Editar
                </button>
            </div>
        </div>
    );
}