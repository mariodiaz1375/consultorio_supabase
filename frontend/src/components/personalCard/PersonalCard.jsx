import React from 'react';
import styles from './PersonalCard.module.css'; // <-- Importa el objeto 'styles'

export default function PersonalCard({ miembro }) {
  return (
    <div className={styles['personal-card']}>
      <h2 className={styles.title}>
        {miembro.puesto} {miembro.nombre} {miembro.apellido}
      </h2>
      <div className={styles['button-group']}>
        <button className={styles['edit-button']}>Editar / Detalles</button>
        <button className={styles['delete-button']}>Eliminar</button>
      </div>
    </div>
  );
}