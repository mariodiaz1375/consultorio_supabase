import React, { useEffect, useState } from 'react'
import PacienteCard from '../pacienteCard/PacienteCard'
import { getPacientes } from '../../api/pacientes.api'

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
      <h1>Lista de Pacientes</h1>
      {pacientes.map(paciente => (
        <PacienteCard key={paciente.id} paciente={paciente}/>
      ))}
    </div>
  )
}
