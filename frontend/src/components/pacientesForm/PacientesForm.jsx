// PacientesForm.jsx (VERSION FINAL CORREGIDA)

import React, { useState, useEffect } from 'react';
import styles from './PacientesForm.module.css';
import ModalAdd from '../modalAdd/ModalAdd';

// ... (initialFormData, MIN_PHONE_LENGTH, EMAIL_REGEX y componentes auxiliares) ...
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

// =================================================================
// 🚨 COMPONENTES AUXILIARES DE FORMULARIO PARA LOS MODALES 🚨
// =================================================================

// Formulario para agregar una nueva Obra Social
const AddOsForm = ({ onSave, onCancel }) => {
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError("El nombre de la Obra Social es obligatorio.");
            return;
        }
        // SIMULACIÓN de la creación y obtención del nuevo objeto
        const newOs = { id: Date.now(), nombre_os: nombre.trim() };
        onSave(newOs); 
        setNombre('');
        setError('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <label htmlFor="os-nombre">Nombre de la Obra Social</label>
            <input
                id="os-nombre"
                type="text"
                value={nombre}
                onChange={(e) => {setNombre(e.target.value); setError('');}}
                placeholder="Ej: OSDE, Swiss Medical..."
                required
            />
            {error && <p className={styles['error-message']}>{error}</p>}
            <button type="submit">Guardar Obra Social</button>
            <button 
                type="button" 
                onClick={onCancel} 
                className={styles['modal-cancel-btn']}
                style={{marginTop: '10px'}}
            >
                Cancelar
            </button>
        </form>
    );
};

// Formulario para agregar un nuevo Antecedente
const AddAntecedenteForm = ({ onSave, onCancel }) => {
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError("El nombre del Antecedente es obligatorio.");
            return;
        }
        // SIMULACIÓN
        const newAnt = { id: Date.now(), nombre_ant: nombre.trim() };
        onSave(newAnt);
        setNombre('');
        setError('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <label htmlFor="ant-nombre">Descripción del Antecedente</label>
            <input
                id="ant-nombre"
                type="text"
                value={nombre}
                onChange={(e) => {setNombre(e.target.value); setError('');}}
                placeholder="Ej: Separación de padres, Acoso escolar, etc."
                required
            />
            {error && <p className={styles['error-message']}>{error}</p>}
            <button type="submit">Guardar Antecedente</button>
            <button 
                type="button" 
                onClick={onCancel} 
                className={styles['modal-cancel-btn']}
                style={{marginTop: '10px'}}
            >
                Cancelar
            </button>
        </form>
    );
};

// Formulario para agregar un nuevo Análisis Funcional
const AddAnalisisFuncionalForm = ({ onSave, onCancel }) => {
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            setError("El nombre del Análisis es obligatorio.");
            return;
        }
        // SIMULACIÓN
        const newAF = { id: Date.now(), nombre_analisis: nombre.trim() };
        onSave(newAF);
        setNombre('');
        setError('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.modalForm}>
            <label htmlFor="af-nombre">Descripción del Análisis Funcional</label>
            <input
                id="af-nombre"
                type="text"
                value={nombre}
                onChange={(e) => {setNombre(e.target.value); setError('');}}
                placeholder="Ej: Obtención de atención, Evitar demanda, etc."
                required
            />
            {error && <p className={styles['error-message']}>{error}</p>}
            <button type="submit">Guardar Análisis Funcional</button>
            <button 
                type="button" 
                onClick={onCancel} 
                className={styles['modal-cancel-btn']}
                style={{marginTop: '10px'}}
            >
                Cancelar
            </button>
        </form>
    );
};
// =================================================================


export default function PacientesForm({ 
    onSubmit, 
    generos = [], 
    antecedentes = [], 
    analisisFuncional = [],
    obrasSociales = [], // Lista de Obras Sociales disponibles
    initialData = null,
    isEditing = false,
    checkDniUniqueness,
    userRole = 'User'
}) {

    const getInitialState = (data) => {
        if (!data) return initialFormData;
        // ... (Lógica de getInitialState) ...
        return {
            ...data,
            genero_id: data.genero ? data.genero.id : (data.genero_info ? data.genero_info.id : ''),
            antecedentes_ids: data.antecedentes_info ? data.antecedentes_info.map(a => a.id) : [],
            analisis_funcional_ids: data.analisis_funcional_info ? data.analisis_funcional_info.map(a => a.id) : [],
            os_pacientes_data: data.os_pacientes_info ? data.os_pacientes_info.map(item => ({
                os_id: item.os_info.id,
                num_afiliado: item.num_afiliado,
            })) : [],
            fecha_nacimiento: data.fecha_nacimiento.substring(0, 10), 
        };
    };


    const [formData, setFormData] = useState(getInitialState(initialData));
    const [dniError, setDniError] = useState(''); 
    const [fechaNacimientoError, setFechaNacimientoError] = useState('');
    const [telefonoError, setTelefonoError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [dniCheckLoading, setDniCheckLoading] = useState(false); 
    const [nombreError, setNombreError] = useState('');
    const [apellidoError, setApellidoError] = useState('');
    const [generoIdError, setGeneroIdError] = useState('');
    
    // ESTADOS PARA CONTROLAR LOS MODALES
    const [isOsModalOpen, setIsOsModalOpen] = useState(false);
    const [isAntecedenteModalOpen, setIsAntecedenteModalOpen] = useState(false);
    const [isAnalisisFuncionalModalOpen, setIsAnalisisFuncionalModalOpen] = useState(false);

    // ESTADOS PARA LAS LISTAS DE OPCIONES (Para poder actualizar el DOM)
    const [currentAntecedentes, setCurrentAntecedentes] = useState(antecedentes);
    const [currentAnalisisFuncional, setCurrentAnalisisFuncional] = useState(analisisFuncional);
    const [currentObrasSociales, setCurrentObrasSociales] = useState(obrasSociales);

    // Sincronizar las listas si las props cambian
    useEffect(() => {
        setCurrentAntecedentes(antecedentes);
    }, [antecedentes]);

    useEffect(() => {
        setCurrentAnalisisFuncional(analisisFuncional);
    }, [analisisFuncional]);

    useEffect(() => {
        setCurrentObrasSociales(obrasSociales);
    }, [obrasSociales]);

    useEffect(() => {
        setFormData(getInitialState(initialData));
    }, [initialData]);

    // ==========================================================
    // FUNCIONES HANDLESAVE PARA LOS NUEVOS ITEMS
    // ==========================================================
    
    // Función para guardar una nueva Obra Social y actualizar la lista (Modal)
    const handleSaveNewOs = (newOs) => {
        // Asume que la nueva OS ya fue creada en el backend y recibimos el objeto completo
        setCurrentObrasSociales(prev => [...prev, newOs]);
        setIsOsModalOpen(false);
    };

    // Función para guardar un nuevo Antecedente y actualizar la lista
    const handleSaveNewAntecedente = (newAnt) => {
        setCurrentAntecedentes(prev => [...prev, newAnt]);
        setIsAntecedenteModalOpen(false);
        // Opcional: Marcar el nuevo antecedente automáticamente
        setFormData(prevData => ({
            ...prevData,
            antecedentes_ids: [...prevData.antecedentes_ids, newAnt.id]
        }));
    };

    // Función para guardar un nuevo Análisis Funcional y actualizar la lista
    const handleSaveNewAnalisisFuncional = (newAF) => {
        setCurrentAnalisisFuncional(prev => [...prev, newAF]);
        setIsAnalisisFuncionalModalOpen(false);
        // Opcional: Marcar el nuevo análisis automáticamente
        setFormData(prevData => ({
            ...prevData,
            analisis_funcional_ids: [...prevData.analisis_funcional_ids, newAF.id]
        }));
    };

    // ... (handleOsChange, handleAddOs, handleRemoveOs, handleCheckboxChange, handleChange, handleSubmit, handleNameChange, handleDniChange) ...
    
    const handleOsChange = (index, e) => {
        const { name, value } = e.target;
        const newOsData = [...formData.os_pacientes_data];
        
        if (name === 'os_id') {
            newOsData[index][name] = value ? Number(value) : '';
        } else {
            newOsData[index][name] = value;
        }

        setFormData(prevData => ({
            ...prevData,
            os_pacientes_data: newOsData,
        }));
    };

    // FUNCIÓN PARA AÑADIR UN NUEVO CAMPO DE OS AL PACIENTE
    const handleAddOs = () => {
        setFormData(prevData => ({
            ...prevData,
            os_pacientes_data: [
                ...prevData.os_pacientes_data,
                { os_id: '', num_afiliado: '' }
            ]
        }));
    };

    const handleRemoveOs = (index) => {
        const newOsData = formData.os_pacientes_data.filter((_, i) => i !== index);
        setFormData(prevData => ({
            ...prevData,
            os_pacientes_data: newOsData,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, value, checked } = e.target;
        const id = Number(value); 
        
        setFormData(prevData => {
            let newArray = [...prevData[name]]; 

            if (checked) {
                if (!newArray.includes(id)) {
                    newArray.push(id);
                }
            } else {
                newArray = newArray.filter(item => item !== id);
            }

            return {
                ...prevData,
                [name]: newArray
            };
        });
    };
    
    const handleChange = (e) => {
        const { name, value, type, options } = e.target;
        
        let newValue = value;

        const emailRegex = /^\S+@\S+\.\S+$/; 

        if ( (name === 'antecedentes_ids' || name === 'analisis_funcional_ids') && type === 'select-multiple') {
             newValue = Array.from(options)
                         .filter(option => option.selected)
                         .map(option => Number(option.value)); 
        } 

        if (name === 'fecha_nacimiento') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            
            const selectedDate = new Date(value);
            
            if (selectedDate >= today) {
                setFechaNacimientoError('La fecha de nacimiento no puede ser futura.');
            } else {
                setFechaNacimientoError('');
            }
        }

        if (name === 'email') {
            if (value && !emailRegex.test(value)) {
                setEmailError('El formato del email no es válido (ej: usuario@dominio.com).');
            } else {
                setEmailError('');
            }
        }
        
        else if (name === 'genero_id') {
            newValue = value ? Number(value) : ''; 
        }

        if (name === 'telefono') {
            newValue = value.replace(/[^0-9\s\+\-\(\)]/g, ''); 
            
            const digitCount = newValue.replace(/[^0-9]/g, '').length;
            
            if (digitCount > 0 && digitCount < MIN_PHONE_LENGTH) {
                setTelefonoError(`El teléfono debe tener un mínimo de ${MIN_PHONE_LENGTH} dígitos.`);
            } else {
                setTelefonoError('');
            }
        }

        setFormData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (dniCheckLoading) return;
        
        let hasError = false;
        let currentDniError = ''; 
        let currentTelefonoError = '';
        let currentFechaError = '';
        let currentEmailError = '';
        let currentNombreError = '';
        let currentApellidoError = '';
        let currentGeneroError = '';

        if (!formData.nombre.trim()) {
            currentNombreError = 'El nombre es obligatorio.';
            hasError = true;
        }
        setNombreError(currentNombreError);

        if (!formData.apellido.trim()) {
            currentApellidoError = 'El apellido es obligatorio.';
            hasError = true;
        }
        setApellidoError(currentApellidoError);
        
        const dniLength = formData.dni.length;
        if (dniLength === 0) {
            currentDniError = 'El DNI es obligatorio.';
            hasError = true;
        } else if (dniLength !== 7 && dniLength !== 8) {
            currentDniError = 'El DNI debe tener 7 u 8 dígitos para continuar.';
            hasError = true;
        } 
        
        const phoneDigits = formData.telefono.replace(/[^0-9]/g, '').length;
        if (formData.telefono.length === 0) {
             currentTelefonoError = 'El teléfono es obligatorio.';
             hasError = true;
        } else if (phoneDigits < MIN_PHONE_LENGTH) {
            currentTelefonoError = `ERROR: El teléfono debe tener un mínimo de ${MIN_PHONE_LENGTH} dígitos.`;
            hasError = true;
        } 
        setTelefonoError(currentTelefonoError);

        if (!formData.genero_id) {
            currentGeneroError = 'El género es obligatorio.';
            hasError = true;
        } 
        setGeneroIdError(currentGeneroError);

        if (fechaNacimientoError) {
             hasError = true;
             currentFechaError = fechaNacimientoError;
        } else if (!formData.fecha_nacimiento) {
             currentFechaError = 'La fecha de nacimiento es obligatoria.';
             hasError = true;
        }
        setFechaNacimientoError(currentFechaError);

        if (formData.email && !EMAIL_REGEX.test(formData.email)) {
            currentEmailError = 'ERROR: Por favor, ingrese un formato de email válido.';
            hasError = true;
        }
        setEmailError(currentEmailError);

        if (hasError) {
            setDniError(currentDniError); 
            return;
        }
        
        const originalDni = initialData ? initialData.dni : null;
        const isDniChanged = formData.dni !== originalDni;
        
        if ((!isEditing || isDniChanged) && checkDniUniqueness) {
            setDniCheckLoading(true);
            try {
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
        
        setDniError(currentDniError);

        if (hasError || currentDniError) {
            return;
        }
        
        onSubmit(formData);
    };

    const handleNameChange = (e, fieldName) => {
        const text = e.target.value;
        const filteredText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''); 
        
        setFormData(prevData => ({
            ...prevData,
            [fieldName]: filteredText
        }));
    };

    const handleDniChange = (e) => {
        const text = e.target.value;
        const filteredText = text.replace(/\D/g, ''); 
        const maxLengthText = filteredText.slice(0, 8);
        
        setFormData(prevData => ({
            ...prevData,
            dni: maxLengthText
        }));

        if (maxLengthText.length > 0 && maxLengthText.length !== 7 && maxLengthText.length !== 8) {
            setDniError('El DNI debe tener 7 u 8 dígitos.');
        } else {
            setDniError('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles['pacientes-form']}> 
            
            {/* ... (Datos básicos) ... */}
            {isEditing? <h3>Editar Paciente</h3> : <h3>Registrar nuevo paciente</h3>}
            
            <label>Nombre</label>
            <input 
            name="nombre" 
            value={formData.nombre} 
            onChange={(e) => handleNameChange(e, 'nombre')}
            placeholder="Nombre" 
            required 
            />
            
            <label>Apellido</label>
            <input 
                name="apellido" 
                value={formData.apellido} 
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
            
            <h4>Relaciones y Antecedentes</h4>

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
            
            {/* ======================================================== */}
            {/* CAMPO ANTECEDENTES (CHECKBOXES) + BOTÓN AGREGAR NUEVO */}
            {/* ======================================================== */}
            <div className={styles['checkbox-group']}>
                <div className={styles['checkbox-group-header']}> 
                    <label className={styles['checkbox-group-label']}>Antecedentes</label>
                    {userRole === 'Admin' && (
                        <button 
                            type="button" 
                            onClick={() => setIsAntecedenteModalOpen(true)}
                            className={styles['add-new-btn']}
                        >
                            +
                        </button>
                    )}
                </div>

                {currentAntecedentes.map(ant => (
                    <div key={ant.id} className={styles['checkbox-item']}>
                        <input
                            type="checkbox"
                            name="antecedentes_ids"
                            value={ant.id}
                            id={`antecedente-${ant.id}`}
                            onChange={handleCheckboxChange}
                            checked={formData.antecedentes_ids.includes(ant.id)} 
                        />
                        <label htmlFor={`antecedente-${ant.id}`}>{ant.nombre_ant}</label>
                    </div>
                ))}
            </div>
            
            {/* ======================================================== */}
            {/* CAMPO ANÁLISIS FUNCIONAL (CHECKBOXES) + BOTÓN AGREGAR NUEVO */}
            {/* ======================================================== */}
            <div className={styles['checkbox-group']}>
                <div className={styles['checkbox-group-header']}> 
                    <label className={styles['checkbox-group-label']}>Análisis Funcional</label>
                    {userRole === 'Admin' && (
                        <button 
                            type="button" 
                            onClick={() => setIsAnalisisFuncionalModalOpen(true)}
                            className={styles['add-new-btn']}
                        >
                            +
                        </button>
                    )}
                </div>

                {currentAnalisisFuncional.map(af => (
                    <div key={af.id} className={styles['checkbox-item']}>
                        <input
                            type="checkbox"
                            name="analisis_funcional_ids"
                            value={af.id}
                            id={`analisis-${af.id}`}
                            onChange={handleCheckboxChange}
                            checked={formData.analisis_funcional_ids.includes(af.id)} 
                        />
                        <label htmlFor={`analisis-${af.id}`}>{af.nombre_analisis}</label>
                    </div>
                ))}
            </div>
            
            <hr /> 

            {/* ======================================================== */}
            {/* OBRAS SOCIALES (CAMPOS DINÁMICOS) + BOTONES REVERTIDOS */}
            {/* ======================================================== */}
            
            {/* H4 con el botón + para añadir a la lista maestra (Función menos frecuente, como Antecedentes/Análisis) */}
            <h4 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                Obras Sociales y Afiliación
                {/* BOTÓN PARA ABRIR EL MODAL Y CREAR UNA NUEVA OS EN LA LISTA MAESTRA */}
                {userRole === 'Admin' && (
                    <button 
                        type="button" 
                        onClick={() => setIsOsModalOpen(true)} 
                        className={styles['add-new-btn']} 
                    >
                        +
                    </button>
                )}
            </h4>

            {/* BOTÓN PARA AÑADIR UNA NUEVA OBRA SOCIAL AL PACIENTE (Función más frecuente) */}
            <button 
                type="button" 
                onClick={handleAddOs} // <-- AÑADIR CAMPO AL PACIENTE
                className={styles['add-new-btn-inline']} 
                style={{marginBottom: '20px', width: '100%', marginLeft: '0'}} // Ajuste de estilo
            >
                + Asignar Obra Social al Paciente
            </button>


            {/* LISTADO DE OS DEL PACIENTE */}
            {formData.os_pacientes_data.length === 0 ? (
                <p style={{marginTop: '10px', color: '#777'}}>Haga clic en 'Asignar Obra Social al Paciente' para agregar una.</p>
            ) : (
                formData.os_pacientes_data.map((osItem, index) => (
                    <div key={index} className={styles['os-group']}>
                        
                        <label>Obra Social #{index + 1}</label>
                        <select
                            name="os_id" 
                            value={osItem.os_id} 
                            onChange={(e) => handleOsChange(index, e)}
                        >
                            <option value="">Seleccione Obra Social</option>
                            {currentObrasSociales.map(os => (
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
                            required
                        />

                        <button 
                            type="button" 
                            onClick={() => handleRemoveOs(index)}
                            className={styles['remove-os-btn']}
                        >
                            Eliminar Obra Social
                        </button>
                        {index < formData.os_pacientes_data.length - 1 && <hr className={styles['os-separator']}/>}
                    </div>
                ))
            )}

            <button type="submit">{isEditing? 'Guardar cambios' : 'Registrar paciente'}</button>


            {/* ======================================================== */}
            {/* RENDERIZADO DE LOS MODALES */}
            {/* ======================================================== */}

            {/* Modal para Obra Social */}
            <ModalAdd
                isOpen={isOsModalOpen}
                onClose={() => setIsOsModalOpen(false)}
                title="Agregar Nueva Obra Social a la Lista"
            >
                <AddOsForm 
                    onSave={handleSaveNewOs} 
                    onCancel={() => setIsOsModalOpen(false)} 
                />
            </ModalAdd>

            {/* Modal para Antecedentes */}
            <ModalAdd
                isOpen={isAntecedenteModalOpen}
                onClose={() => setIsAntecedenteModalOpen(false)}
                title="Agregar Nuevo Antecedente"
            >
                <AddAntecedenteForm 
                    onSave={handleSaveNewAntecedente} 
                    onCancel={() => setIsAntecedenteModalOpen(false)} 
                />
            </ModalAdd>
            
            {/* Modal para Análisis Funcional */}
            <ModalAdd
                isOpen={isAnalisisFuncionalModalOpen}
                onClose={() => setIsAnalisisFuncionalModalOpen(false)}
                title="Agregar Nuevo Análisis Funcional"
            >
                <AddAnalisisFuncionalForm 
                    onSave={handleSaveNewAnalisisFuncional} 
                    onCancel={() => setIsAnalisisFuncionalModalOpen(false)} 
                />
            </ModalAdd>

        </form>
    );
}