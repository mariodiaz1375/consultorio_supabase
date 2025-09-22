import React from 'react'


export default function PacienteCard({ paciente }) {
  return (
    <div>
      <h1>
        {paciente.dni} {paciente.nombre} {paciente.apellido}
      </h1>
    </div>
  )
}
