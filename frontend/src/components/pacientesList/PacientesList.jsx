import React, { useEffect, useState } from 'react'
import PacienteCard from '../pacienteCard/PacienteCard'
import { getPacientes } from '../../api/pacientes.api'

export default function PacientesList() {
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    const fetchPacientes = async () => {
      const data = await getPacientes()
      setPacientes(data)
    }
    fetchPacientes()
  }, [])
  
  return (
    <div>PacientesList</div>
  )
}
