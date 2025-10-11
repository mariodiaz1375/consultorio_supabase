// src/components/personalForm/PersonalForm.jsx

// 

// src/components/pacientesForm/PacientesForm.jsx

import React, { useState } from 'react';
import styles from './PacientesForm.module.css';

const initialFormData = {
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    domicilio: '',
    telefono: '',
    email: '',
    // CAMPOS RELACIONADOS (ID o Array de IDs)
    genero_id: '',               // <-- Foreign Key (simular el default=3 si se deja vacío)
    antecedentes_ids: [],        // <-- Many-to-Many (multi-select)
    analisis_funcional_ids: [],  // <-- Many-to-Many (multi-select)
};

// RECIBIR las listas de opciones como props
export default function PacientesForm({ 
    onSubmit, 
    generos = [], 
    antecedentes = [], 
    analisisFuncional = [] 
}) {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value, type, options } = e.target;
        
        let newValue = value;

        // 💥 Lógica para campos Many-to-Many (Multi-Select)
        if ( (name === 'antecedentes_ids' || name === 'analisis_funcional_ids') && type === 'select-multiple') {
            newValue = Array.from(options)
                        .filter(option => option.selected)
                        // Asegurar que sean números, que es lo que espera el Serializer para IDs
                        .map(option => Number(option.value)); 
        } 
        
        // 💥 Lógica para campo Foreign Key (Género)
        else if (name === 'genero_id') {
            // Asegurar que sea un número (ID) si tiene valor, si no, que sea string vacío.
            newValue = value ? Number(value) : ''; 
        }

        // 3. Manejo estándar para el resto de los campos
        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Asumiendo que el Serializer maneja el default=3 si genero_id es nulo, 
        // pero es más seguro enviarlo si el usuario seleccionó algo.
        onSubmit(formData);
        setFormData(initialFormData); 
    };

    return (
        // 🚨 Usar la clase del módulo CSS corregido
        <form onSubmit={handleSubmit} className={styles['pacientes-form']}> 
            <h3>Registrar Nuevo Paciente</h3>
            
            {/* ======================= DATOS BÁSICOS (CharField/DateField) ======================= */}
            <label>Nombre</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
            
            <label>Apellido</label>
            <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
            
            <label>DNI</label>
            <input name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI" required />
            
            <label>Fecha de Nacimiento</label>
            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
            
            <label>Domicilio</label>
            <input name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Domicilio" />
            
            <label>Teléfono</label>
            <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" />
            
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo Electrónico" />
            
            <hr /> 
            
            {/* ======================= RELACIONES FK/M2M ======================= */}
            <h4>Relaciones y Antecedentes</h4>

            {/* CAMPO GÉNERO (FOREIGN KEY) */}
            <label>Género</label>
            <select
                name="genero_id" 
                value={formData.genero_id} 
                onChange={handleChange}
            >
                {/* Opción vacía para el placeholder */}
                <option value="">Seleccione un Género</option>
                {generos.map(g => (
                    <option key={g.id} value={g.id}>
                        {g.nombre_ge}
                    </option>
                ))}
            </select>
            
            {/* CAMPO ANTECEDENTES (MANY-TO-MANY) */}
            <label>Antecedentes (Ctrl/Cmd + Clic para seleccionar múltiples)</label>
            <select
                name="antecedentes_ids"
                multiple 
                value={formData.antecedentes_ids} 
                onChange={handleChange}
            >
                {antecedentes.map(ant => (
                    <option key={ant.id} value={ant.id}>
                        {ant.nombre_ant}
                    </option>
                ))}
            </select>
            
            {/* CAMPO ANÁLISIS FUNCIONAL (MANY-TO-MANY) */}
            <label>Análisis Funcional (Ctrl/Cmd + Clic para seleccionar múltiples)</label>
            <select
                name="analisis_funcional_ids"
                multiple 
                value={formData.analisis_funcional_ids} 
                onChange={handleChange}
            >
                {analisisFuncional.map(af => (
                    <option key={af.id} value={af.id}>
                        {af.nombre_analisis}
                    </option>
                ))}
            </select>
            
            <button type="submit">Registrar Paciente</button>
        </form>
    );
}