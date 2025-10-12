

// export default function PacienteCard({ paciente }) {
//   return (
//     <div>
//       <h1>
//         {paciente.dni} {paciente.nombre} {paciente.apellido}
//       </h1>
//       <button>Editar / Detalles</button>
//       <button>Eliminar</button>
//     </div>
//   )
// }


// export default function PacienteCard({ paciente }) {
//   return (
//     <div className="paciente-card">
//       <h1>
//         {paciente.dni} {paciente.nombre} {paciente.apellido}
//       </h1>
//       <div className="button-group">
//         <button className="edit-button">Editar / Detalles</button>
//         <button className="delete-button">Eliminar</button>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import styles from './PacienteCard.module.css'; // <-- Importa el objeto 'styles'

export default function PacienteCard({ paciente, onEditStart }) {
  return (
    <div className={styles['paciente-card']}>
      <h2 className={styles.title}>
        {paciente.dni} {paciente.nombre} {paciente.apellido}
      </h2>
      <div className={styles['button-group']}>
        <button className={styles['edit-button']} onClick={() => onEditStart(paciente)}>Editar</button>
        <button className={styles['edit-button']}>Ver detalles</button>
        <button className={styles['delete-button']}>Eliminar</button>
      </div>
    </div>
  );
}