import React, { useState, useEffect } from 'react';
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
    genero_id: '',
    antecedentes_ids: [],
    analisis_funcional_ids: [],
    // estructura anidada para Obra Social
    os_pacientes_data: [], // Array de objetos: [{ os_id: N, num_afiliado: '' }]
};

// RECIBIR las listas de opciones como props
export default function PacientesForm({ 
    onSubmit, 
    generos = [], 
    antecedentes = [], 
    analisisFuncional = [],
    obrasSociales = [], //  Lista de Obras Sociales disponibles
    initialData = null,
    isEditing = false,
}) {

    const getInitialState = (data) => {
        if (!data) return initialFormData;

        // Mapeo inverso de las propiedades de lectura a las de escritura
        return {
            ...data,
            // 1. Foreign Key (Género): Viene como objeto, necesitamos solo el ID.
            genero_id: data.genero ? data.genero.id : (data.genero_info ? data.genero_info.id : ''),
            
            // 2. Many-to-Many: Viene como array de objetos, necesitamos array de IDs.
            antecedentes_ids: data.antecedentes_info ? data.antecedentes_info.map(a => a.id) : [],
            analisis_funcional_ids: data.analisis_funcional_info ? data.analisis_funcional_info.map(a => a.id) : [],

            // 3. Relación Anidada (OsPacientes): Viene como array de objetos, 
            //    necesitamos transformar la Obra Social de objeto a ID.
            os_pacientes_data: data.os_pacientes_info ? data.os_pacientes_info.map(item => ({
                os_id: item.os_info.id,
                num_afiliado: item.num_afiliado,
            })) : [],
            
            // Sobreescribir campos que no usamos en el formulario de edición (como 'edad', 'activo')
            // y asegurar que campos como fecha_nacimiento estén en formato YYYY-MM-DD
            fecha_nacimiento: data.fecha_nacimiento.substring(0, 10), 
        };
    };

    const [formData, setFormData] = useState(getInitialState(initialData));

    useEffect(() => {
        setFormData(getInitialState(initialData));
    }, [initialData]);

    // ==========================================================
    // 🚨 FUNCIONES DE MANEJO DE OBRAS SOCIALES (Array Anidado) 🚨
    // ==========================================================

    const handleOsChange = (index, e) => {
        const { name, value } = e.target;
        
        // 1. Crear una copia inmutable del array de Obras Sociales
        const newOsData = [...formData.os_pacientes_data];
        
        if (name === 'os_id') {
            // Convertir a número el ID si tiene valor (es lo que espera el Serializer anidado)
            newOsData[index][name] = value ? Number(value) : '';
        } else {
            // Para el número de afiliado (CharField)
            newOsData[index][name] = value;
        }

        // 2. Actualizar el estado con el nuevo array
        setFormData(prevData => ({
            ...prevData,
            os_pacientes_data: newOsData,
        }));
    };

    const handleAddOs = () => {
        // Agregar un nuevo objeto de Obra Social al array
        setFormData(prevData => ({
            ...prevData,
            os_pacientes_data: [
                ...prevData.os_pacientes_data,
                { os_id: '', num_afiliado: '' } // Objeto inicial
            ]
        }));
    };

    const handleRemoveOs = (index) => {
        // Eliminar el objeto del array por índice
        const newOsData = formData.os_pacientes_data.filter((_, i) => i !== index);
        setFormData(prevData => ({
            ...prevData,
            os_pacientes_data: newOsData,
        }));
    };

    // ==========================================================
    // FUNCIONES DE MANEJO ESTÁNDAR (Datos básicos, FK, M2M)
    // ==========================================================

    const handleChange = (e) => {
        const { name, value, type, options } = e.target;
        
        let newValue = value;

        // Lógica para campos Many-to-Many (Multi-Select)
        if ( (name === 'antecedentes_ids' || name === 'analisis_funcional_ids') && type === 'select-multiple') {
            newValue = Array.from(options)
                        .filter(option => option.selected)
                        .map(option => Number(option.value)); 
        } 
        
        // Lógica para campo Foreign Key (Género)
        else if (name === 'genero_id') {
            newValue = value ? Number(value) : ''; 
        }

        // Manejo estándar para el resto de los campos
        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // El formData ahora incluye el array os_pacientes_data listo para el Serializer
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles['pacientes-form']}> 
            
            
            {isEditing? <h3>Editar Paciente</h3> : <h3>Registrar nuevo paciente</h3>}
            
            {/* ======================= DATOS BÁSICOS ======================= */}
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
            
            <hr /> 

            {/* ======================= OBRAS SOCIALES (CAMPOS DINÁMICOS) ======================= */}
            <h4>Obras Sociales y Afiliación</h4>

            {formData.os_pacientes_data.map((osItem, index) => (
                // Usamos la clase 'os-group' para estilizar cada bloque de OS
                <div key={index} className={styles['os-group']}>
                    
                    <label>Obra Social #{index + 1}</label>
                    <select
                        name="os_id" 
                        value={osItem.os_id} 
                        onChange={(e) => handleOsChange(index, e)}
                    >
                        <option value="">Seleccione Obra Social</option>
                        {obrasSociales.map(os => (
                            <option key={os.id} value={os.id}>
                                {os.nombre_os}
                            </option>
                        ))}
                    </select>
                    
                    <label>Número de Afiliado</label>
                    <input 
                        type="text"
                        name="num_afiliado"
                        value={osItem.num_afiliado}
                        onChange={(e) => handleOsChange(index, e)}
                        placeholder="N° de Afiliado"
                    />

                    <button 
                        type="button" 
                        onClick={() => handleRemoveOs(index)}
                        className={styles['remove-os-btn']}
                    >
                        Eliminar Obra Social
                    </button>
                    {/* Separador visual para bloques de OS */}
                    {index < formData.os_pacientes_data.length - 1 && <hr className={styles['os-separator']}/>}
                </div>
            ))}

            <button type="button" onClick={handleAddOs} className={styles['add-os-btn']}>
                + Agregar Obra Social
            </button>
            
            <button type="submit">{isEditing? 'Guardar cambios' : 'Registrar paciente'}</button>
        </form>
    );
}