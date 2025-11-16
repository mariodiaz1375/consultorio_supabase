import { useState, useEffect } from 'react';
import styles from './PersonalForm.module.css';

const initialFormData = {
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    domicilio: '',
    telefono: '',
    email: '',
    matricula: '',
    puesto_id: '',
    especialidades_ids: [],
    username: '', 
    password: '',
};

const MIN_PHONE_LENGTH = 7; 
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export default function PersonalForm({ 
    onSubmit, 
    puestos = [], 
    especialidades = [],
    initialData = null,
    isEditing = false,
    checkDniUniqueness,
}) {
    const getInitialState = (data) => {
        if (!data) return initialFormData;
        
        return {
            nombre: data.nombre || '',
            apellido: data.apellido || '',
            dni: data.dni || '',
            fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.substring(0, 10) : '',
            domicilio: data.domicilio || '',
            telefono: data.telefono || '',
            email: data.email || '',
            matricula: data.matricula || '',
            puesto_id: data.puesto_info ? data.puesto_info.id : '',
            especialidades_ids: data.especialidades_info ? data.especialidades_info.map(e => e.id) : [],
            // NO incluir username y password al editar
            username: '', 
            password: '',
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
    const [puestoIdError, setPuestoIdError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

        if (name === 'especialidades_ids' && type === 'select-multiple') {
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
            if (value && !EMAIL_REGEX.test(value)) {
                setEmailError('El formato del email no es válido (ej: usuario@dominio.com).');
            } else {
                setEmailError('');
            }
        }
        
        else if (name === 'puesto_id') {
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
        let currentPuestoError = '';
        let currentUsernameError = '';
        let currentPasswordError = '';

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

        if (!formData.puesto_id) {
            currentPuestoError = 'El puesto es obligatorio.';
            hasError = true;
        } 
        setPuestoIdError(currentPuestoError);

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

        // Solo validar username y password si NO estamos editando
        if (!isEditing) {
            if (!formData.username || !formData.username.trim()) {
                currentUsernameError = 'El nombre de usuario es obligatorio.';
                hasError = true;
            }
            setUsernameError(currentUsernameError);

            if (!formData.password || !formData.password.trim()) {
                currentPasswordError = 'La contraseña es obligatoria.';
                hasError = true;
            }
            setPasswordError(currentPasswordError);
        }

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
                    currentDniError = 'Ya existe un miembro registrado con este DNI.';
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

        // Preparar datos para enviar
        const dataToSubmit = { ...formData };
        
        // Si estamos editando, eliminar username y password (no se modificarán)
        if (isEditing) {
            delete dataToSubmit.username;
            delete dataToSubmit.password;
        }
        
        onSubmit(dataToSubmit);
    };

    const handleNameChange = (e, fieldName) => {
        const text = e.target.value;
        const filteredText = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ'\s]/g, ''); 
        
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
        if (initialData) {
            setFormData(getInitialState(initialData));
        }
    }, [initialData]);

    return (
        <form onSubmit={handleSubmit} className={styles['personal-form']}> 
            {isEditing ? <h3>Editar Miembro del Personal</h3> : <h3>Registrar Nuevo Miembro</h3>}
            
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
                
                {nombreError && <p className={styles['error-message']}>{nombreError}</p>}
                {apellidoError && <p className={styles['error-message']}>{apellidoError}</p>}
                
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

                {dniError && <p className={styles['error-message']}>{dniError}</p>}
                {telefonoError && <p className={styles['error-message']}>{telefonoError}</p>}
            </div>
            
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
            <input name="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Domicilio" required />
            
            <label>Email</label>
            <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Correo Electrónico" 
                required
            />
            {emailError && <p className={styles['error-message']}>{emailError}</p>}
            
            <label>Matrícula</label>
            <input name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Matrícula (opcional)" />
            
            <hr /> 
            
            <h4>Datos Profesionales</h4>
            
            <label>Puesto</label>
            <select 
                name="puesto_id"
                value={formData.puesto_id} 
                onChange={handleChange} 
                required
            >
                <option value="">Seleccione un Puesto</option>
                {puestos.map(puesto => (
                    <option key={puesto.id} value={puesto.id}>
                        {puesto.nombre_puesto}
                    </option>
                ))}
            </select>
            {puestoIdError && <p className={styles['error-message']}>{puestoIdError}</p>}
            
            <div className={styles['checkbox-group']}>
                <label className={styles['checkbox-group-label']}>Especialidades</label>
                {especialidades.map(esp => (
                    <div key={esp.id} className={styles['checkbox-item']}>
                        <input
                            type="checkbox"
                            name="especialidades_ids"
                            value={esp.id}
                            id={`especialidad-${esp.id}`}
                            onChange={handleCheckboxChange}
                            checked={formData.especialidades_ids.includes(esp.id)} 
                        />
                        <label htmlFor={`especialidad-${esp.id}`}>{esp.nombre_esp}</label>
                    </div>
                ))}
            </div>
            
            <hr /> 
            
            {/* Solo mostrar campos de usuario y contraseña al CREAR (no al editar) */}
            {!isEditing && (
                <>
                    <h4>Datos de Acceso</h4>
                    
                    <label>Nombre de Usuario</label>
                    <input 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        placeholder="Usuario" 
                        required 
                    />
                    {usernameError && <p className={styles['error-message']}>{usernameError}</p>}
                    
                    <label>Contraseña</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Contraseña" 
                        required
                    />
                    {passwordError && <p className={styles['error-message']}>{passwordError}</p>}
                </>
            )}
            
            <button type="submit">{isEditing ? 'Guardar cambios' : 'Registrar miembro'}</button>
        </form>
    );
}