// src/components/HistoriaClinica/HistoriaClinicaForm.jsx

import React, { useState, useEffect } from 'react';
import { 
    createHistoriaClinica,
    getTratamientos, 
    getPiezasDentales, 
    getCarasDentales,
    updateHistoriaClinica
 } from '../../api/historias.api';
 import styles from './HistoriaClinicaForm.module.css';

const initialFormData = {
    descripcion: '',
    finalizado: false,
    detalles: []
};

export default function HistoriaClinicaForm({ 
    pacienteId, 
    odontologoId, 
    onClose, 
    onSave,
    isEditing = false, 
    initialData = null 
}) {
    // ✅ UN SOLO ESTADO para todo el formulario
    const [formData, setFormData] = useState(() => {
        if (isEditing && initialData) {
            return {
                descripcion: initialData.descripcion || '',
                finalizado: initialData.finalizado || false,
                detalles: initialData.detalles || []
            };
        }
        return initialFormData;
    });
    
    // Estado del Detalle en curso
    const [nuevoDetalle, setNuevoDetalle] = useState({
        tratamiento: '',
        pieza_dental: '',
        cara_dental: '',
    });

    // Estados de catálogos
    const [catalogos, setCatalogos] = useState({
        tratamientos: [],
        piezas: [],
        caras: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔒 Estados para control de tratamientos
    const [isOrtodonciaLocked, setIsOrtodonciaLocked] = useState(false);
    const [isOtroTratamientoLocked, setIsOtroTratamientoLocked] = useState(false);
    const [ortodonciaId, setOrtodonciaId] = useState(null);

    // --- Carga de Catálogos ---
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [tratamientos, piezas, caras] = await Promise.all([
                    getTratamientos(),
                    getPiezasDentales(),
                    getCarasDentales()
                ]);
                setCatalogos({ tratamientos, piezas, caras });

                // 🔍 BUSCAR EL ID DE ORTODONCIA
                const ortodonciaTratamiento = tratamientos.find(
                    t => t.nombre_trat.toLowerCase() === 'ortodoncia'
                );
                
                if (ortodonciaTratamiento) {
                    setOrtodonciaId(ortodonciaTratamiento.id);
                    console.log("🦷 ID de Ortodoncia encontrado:", ortodonciaTratamiento.id);
                }

            } catch (err) {
                setError("Error al cargar los catálogos de tratamientos/piezas.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogos();
    }, []);

    // 🔍 EFECTO: Verificar el tipo de tratamiento en los detalles
    useEffect(() => {
        if (formData.detalles.length === 0) {
            // No hay detalles: desbloquear todo
            setIsOrtodonciaLocked(false);
            setIsOtroTratamientoLocked(false);
            return;
        }

        if (ortodonciaId && formData.detalles.length > 0) {
            const tieneOrtodoncia = formData.detalles.some(
                d => d.tratamiento === ortodonciaId
            );
            
            if (tieneOrtodoncia) {
                // Tiene Ortodoncia: bloquear select pero permitir más detalles
                setIsOrtodonciaLocked(true);
                setIsOtroTratamientoLocked(false);
                // Pre-seleccionar Ortodoncia en el nuevo detalle
                setNuevoDetalle(prev => ({
                    ...prev,
                    tratamiento: ortodonciaId
                }));
            } else {
                // Tiene otro tratamiento: bloquear COMPLETAMENTE (ya no se pueden agregar más)
                setIsOrtodonciaLocked(false);
                setIsOtroTratamientoLocked(true);
            }
        }
    }, [formData.detalles, ortodonciaId]);

    // --- Manejadores ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleDetalleChange = (e) => {
        const { name, value } = e.target;
        
        // 🔒 BLOQUEO: No permitir cambiar tratamiento si Ortodoncia está bloqueada
        if (name === 'tratamiento' && isOrtodonciaLocked) {
            return; // No hacer nada si intenta cambiar el tratamiento
        }

        setNuevoDetalle(prev => ({
            ...prev,
            [name]: value === '' ? '' : parseInt(value),
        }));
    };

    // ✅ Agregar detalle
    const addDetalle = () => {
        if (!nuevoDetalle.tratamiento || !nuevoDetalle.pieza_dental || !nuevoDetalle.cara_dental) {
            alert("Debe seleccionar Tratamiento, Pieza y Cara.");
            return;
        }

        // 🚫 BLOQUEO: Si ya hay un tratamiento que NO es Ortodoncia, no permitir agregar más
        if (isOtroTratamientoLocked) {
            alert("Solo se puede agregar un detalle para tratamientos que no sean Ortodoncia.");
            return;
        }

        // Buscar los nombres para mostrar en la tabla
        const tratamientoNombre = catalogos.tratamientos.find(t => t.id === nuevoDetalle.tratamiento)?.nombre_trat;
        const piezaCodigo = catalogos.piezas.find(p => p.id === nuevoDetalle.pieza_dental)?.codigo_pd;
        const caraNombre = catalogos.caras.find(c => c.id === nuevoDetalle.cara_dental)?.nombre_cara;

        // 🔒 ACTIVAR BLOQUEO según el tipo de tratamiento
        if (nuevoDetalle.tratamiento === ortodonciaId) {
            setIsOrtodonciaLocked(true);
            setIsOtroTratamientoLocked(false);
        } else {
            // Es otro tratamiento: bloquear todo después de este
            setIsOtroTratamientoLocked(true);
            setIsOrtodonciaLocked(false);
        }

        // Agregar al formData
        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, {
                tratamiento: nuevoDetalle.tratamiento,
                pieza_dental: nuevoDetalle.pieza_dental,
                cara_dental: nuevoDetalle.cara_dental,
                tratamiento_nombre: tratamientoNombre,
                pieza_codigo: piezaCodigo,
                cara_nombre: caraNombre
            }]
        }));

        // Resetear el formulario (manteniendo tratamiento si está bloqueado Ortodoncia)
        setNuevoDetalle({
            tratamiento: isOrtodonciaLocked ? ortodonciaId : '',
            pieza_dental: '',
            cara_dental: '',
        });
    };

    // ✅ Eliminar detalle
    const removeDetalle = (index) => {
        const detalleEliminado = formData.detalles[index];
        
        setFormData(prev => {
            const nuevosDetalles = prev.detalles.filter((_, i) => i !== index);
            
            // 🔓 DESBLOQUEAR según lo que se eliminó
            if (nuevosDetalles.length === 0) {
                // Ya no hay detalles: desbloquear todo
                setIsOrtodonciaLocked(false);
                setIsOtroTratamientoLocked(false);
                setNuevoDetalle({
                    tratamiento: '',
                    pieza_dental: '',
                    cara_dental: '',
                });
            } else if (detalleEliminado.tratamiento === ortodonciaId) {
                // Eliminó Ortodoncia: verificar si quedan más
                const quedaOrtodoncia = nuevosDetalles.some(d => d.tratamiento === ortodonciaId);
                if (!quedaOrtodoncia) {
                    setIsOrtodonciaLocked(false);
                    setIsOtroTratamientoLocked(false);
                    setNuevoDetalle({
                        tratamiento: '',
                        pieza_dental: '',
                        cara_dental: '',
                    });
                }
            }
            
            return {
                ...prev,
                detalles: nuevosDetalles
            };
        });
    };

    // --- Manejador de Envío ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.detalles.length === 0) {
            alert("Debe agregar al menos un detalle de tratamiento.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const payload = {
            paciente: pacienteId,
            odontologo: odontologoId,
            descripcion: formData.descripcion,
            finalizado: formData.finalizado,
            fecha_fin: formData.finalizado ? new Date().toISOString().split('T')[0] : null,
            detalles: formData.detalles.map(d => ({
                tratamiento: d.tratamiento,
                cara_dental: d.cara_dental,
                pieza_dental: d.pieza_dental,
            }))
        };

        console.log("📤 Payload enviado:", payload);

        try {
            let result;
            if (isEditing) {
                result = await updateHistoriaClinica(initialData.id, payload);
                alert(`Historia Clínica N° ${result.id} actualizada con éxito.`);
            } else {
                result = await createHistoriaClinica(payload);
                alert(`Historia Clínica N° ${result.id} creada con éxito.`);
            }

            onSave(result);
        } catch (err) {
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la Historia Clínica.`);
            console.error(`Error de API (${isEditing ? 'UPDATE' : 'CREATE'} HC):`, err);
            console.error("Respuesta del servidor:", err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    if (loading && catalogos.tratamientos.length === 0) {
        return <div className={styles.loading}>Cargando datos de catálogo...</div>;
    }

    // --- Renderizado ---
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? `Editar HC N° ${initialData.id}` : `Nueva Historia Clínica`}</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Sección 1: Datos Principales */}
                    <fieldset className={styles.fieldset}>
                        <legend>Datos de la Consulta</legend>
                        <div className={styles.formGroup}>
                            <label htmlFor="descripcion">Motivo de Consulta (Descripción Inicial)</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>
                        
                        <div className={styles.formGroupCheck}>
                            <label htmlFor="finalizado">
                                <input
                                    type="checkbox"
                                    id="finalizado"
                                    name="finalizado"
                                    checked={formData.finalizado}
                                    onChange={handleInputChange}
                                />
                                {isEditing ? 'Historia Clínica Finalizada' : 'Marcar como finalizada inmediatamente'}
                            </label>
                        </div>
                    </fieldset>

                    {/* Sección 2: Tabla de Detalles */}
                    <fieldset className={styles.fieldset}>
                        <legend>
                            Plan de Tratamiento (Detalles HC)
                            {isOrtodonciaLocked && (
                                <span className={styles.ortodonciaWarning}>
                                    🔒 Modo Ortodoncia: Puede agregar múltiples piezas dentales
                                </span>
                            )}
                            {isOtroTratamientoLocked && (
                                <span className={styles.otroTratamientoWarning}>
                                    🔒 Solo se permite un detalle para este tratamiento
                                </span>
                            )}
                        </legend>
                        
                        {/* Tabla de detalles */}
                        {formData.detalles.length > 0 && (
                            <table className={styles.detalleTable}>
                                <thead>
                                    <tr>
                                        <th>Tratamiento</th>
                                        <th>Pieza Dental</th>
                                        <th>Cara</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.detalles.map((detalle, index) => (
                                        <tr key={index}>
                                            <td>{detalle.tratamiento_nombre || 'N/A'}</td>
                                            <td>{detalle.pieza_codigo || 'N/A'}</td>
                                            <td>{detalle.cara_nombre || 'N/A'}</td>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeDetalle(index)}
                                                    className={styles.removeButton}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        
                        {/* Formulario para Agregar Nuevo Detalle */}
                        {/* 🚫 OCULTAR FORMULARIO si ya hay un tratamiento que NO es Ortodoncia */}
                        {!isOtroTratamientoLocked && (
                            <div className={styles.detalleFormRow}>
                                {/* 🔒 SELECT DE TRATAMIENTO BLOQUEADO */}
                                <select 
                                    name="tratamiento" 
                                    onChange={handleDetalleChange} 
                                    value={nuevoDetalle.tratamiento}
                                    disabled={isOrtodonciaLocked}
                                    className={isOrtodonciaLocked ? styles.lockedSelect : ''}
                                >
                                    {isOrtodonciaLocked ? (
                                        // Solo mostrar Ortodoncia cuando está bloqueado
                                        catalogos.tratamientos
                                            .filter(t => t.id === ortodonciaId)
                                            .map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nombre_trat} (Bloqueado)
                                                </option>
                                            ))
                                    ) : (
                                        // Mostrar todas las opciones cuando no está bloqueado
                                        <>
                                            <option value="">--- Seleccionar Tratamiento ---</option>
                                            {catalogos.tratamientos.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre_trat}</option>
                                            ))}
                                        </>
                                    )}
                                </select>

                                <select 
                                    name="pieza_dental" 
                                    onChange={handleDetalleChange} 
                                    value={nuevoDetalle.pieza_dental}
                                >
                                    <option value="">--- Seleccionar Pieza ---</option>
                                    {catalogos.piezas.map(p => (
                                        <option key={p.id} value={p.id}>{p.codigo_pd}</option>
                                    ))}
                                </select>

                                <select 
                                    name="cara_dental" 
                                    onChange={handleDetalleChange} 
                                    value={nuevoDetalle.cara_dental}
                                >
                                    <option value="">--- Seleccionar Cara ---</option>
                                    {catalogos.caras.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre_cara}</option>
                                    ))}
                                </select>

                                <button type="button" onClick={addDetalle} className={styles.addButton}>
                                    Agregar Detalle
                                </button>
                            </div>
                        )}
                    </fieldset>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button 
                            type="submit" 
                            className={styles.submitButton} 
                            disabled={loading || formData.detalles.length === 0}
                        >
                            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Historia Clínica'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}