// src/components/personalForm/PersonalForm.jsx

import React, { useState } from 'react';
import styles from './PersonalForm.module.css';

// Usamos los nombres de campo que espera el Serializer de DRF (write_only)
const initialFormData = {
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    domicilio: '',
    telefono: '',
    email: '',
    matricula: '-',
    puesto_id: '',       // <-- CAMBIO CLAVE: Cambiado de 'puesto' a 'puesto_id' (string vacío para select)
    especialidades_ids: [], // <-- CAMBIO CLAVE: Cambiado de 'especialidades' a 'especialidades_ids' (array vacío para multi-select)
    username: '', 
    password: '',
};

// RECIBIR las listas de opciones como props
export default function PersonalForm({ onSubmit, puestos = [], especialidades = [] }) {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value, type, options } = e.target;
        
        let newValue = value;

        // MANEJO ESPECIAL para Multi-Select de Especialidades
        if (name === 'especialidades_ids' && type === 'select-multiple') {
            // Recorre las opciones, filtra las seleccionadas y mapea sus valores a números (IDs)
            newValue = Array.from(options)
                .filter(option => option.selected)
                .map(option => Number(option.value)); 
        } 
        // MANEJO ESPECIAL para Single-Select de Puesto
        else if (name === 'puesto_id') {
            newValue = Number(value); // Asegurar que es un número (ID)
        }

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // formData ya tiene los campos puestos_id y especialidades_ids con el tipo de dato correcto
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles["personal-form"]}>
            <h3>Registrar Nuevo Miembro</h3>
            
            {/* CAMPOS DE TEXTO E INFORMACIÓN PERSONAL (sin cambios, solo estructura) */}
            Nombre
            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
            Apellido
            <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
            DNI
            <input name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI" required />
            Fecha de nacimiento
            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
            Domicilio
            <input name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Domicilio" required />
            Telefono
            <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" required />
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            Matricula
            <input name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Matrícula" />
            
            {/* =================================================== */}
            {/* CAMPO PUESTO (SELECT DINÁMICO) */}
            Puesto
            <select 
                name="puesto_id" // Usar el nombre que espera el Serializer
                value={formData.puesto_id} // Debe coincidir con el estado
                onChange={handleChange} 
                required
            >
                <option value="" disabled>Seleccionar Puesto</option>
                {/* Mapear las opciones de la prop 'puestos' */}
                {puestos.map(puesto => (
                    // El 'value' es el ID numérico, y el texto es el nombre
                    <option key={puesto.id} value={puesto.id}>
                        {puesto.nombre_puesto}
                    </option>
                ))}
            </select>
            <br />
            <br />
            
            {/* CAMPO ESPECIALIDADES (MULTI-SELECT DINÁMICO) */}
            Especialidades (Ctrl/Cmd + Clic para seleccionar múltiples)
            <br />
            <select
                name="especialidades_ids" // Usar el nombre que espera el Serializer
                multiple // <-- Habilitar la selección múltiple
                value={formData.especialidades_ids} // El valor debe ser un array de IDs
                onChange={handleChange}
            >
                {/* Mapear las opciones de la prop 'especialidades' */}
                {especialidades.map(esp => (
                    <option key={esp.id} value={esp.id}>
                        {esp.nombre_esp}
                    </option>
                ))}
            </select>
            {/* =================================================== */}

            {/* Campos de Usuario y Contraseña */}
            <hr /> 
            <h4>Datos de Acceso (Usuario)</h4>
            Usuario
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de Usuario" required />
            Contraseña
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
            
            <button type="submit">Registrar miembro</button>
        </form>
    );
}