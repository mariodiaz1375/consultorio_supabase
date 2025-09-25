// src/components/personalForm/PersonalForm.jsx

import React, { useState } from 'react';
import styles from './PersonalForm.module.css';

const initialFormData = {
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    domicilio: '',
    telefono: '',
    email: '',
    matricula: '-',
    puesto: 3, // ID por defecto, cambiar por un SELECT en la práctica
    especialidades: [], // IDs de especialidades, cambiar por un SELECT/Multi-SELECT
    username: '', // <-- Nuevo campo para el Usuario
    password: '', // <-- Nuevo campo para la Contraseña
};

export default function PersonalForm({ onSubmit }) {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // El campo fecha_nacimiento debe ser una cadena válida "YYYY-MM-DD"
        // Los campos puesto y especialidades deben ser números/arrays de números (IDs)
        
        // Llamar a la función de envío que está en PersonalList
        onSubmit(formData);
    };

    // return (
    //     <form onSubmit={handleSubmit} style={{ 
    //         padding: '20px', 
    //         border: '1px solid #ccc', 
    //         borderRadius: '5px',
    //         marginBottom: '20px' 
    //     }}>
    //         <h3>Registrar Nuevo Miembro</h3>
            
    //         {/* Campos de Información Personal */}
    //         <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
    //         <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
    //         <input name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI" required />
    //         <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
    //         <input name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Domicilio" required />
    //         <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" required />
    //         <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
    //         <input name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Matrícula" />
            
    //         {/* Campos de Rol/Puesto (Aquí iría un SELECT real) */}
    //         <input name="puesto" value={formData.puesto} onChange={handleChange} placeholder="ID Puesto (e.g. 1)" type="number" required />
    //         {/* Las especialidades requerirán un manejo de array */}
            
    //         {/* Campos de Usuario y Contraseña (Clave para tu nuevo endpoint) */}
    //         <hr style={{margin: '15px 0'}} />
    //         <h4>Datos de Acceso (Usuario)</h4>
    //         <input name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de Usuario" required />
    //         <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
            
    //         <button type="submit" style={{ marginTop: '10px' }}>Crear Personal y Usuario</button>
    //     </form>
    // );

    return (
        // 2. REEMPLAZAR el 'style' inline por la clase CSS 'personal-form'
        <form onSubmit={handleSubmit} className={styles["personal-form"]}>
            <h3>Registrar Nuevo Miembro</h3>
            
            {/* Campos de Información Personal */}
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
            {/* Campos de Rol/Puesto */}
            Puesto
            <input name="puesto" value={formData.puesto} onChange={handleChange} placeholder="ID Puesto (e.g. 1)" type="number" required />
            
            {/* Campos de Usuario y Contraseña */}
            {/* Reemplazamos el style inline del hr por la regla CSS global */}
            <hr /> 
            <h4>Datos de Acceso (Usuario)</h4>
            Usuario
            <input name="username" value={formData.username} onChange={handleChange} placeholder="Nombre de Usuario" required />
            Contraseña
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required />
            
            {/* Reemplazamos el style inline del botón por la regla CSS global */}
            <button type="submit">Registrar miembro</button>
        </form>
    );
}