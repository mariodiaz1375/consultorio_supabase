import React, { useEffect, useState } from 'react'
import PacienteCard from '../pacienteCard/PacienteCard'
import { getPacientes } from '../../api/pacientes.api'
import styles from './PacientesList.module.css'

export default function PacientesList() {
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    const fetchPacientes = async () => {
      const data = await getPacientes()
      console.log(data)
      setPacientes(data)
    }
    fetchPacientes()
  }, [])

  return (
    <div>
      <div className={styles['encabezado']}>
        <h1 className={styles.title}>Lista de Pacientes</h1>
        <div className={styles['boton-conteiner']}>
          <button className={styles['register-button']}>Registrar Paciente</button>
        </div>
      </div>
      <div>
        {pacientes.map(paciente => (
          <PacienteCard key={paciente.id} paciente={paciente}/>
        ))}
      </div>
    </div>
  );
}

//   return (
//     <div>
//       <h1>Lista de Pacientes</h1>
//       {pacientes.map(paciente => (
//         <PacienteCard key={paciente.id} paciente={paciente}/>
//       ))}
//     </div>
//   )
// }
