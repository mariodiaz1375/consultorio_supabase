import { useState, useEffect } from 'react';
import styles from './PacientesForm.module.css';
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
import { useAlert } from '../../hooks/useAlert';
import { 
    createObraSocial, updateObraSocial, deleteObraSocial,
    createAntecedente, updateAntecedente, deleteAntecedente,
    createAnalisisFuncional, updateAnalisisFuncional, deleteAnalisisFuncional,
    // ... otros métodos
} from '../../api/pacientes.api.js';

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

export default function PacientesForm({ 
    onSubmit, 
    generos = [], 
    antecedentes = [], 
    analisisFuncional = [],
    obrasSociales = [], // Lista de Obras Sociales disponibles
    initialData = null,
    isEditing = false,
    checkDniUniqueness,
    userRole = 'User',
    onMasterListChange,
    onFormChange,
}) {
    const { showSuccess, showError } = useAlert();

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


    
    /**
     * Función genérica para manipular cualquier lista maestra (Agregar, Editar, Eliminar).
     * @param {string} listType - Tipo de lista ('os', 'antecedentes', 'analisisFuncional').
     * @param {string} action - Acción a realizar ('add', 'edit', 'delete').
     * @param {number | null} id - ID del elemento (solo para 'edit' y 'delete').
     * @param {string | null} newName - Nuevo nombre (solo para 'add' y 'edit').
     */

    const manipulateList = async (listType, action, id, newName) => {
        let nameField = '';
        let createApi, updateApi, deleteApi;
        let dataKey = {};
        
        // 1. Configuración de API y campos según el tipo de lista
        if (listType === 'os') {
            nameField = 'nombre_os';
            createApi = createObraSocial;
            updateApi = updateObraSocial;
            deleteApi = deleteObraSocial;
            dataKey = { nombre_os: newName };
        } else if (listType === 'antecedentes') {
            nameField = 'nombre_ant';
            createApi = createAntecedente;
            updateApi = updateAntecedente;
            deleteApi = deleteAntecedente;
            dataKey = { nombre_ant: newName };
        } else if (listType === 'analisisFuncional') {
            nameField = 'nombre_analisis';
            createApi = createAnalisisFuncional;
            updateApi = updateAnalisisFuncional;
            deleteApi = deleteAnalisisFuncional;
            dataKey = { nombre_analisis: newName };
        } else {
            return; 
        }

        try {
            // --- ADD (CREATE) ---
            if (action === 'add') {
                const newItem = await createApi(dataKey); // Llamada a la API
                // 🚨 ¡IMPORTANTE! Ya no modificamos el estado local de la lista.
                showSuccess(`Elemento "${newItem[nameField]}" creado con éxito.`);
            }
            
            // --- EDIT (UPDATE) ---
            else if (action === 'edit') {
                const updatedItem = await updateApi(id, dataKey); // Llamada a la API
                // 🚨 ¡IMPORTANTE! Ya no modificamos el estado local de la lista.
                showSuccess(`Elemento editado a "${updatedItem[nameField]}".`);
            }

            // --- DELETE ---
            else if (action === 'delete') {
                // ... (lógica de confirmación) ...
                await deleteApi(id); // Llamada a la API
                // 🚨 ¡IMPORTANTE! Ya no modificamos el estado local de la lista.
                
                // ... (Lógica de desmarcación de paciente) ...
                
                showSuccess("Elemento eliminado con éxito.");
            }
            
            // 🚨 NOTIFICAR AL PADRE DESPUÉS DE UN CRUD EXITOSO
            if (onMasterListChange) {
                onMasterListChange();
            }
        } catch (error) {
            console.error(`Error al ejecutar acción ${action} en ${listType}:`, error);
            // Mostrar un mensaje de error al usuario
            const errorMessage = error.response?.data?.detail || error.message || 
                                `No se pudo completar la operación (${action}).`;

            if (error.response && error.response.status === 400 && errorMessage.includes("No se puede eliminar")) {
                // Mensaje específico para la protección de la base de datos
                showError(`PROTECCIÓN DE DATOS: ${errorMessage}`);
            } else {
                // Mensaje genérico para otros errores (ej: 404, 500)
                showError(`Error: ${errorMessage}. Revise la consola.`);
            }
        }
    };
    
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

    useEffect(() => {
        // Solo aplica si estamos editando un paciente
        if (initialData) {
            // Re-aplicamos getInitialState para que filtre las OS borradas
            const updatedFormData = getInitialState(initialData);

            // 💡 Lógica de Sincronización Clave: 
            // 1. Filtra las afiliaciones de OS para eliminar las que ya no existen
            //    en la lista maestra 'obrasSociales'.
            const osIdsExistentes = new Set(obrasSociales.map(os => os.id));
            
            updatedFormData.os_pacientes_data = updatedFormData.os_pacientes_data.filter(osItem => 
                osIdsExistentes.has(osItem.os_id)
            );

            // 2. Filtra IDs de Antecedentes/Análisis si es necesario (opcional, pero buena práctica)
            const antIdsExistentes = new Set(antecedentes.map(ant => ant.id));
            updatedFormData.antecedentes_ids = updatedFormData.antecedentes_ids.filter(id => antIdsExistentes.has(id));

            const afIdsExistentes = new Set(analisisFuncional.map(af => af.id));
            updatedFormData.analisis_funcional_ids = updatedFormData.analisis_funcional_ids.filter(id => afIdsExistentes.has(id));
            
            // 3. Actualiza el estado del formulario con los datos filtrados
            setFormData(updatedFormData);
        }
    // 💡 DEPENDENCIAS: Se ejecuta cada vez que las listas maestras cambian.
    // Esto sucede cuando PacientesList llama a loadMasterOptions.
    }, [obrasSociales, antecedentes, analisisFuncional, initialData]);

    // Detectar cambios en el formulario
useEffect(() => {
    const hasData = 
        formData.nombre.trim() !== '' ||
        formData.apellido.trim() !== '' ||
        formData.dni.trim() !== '' ||
        formData.telefono.trim() !== '' ||
        formData.domicilio.trim() !== '' ||
        formData.email.trim() !== '' ||
        formData.fecha_nacimiento !== '' ||
        formData.genero_id !== '' ||
        formData.antecedentes_ids.length > 0 ||
        formData.analisis_funcional_ids.length > 0 ||
        formData.os_pacientes_data.length > 0;

    if (hasData && onFormChange) {
        onFormChange();
    }
}, [formData, onFormChange]);


    return (
        <form onSubmit={handleSubmit} className={styles['pacientes-form']}> 
            
            {/* ... (Datos básicos) ... */}
            {isEditing? <h3>Editar Paciente</h3> : <h3>Registrar nuevo paciente</h3>}
            
            {/* ======================================================== */}
            {/* NUEVO GRUPO DE CAMPOS 2x2 (nombre, apellido, dni, telefono) */}
            {/* ======================================================== */}
    <div className={styles['form-field-group']}>
        <label>Nombre</label>
        <label>Apellido</label>
        <input 
        name="nombre" 
        value={formData.nombre} 
        onChange={(e) => handleNameChange(e, 'nombre')}
        placeholder="Nombre" 
        required 
        />
        <input 
        name="apellido" 
        value={formData.apellido} 
        onChange={(e) => handleNameChange(e, 'apellido')}
        placeholder="Apellido"
        required 
        />
    
        {/* 🆕 SIEMPRE renderizar el contenedor, aunque esté vacío */}
        <p className={styles['error-message']}>
        {nombreError || ''}
        </p>
        <p className={styles['error-message']}>
        {apellidoError || ''}
        </p>
    
        <label>DNI</label>
        <label>Teléfono</label>
        <input 
        name="dni" 
        value={formData.dni} 
        onChange={handleDniChange} 
        placeholder="DNI" 
        required 
        />
        <input 
        name="telefono" 
        value={formData.telefono} 
        onChange={handleChange} 
        placeholder="Teléfono" 
        required
        />

        {/* 🆕 SIEMPRE renderizar el contenedor, aunque esté vacío */}
        <p className={styles['error-message']}>
        {dniError || ''}
        </p>
        <p className={styles['error-message']}>
        {telefonoError || ''}
        </p>
    </div>
            
            {/* ======================================================== */}
            {/* CAMPOS INDIVIDUALES DE ANCHO COMPLETO O 2 COLUMNAS POR FILA (fecha, genero, domicilio, email) */}
            {/* ======================================================== */}
            
            <label>Fecha de Nacimiento</label>
            <input 
                type="date" 
                name="fecha_nacimiento" 
                value={formData.fecha_nacimiento} 
                onChange={handleChange} 
                required 
            />
            {fechaNacimientoError && <p className={styles['error-message']}>{fechaNacimientoError}</p>}
            
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
            {generoIdError && <p className={styles['error-message']}>{generoIdError}</p>}
            

            <label>Domicilio</label>
            <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Domicilio" />
            
            <label>Email</label>
            <input type="email" 
                name="email" value={formData.email} 
                onChange={handleChange} 
                placeholder="Correo Electrónico" 
            />
            {emailError && <p className={styles['error-message']}>{emailError}</p>}
            
            <hr /> 
            
            <h4>Antecedentes</h4>
            
            {(userRole === 'Admin' || userRole === 'Odontólogo/a') && (
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

                {antecedentes.map(ant => (
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
            )}

            {(userRole === 'Admin' || userRole === 'Odontólogo/a') && (
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

                {analisisFuncional.map(af => (
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
            )}
            
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
                            required
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
            {/* RENDERIZADO DE LOS MODALES (AHORA CON LISTMANAGER) */}
            {/* ======================================================== */}

            {/* Modal para Obra Social */}
            <ModalAdd
                isOpen={isOsModalOpen}
                onClose={() => setIsOsModalOpen(false)}
                title="Administrar Obras Sociales"
            >
                <ListManagerContent 
                    list={obrasSociales}
                    nameField="nombre_os"
                    onAdd={(name) => manipulateList('os', 'add', null, name)}
                    onEdit={(id, name) => manipulateList('os', 'edit', id, name)}
                    onDelete={(id) => manipulateList('os', 'delete', id)}
                    placeHolder={'Ingrese el nombre'}
                />
            </ModalAdd>

            {/* Modal para Antecedentes */}
            <ModalAdd
                isOpen={isAntecedenteModalOpen}
                onClose={() => setIsAntecedenteModalOpen(false)}
                title="Administrar Antecedentes"
            >
                <ListManagerContent 
                    list={antecedentes}
                    nameField="nombre_ant"
                    onAdd={(name) => manipulateList('antecedentes', 'add', null, name)}
                    onEdit={(id, name) => manipulateList('antecedentes', 'edit', id, name)}
                    onDelete={(id) => manipulateList('antecedentes', 'delete', id)}
                    placeHolder={'Ingrese el nombre'}
                />
            </ModalAdd>
            
            {/* Modal para Análisis Funcional */}
            <ModalAdd
                isOpen={isAnalisisFuncionalModalOpen}
                onClose={() => setIsAnalisisFuncionalModalOpen(false)}
                title="Administrar Análisis Funcional"
            >
                <ListManagerContent 
                    list={analisisFuncional}
                    nameField="nombre_analisis"
                    onAdd={(name) => manipulateList('analisisFuncional', 'add', null, name)}
                    onEdit={(id, name) => manipulateList('analisisFuncional', 'edit', id, name)}
                    onDelete={(id) => manipulateList('analisisFuncional', 'delete', id)}
                    placeHolder={'Ingrese el nombre'}
                />
            </ModalAdd>

        </form>
    );
}