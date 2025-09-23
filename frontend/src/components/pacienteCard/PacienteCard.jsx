

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

export default function PacienteCard({ paciente }) {
  return (
    <div className={styles['paciente-card']}>
      <h1 className={styles.title}>
        {paciente.dni} {paciente.nombre} {paciente.apellido}
      </h1>
      <div className={styles['button-group']}>
        <button className={styles['edit-button']}>Editar / Detalles</button>
        <button className={styles['delete-button']}>Eliminar</button>
      </div>
    </div>
  );
}