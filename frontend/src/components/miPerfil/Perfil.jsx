import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateMiembro } from '../../api/personal.api';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';
import styles from './Perfil.module.css';

const Perfil = () => {
    const { showSuccess, showError } = useAlert();
    const { showConfirm } = useConfirm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    
    const [formData, setFormData] = useState({
        username: '',
        telefono: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        username: '',
        telefono: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const user = await getCurrentUser();
            setUserInfo(user);
            setFormData({
                username: user.user?.username || '',
                telefono: user.telefono || '',
                email: user.email || '',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
            showError('No se pudo cargar la información del perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Limpiar error del campo al escribir
        setErrors(prev => ({ ...prev, [name]: '' }));
        
        // Validación en tiempo real para teléfono
        if (name === 'telefono') {
            const filteredValue = value.replace(/[^0-9\s\+\-\(\)]/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            
            const digitCount = filteredValue.replace(/[^0-9]/g, '').length;
            if (digitCount > 0 && digitCount < 7) {
                setErrors(prev => ({ ...prev, telefono: 'El teléfono debe tener mínimo 7 dígitos' }));
            }
        } 
        // Validación en tiempo real para email
        else if (name === 'email') {
            setFormData(prev => ({ ...prev, [name]: value }));
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (value && !emailRegex.test(value)) {
                setErrors(prev => ({ ...prev, email: 'Formato de email inválido' }));
            }
        }
        // Validación para contraseñas
        else if (name === 'password' || name === 'confirmPassword') {
            setFormData(prev => ({ ...prev, [name]: value }));
            
            if (name === 'password' && value && value.length < 6) {
                setErrors(prev => ({ ...prev, password: 'La contraseña debe tener al menos 6 caracteres' }));
            }
            
            if (name === 'confirmPassword' && value && value !== formData.password) {
                setErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
            }
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Validar username
        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es obligatorio';
            isValid = false;
        }

        // Validar teléfono
        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es obligatorio';
            isValid = false;
        } else {
            const digitCount = formData.telefono.replace(/[^0-9]/g, '').length;
            if (digitCount < 7) {
                newErrors.telefono = 'El teléfono debe tener al menos 7 dígitos';
                isValid = false;
            }
        }

        // Validar email
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Formato de email inválido';
            isValid = false;
        }

        // Validar contraseñas si se ingresaron
        if (formData.password || formData.confirmPassword) {
            if (formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
                isValid = false;
            }
            
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showError('Por favor, corrige los errores en el formulario');
            return;
        }

        const confirmed = await showConfirm(
            '¿Estás seguro de que deseas actualizar tu perfil?',
            'Confirmar Cambios'
        );

        if (!confirmed) return;

        setSaving(true);
        try {
            const dataToUpdate = {
                username: formData.username,
                telefono: formData.telefono,
                email: formData.email
            };

            // Solo incluir password si se ingresó uno nuevo
            if (formData.password) {
                dataToUpdate.password = formData.password;
            }

            await updateMiembro(userInfo.id, dataToUpdate);
            
            showSuccess('Perfil actualizado correctamente');
            
            // Recargar información del usuario
            await loadUserInfo();
            
            // Limpiar campos de contraseña
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            showError('No se pudo actualizar el perfil. Intenta nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    const formatFechaAlta = (fecha) => {
        if (!fecha) return 'N/A';
        const fechaStr = fecha.includes('T') ? fecha : fecha + 'T00:00:00';
        const date = new Date(fechaStr);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className={styles.perfilContainer}>
            <div className={styles.header}>
                <h1>Mi Perfil</h1>
                <p>Administra tu información personal y de acceso</p>
            </div>

            <div className={styles.contentGrid}>
                {/* Información Personal (Solo lectura) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>👤 Información Personal</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.infoItem}>
                            <label>Nombre Completo</label>
                            <p>{userInfo?.nombre} {userInfo?.apellido}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>DNI</label>
                            <p>{userInfo?.dni}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Fecha de Alta</label>
                            <p>{formatFechaAlta(userInfo?.fecha_alta)}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Puesto</label>
                            <p>{userInfo?.puesto_info?.nombre_puesto}</p>
                        </div>
                        <div className={styles.infoItem}>
                            <label>Domicilio</label>
                            <p>{userInfo?.domicilio || 'No especificado'}</p>
                        </div>
                    </div>
                </div>

                {/* Formulario Editable */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>✏️ Editar Perfil</h2>
                    </div>
                    <form onSubmit={handleSubmit} className={styles.cardContent}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Nombre de Usuario</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={errors.username ? styles.inputError : ''}
                            />
                            {errors.username && (
                                <span className={styles.errorMessage}>{errors.username}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="telefono">Teléfono</label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="Ej: 123456789"
                                className={errors.telefono ? styles.inputError : ''}
                            />
                            {errors.telefono && (
                                <span className={styles.errorMessage}>{errors.telefono}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="usuario@ejemplo.com"
                                className={errors.email ? styles.inputError : ''}
                            />
                            {errors.email && (
                                <span className={styles.errorMessage}>{errors.email}</span>
                            )}
                        </div>

                        <div className={styles.divider}></div>

                        <h3 className={styles.sectionTitle}>Cambiar Contraseña</h3>
                        <p className={styles.sectionDescription}>
                            Deja estos campos vacíos si no deseas cambiar tu contraseña
                        </p>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Nueva Contraseña</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                className={errors.password ? styles.inputError : ''}
                            />
                            {errors.password && (
                                <span className={styles.errorMessage}>{errors.password}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite la contraseña"
                                className={errors.confirmPassword ? styles.inputError : ''}
                            />
                            {errors.confirmPassword && (
                                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Perfil;