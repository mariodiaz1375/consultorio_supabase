import React from 'react';
import styles from './PersonalCard.module.css';

export default function PersonalCard({ miembro, onEditStart, onViewDetail, onDelete }) {
  const isActivo = miembro.activo;
  const buttonText = isActivo ? 'Desactivar' : 'Activar';
  const buttonClass = isActivo ? styles['delete-button'] : styles['activate-button'];

  return (
    <div className={styles['personal-card']}>
      <h2 className={styles.title}>
        {miembro.apellido}, {miembro.nombre} ({miembro.puesto_info.nombre_puesto})
      </h2>
      <div className={styles['button-group']}>
        <button className={styles['edit-button']} onClick={() => onEditStart(miembro)}>Editar</button>
        <button className={styles['edit-button']} onClick={() => onViewDetail(miembro)}>Ver detalles</button>
        <button 
          className={buttonClass} 
          onClick={() => onDelete(miembro.id, miembro.nombre, miembro.apellido, isActivo)} 
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}