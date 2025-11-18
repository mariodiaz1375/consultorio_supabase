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
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [formData, setFormData] = useState({
        username: '',
        telefono: '',
        email: '',
        domicilio: '' // 👈 CAMBIO 1: Añadir domicilio al estado
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        username: '',
        telefono: '',
        email: '',
        domicilio: '' // 👈 CAMBIO 2: Añadir error para domicilio
    });

    const [passwordErrors, setPasswordErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const user = await getCurrentUser();
            console.log('Usuario cargado:', user);
            setUserInfo(user);
            
            setFormData({
                username: user.username || '',
                telefono: user.telefono || '',
                email: user.email || '',
                domicilio: user.domicilio || '' // 👈 CAMBIO 3: Cargar domicilio
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
        
        setErrors(prev => ({ ...prev, [name]: '' }));
        
        if (name === 'telefono') {
            const filteredValue = value.replace(/[^0-9\s\+\-\(\)]/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            
            const digitCount = filteredValue.replace(/[^0-9]/g, '').length;
            if (digitCount > 0 && digitCount < 7) {
                setErrors(prev => ({ ...prev, telefono: 'El teléfono debe tener mínimo 7 dígitos' }));
            }
        } 
        else if (name === 'email') {
            setFormData(prev => ({ ...prev, [name]: value }));
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (value && !emailRegex.test(value)) {
                setErrors(prev => ({ ...prev, email: 'Formato de email inválido' }));
            }
        }
        else {
            // Domicilio y Username caen aquí
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // (handlePasswordChange no cambia) ...
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        setPasswordData(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword' && value && value.length < 6) {
            setPasswordErrors(prev => ({ ...prev, newPassword: 'La contraseña debe tener al menos 6 caracteres' }));
        }
        
        if (name === 'confirmPassword' && value && value !== passwordData.newPassword) {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: 'Las contraseñas no coinciden' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!formData.username.trim()) {
            newErrors.username = 'El nombre de usuario es obligatorio';
            isValid = false;
        }
        
        // 👈 CAMBIO 4: Validación de Domicilio (Opcional: puedes quitarlo si no es obligatorio)
        if (!formData.domicilio.trim()) {
             newErrors.domicilio = 'El domicilio es obligatorio';
             isValid = false;
        }

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

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Formato de email inválido';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // (validatePasswordForm no cambia) ...
    const validatePasswordForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!passwordData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es obligatoria';
            isValid = false;
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'La nueva contraseña es obligatoria';
            isValid = false;
        } else if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
            isValid = false;
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Debes confirmar la nueva contraseña';
            isValid = false;
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setPasswordErrors(newErrors);
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
                username_input: formData.username,
                telefono: formData.telefono,
                email: formData.email,
                domicilio: formData.domicilio // 👈 CAMBIO 5: Enviar domicilio
            };

            await updateMiembro(userInfo.id, dataToUpdate);
            
            showSuccess('Perfil actualizado correctamente');
            
            const updatedUserInfo = { ...userInfo, ...dataToUpdate, username: formData.username };
            localStorage.setItem('user_info', JSON.stringify(updatedUserInfo));
            
            await loadUserInfo();

        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            
            let errorMsg = 'No se pudo actualizar el perfil.';
            if (error.response?.data?.username) {
                errorMsg = `Error: ${error.response.data.username[0]}`; 
            } else if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            }
            showError(errorMsg);
            
        } finally {
            setSaving(false);
        }
    };

    // (handlePasswordSubmit y formatFechaAlta no cambian) ...
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            showError('Por favor, corrige los errores en el formulario');
            return;
        }
        
        const confirmed = await showConfirm(
            '¿Estás seguro de que deseas cambiar tu contraseña?',
            'Confirmar Cambio de Contraseña'
        );

        if (!confirmed) return;

        setSaving(true);
        try {
            await updateMiembro(userInfo.id, {
                current_password: passwordData.currentPassword,
                password: passwordData.newPassword
            });
            
            showSuccess('Contraseña actualizada correctamente');
            
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            setShowPasswordModal(false);

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            let errorMsg = 'No se pudo cambiar la contraseña.';
            if (error.response?.data?.current_password) {
                errorMsg = error.response.data.current_password[0]; 
            } else if (error.response?.data?.detail) {
                errorMsg = error.response.data.detail;
            }
            showError(errorMsg);
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
                        
                        {/* 👇 CAMBIO 6: Eliminado "Domicilio" de aquí, ya no es solo lectura */}
                        
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
                                placeholder="Nombre de usuario"
                                className={errors.username ? styles.inputError : ''}
                            />
                            {errors.username && (
                                <span className={styles.errorMessage}>{errors.username}</span>
                            )}
                        </div>

                        {/* 👇 CAMBIO 7: Agregado campo input para Domicilio */}
                        <div className={styles.formGroup}>
                            <label htmlFor="domicilio">Domicilio</label>
                            <input
                                type="text"
                                id="domicilio"
                                name="domicilio"
                                value={formData.domicilio}
                                onChange={handleChange}
                                placeholder="Tu domicilio actual"
                                className={errors.domicilio ? styles.inputError : ''}
                            />
                            {errors.domicilio && (
                                <span className={styles.errorMessage}>{errors.domicilio}</span>
                            )}
                        </div>
                        {/* -------------------------------------------------- */}

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

                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>

                        <div className={styles.divider}></div>

                        <button 
                            type="button"
                            className={styles.passwordButton}
                            onClick={() => setShowPasswordModal(true)}
                        >
                            🔒 Cambiar Contraseña
                        </button>
                    </form>
                </div>
            </div>

            {/* (Modal de contraseña no cambia) */}
            {showPasswordModal && (
                <div className={styles.modalOverlay} onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setShowPasswordModal(false);
                        setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                        });
                        setPasswordErrors({});
                    }
                }}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>🔒 Cambiar Contraseña</h2>
                            <button 
                                className={styles.closeButton}
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    });
                                    setPasswordErrors({});
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handlePasswordSubmit} className={styles.modalContent}>
                            <div className={styles.formGroup}>
                                <label htmlFor="currentPassword">Contraseña Actual</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Ingresa tu contraseña actual"
                                    className={passwordErrors.currentPassword ? styles.inputError : ''}
                                />
                                {passwordErrors.currentPassword && (
                                    <span className={styles.errorMessage}>{passwordErrors.currentPassword}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="newPassword">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Mínimo 6 caracteres"
                                    className={passwordErrors.newPassword ? styles.inputError : ''}
                                />
                                {passwordErrors.newPassword && (
                                    <span className={styles.errorMessage}>{passwordErrors.newPassword}</span>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Repite la nueva contraseña"
                                    className={passwordErrors.confirmPassword ? styles.inputError : ''}
                                />
                                {passwordErrors.confirmPassword && (
                                    <span className={styles.errorMessage}>{passwordErrors.confirmPassword}</span>
                                )}
                            </div>

                            <div className={styles.modalButtons}>
                                <button 
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                        setPasswordErrors({});
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className={styles.submitButton}
                                    disabled={saving}
                                >
                                    {saving ? 'Guardando...' : 'Cambiar Contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;