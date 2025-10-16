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

const MIN_PHONE_LENGTH = 7; 

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// RECIBIR las listas de opciones como props
export default function PacientesForm({ 
    onSubmit, 
    generos = [], 
    antecedentes = [], 
    analisisFuncional = [],
    obrasSociales = [], //  Lista de Obras Sociales disponibles
    initialData = null,
    isEditing = false,
    checkDniUniqueness,
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

    const [dniError, setDniError] = useState(''); 

    const [fechaNacimientoError, setFechaNacimientoError] = useState('');

    const [telefonoError, setTelefonoError] = useState('');

    const [emailError, setEmailError] = useState('');

    const tiempoActualMilisegundos = Date.now();

    const [dniCheckLoading, setDniCheckLoading] = useState(false); 

    const [nombreError, setNombreError] = useState('');
    const [apellidoError, setApellidoError] = useState('');
    const [generoIdError, setGeneroIdError] = useState('');

    // // 2. Crear un objeto Date a partir de los milisegundos
    // const fechaActual = new Date(tiempoActualMilisegundos);

    // // 3. Obtener el día, mes y año por separado
    // const dia = fechaActual.getDate();
    // const mes = fechaActual.getMonth() + 1; // Sumar 1 porque los meses empiezan en 0
    // const año = fechaActual.getFullYear();

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

        const emailRegex = /^\S+@\S+\.\S+$/; 

        // Lógica para campos Many-to-Many (Multi-Select)
        if ( (name === 'antecedentes_ids' || name === 'analisis_funcional_ids') && type === 'select-multiple') {
            newValue = Array.from(options)
                        .filter(option => option.selected)
                        .map(option => Number(option.value)); 
        } 

        // Lógica de validación para Fecha de Nacimiento
        if (name === 'fecha_nacimiento') {
            const today = new Date();
            // Quitar la hora para la comparación (comparar solo la fecha)
            today.setHours(0, 0, 0, 0); 
            
            const selectedDate = new Date(value);
            
            if (selectedDate >= today) {
                setFechaNacimientoError('La fecha de nacimiento no puede ser futura.');
            } else {
                setFechaNacimientoError('');
            }
        }

        // Lógica de validación de Email
        if (name === 'email') {
            // Si hay un valor y no pasa la validación regex
            if (value && !emailRegex.test(value)) {
                setEmailError('El formato del email no es válido (ej: usuario@dominio.com).');
            } else {
                setEmailError('');
            }
        }
        
        // Lógica para campo Foreign Key (Género)
        else if (name === 'genero_id') {
            newValue = value ? Number(value) : ''; 
        }

        // 💡 Lógica de filtrado para Teléfono
        if (name === 'telefono') {
            // 1. Filtrado: Permite solo números, espacios, +, -, ( y ).
            newValue = value.replace(/[^0-9\s\+\-\(\)]/g, ''); 
            
            // 2. Validación en tiempo real (contando solo dígitos)
            const digitCount = newValue.replace(/[^0-9]/g, '').length;
            
            if (digitCount > 0 && digitCount < MIN_PHONE_LENGTH) {
                setTelefonoError(`El teléfono debe tener un mínimo de ${MIN_PHONE_LENGTH} dígitos.`);
            } else {
                setTelefonoError('');
            }
        }

        // Manejo estándar para el resto de los campos
        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
        
    //     // Validar Errores antes de enviar
    //     let hasError = false;

    //     // 1. Validación de DNI
    //     const dniLength = formData.dni.length;
    //     if (dniLength !== 7 && dniLength !== 8) {
    //         setDniError('ERROR: El DNI debe tener 7 u 8 dígitos para continuar.');
    //         hasError = true;
    //     } else {
    //         setDniError('');
    //     }

    //     // 2. Validación de Fecha de Nacimiento (comprobar si hay error en el estado)
    //     if (fechaNacimientoError) {
    //          // Si el error ya está seteado por handleChange, solo prevenimos el envío.
    //          hasError = true;
    //     } else if (!formData.fecha_nacimiento) {
    //          setFechaNacimientoError('La fecha de nacimiento es obligatoria.');
    //          hasError = true;
    //     }

    //     // 4. Validación de Email
    //     const emailRegex = /^\S+@\S+\.\S+$/;
    //     if (formData.email) {
    //         if (!emailRegex.test(formData.email)) {
    //             setEmailError('ERROR: Por favor, ingrese un formato de email válido.');
    //             hasError = true;
    //         } else {
    //             setEmailError('');
    //         }
    //     }


    //     if (hasError) {
    //         return; // Detiene el envío del formulario si hay errores
    //     }
        
    //     // Si no hay errores, enviar
    //     onSubmit(formData);
    // };

    const handleSubmit = async (e) => { // Hacemos la función ASÍNCRONA
        e.preventDefault();
        
        if (dniCheckLoading) return; // Evitar envíos múltiples mientras verifica DNI
        
        let hasError = false;
        let currentDniError = ''; 
        let currentTelefonoError = '';
        let currentFechaError = '';
        let currentEmailError = '';
        let currentNombreError = '';
        let currentApellidoError = '';
        let currentGeneroError = '';

        // --- 1. VALIDACIONES DE CAMPOS OBLIGATORIOS Y SÍNCRONAS ---
        
        // Nombre
        if (!formData.nombre.trim()) {
            currentNombreError = 'El nombre es obligatorio.';
            hasError = true;
        }
        setNombreError(currentNombreError);

        // Apellido
        if (!formData.apellido.trim()) {
            currentApellidoError = 'El apellido es obligatorio.';
            hasError = true;
        }
        setApellidoError(currentApellidoError);
        
        // DNI (Requiere valor Y longitud correcta)
        const dniLength = formData.dni.length;
        if (dniLength === 0) {
            currentDniError = 'El DNI es obligatorio.';
            hasError = true;
        } else if (dniLength !== 7 && dniLength !== 8) {
            currentDniError = 'El DNI debe tener 7 u 8 dígitos para continuar.';
            hasError = true;
        } 
        
        // Teléfono (Ahora obligatorio)
        const phoneDigits = formData.telefono.replace(/[^0-9]/g, '').length;
        if (formData.telefono.length === 0) {
             currentTelefonoError = 'El teléfono es obligatorio.';
             hasError = true;
        } else if (phoneDigits < MIN_PHONE_LENGTH) {
            currentTelefonoError = `ERROR: El teléfono debe tener un mínimo de ${MIN_PHONE_LENGTH} dígitos.`;
            hasError = true;
        } 
        setTelefonoError(currentTelefonoError);


        // Género ID (Ahora obligatorio)
        if (!formData.genero_id) {
            currentGeneroError = 'El género es obligatorio.';
            hasError = true;
        } 
        setGeneroIdError(currentGeneroError);


        // Fecha de Nacimiento (comprobar si hay error en el estado O si está vacío)
        if (fechaNacimientoError) {
             hasError = true; // Ya tiene un error de fecha futura
             currentFechaError = fechaNacimientoError; // Mantener el error
        } else if (!formData.fecha_nacimiento) {
             currentFechaError = 'La fecha de nacimiento es obligatoria.';
             hasError = true;
        }
        setFechaNacimientoError(currentFechaError);

        // Validación de Email (Solo si tiene valor, debe ser válido)
        if (formData.email && !EMAIL_REGEX.test(formData.email)) {
            currentEmailError = 'ERROR: Por favor, ingrese un formato de email válido.';
            hasError = true;
        }
        setEmailError(currentEmailError);

        // Si hay errores síncronos, detenemos aquí
        if (hasError) {
            setDniError(currentDniError); // Asegurar que el error de DNI se muestre si es síncrono
            return;
        }
        
        // --- 2. VALIDACIÓN ASÍNCRONA DE UNICIDAD DEL DNI ---
        const originalDni = initialData ? initialData.dni : null;
        const isDniChanged = formData.dni !== originalDni;
        
        // Solo verificamos unicidad si:
        // a) Estamos creando un nuevo paciente (no isEditing)
        // b) Estamos editando Y el DNI ha sido modificado
        if ((!isEditing || isDniChanged) && checkDniUniqueness) {
            setDniCheckLoading(true);
            try {
                // await la verificación asíncrona
                const exists = await checkDniUniqueness(formData.dni); 
                if (exists) {
                    currentDniError = 'Ya existe un paciente registrado con este DNI.';
                    hasError = true;
                }
            } catch (error) {
                console.error("Error al verificar la unicidad del DNI:", error);
                currentDniError = 'Error al verificar la unicidad del DNI. Intente de nuevo.';
                hasError = true;
            } finally {
                setDniCheckLoading(false);
            }
        }
        
        // Actualizamos el error de DNI después de la validación asíncrona
        setDniError(currentDniError);

        // Si hay error (síncrono o asíncrono)
        if (hasError || currentDniError) {
            return;
        }
        
        // Si no hay errores, enviar
        onSubmit(formData);
    };

    // ==========================================================
    // FUNCIÓN PARA FILTRAR NOMBRE/APELLIDO (Letras y espacios) 
    // ==========================================================

    const handleNameChange = (e, fieldName) => {
        const text = e.target.value;
        // Expresión Regular que ELIMINA todo lo que NO sea (^) letras, acentos o espacios.
        const filteredText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); 
        
        setFormData(prevData => ({
            ...prevData,
            [fieldName]: filteredText
        }));
    };


    // ==========================================================
    // FUNCIÓN PARA FILTRAR DNI 
    // ==========================================================

    const handleDniChange = (e) => {
        const text = e.target.value;
        // Elimina cualquier cosa que no sea un dígito (0-9)
        const filteredText = text.replace(/\D/g, ''); 
        
        // Limita la entrada a un máximo de 8 dígitos para evitar DNI demasiado largos
        const maxLengthText = filteredText.slice(0, 8);
        
        setFormData(prevData => ({
            ...prevData,
            dni: maxLengthText
        }));

        // Validar longitud en tiempo real (feedback inmediato)
        if (maxLengthText.length > 0 && maxLengthText.length !== 7 && maxLengthText.length !== 8) {
            setDniError('El DNI debe tener 7 u 8 dígitos.');
        } else {
            setDniError('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles['pacientes-form']}> 
            
            
            {isEditing? <h3>Editar Paciente</h3> : <h3>Registrar nuevo paciente</h3>}
            
            {/* ======================= DATOS BÁSICOS ======================= */}
            <label>Nombre</label>
            <input 
            name="nombre" 
            value={formData.nombre} 
            onChange={(e) => handleNameChange(e, 'nombre')}
            // onChange={handleChange} 
            placeholder="Nombre" 
            required 
            />
            
            <label>Apellido</label>
            <input 
                name="apellido" 
                value={formData.apellido} 
                // onChange={handleChange} 
                onChange={(e) => handleNameChange(e, 'apellido')}
                placeholder="Apellido"
                required 
            />
            
            <label>DNI</label>
            <input 
                name="dni" 
                value={formData.dni} 
                onChange={handleDniChange} 
                placeholder="DNI" 
                required 
            />
            {dniError && <p className={styles['error-message']}>{dniError}</p>}
            
            <label>Fecha de Nacimiento</label>
            <input 
            type="date" 
            name="fecha_nacimiento" 
            value={formData.fecha_nacimiento} 
            onChange={handleChange} 
            required 
            />
            {fechaNacimientoError && <p className={styles['error-message']}>{fechaNacimientoError}</p>}
            
            <label>Domicilio</label>
            <input name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Domicilio" />
            
            <label>Teléfono</label>
            <input name="telefono" 
            value={formData.telefono} 
            onChange={handleChange} 
            placeholder="Teléfono" 
            required
            />
            {telefonoError && <p className={styles['error-message']}>{telefonoError}</p>}
            
            <label>Email</label>
            <input type="email" 
            name="email" value={formData.email} 
            onChange={handleChange} 
            placeholder="Correo Electrónico" 
            />
            {emailError && <p className={styles['error-message']}>{emailError}</p>}
            
            <hr /> 
            
            {/* ======================= RELACIONES FK/M2M ======================= */}
            <h4>Relaciones y Antecedentes</h4>

            {/* CAMPO GÉNERO (FOREIGN KEY) */}
            <label>Género</label>
            <select
                name="genero_id" 
                value={formData.genero_id} 
                onChange={handleChange}
                required
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