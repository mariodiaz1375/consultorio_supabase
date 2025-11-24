// src/components/HistoriaClinica/HistoriaClinicaForm.jsx

import React, { useState, useEffect } from 'react';
import { 
    createHistoriaClinica,
    getTratamientos, 
    getPiezasDentales, 
    getCarasDentales,
    updateHistoriaClinica
 } from '../../api/historias.api';
 import { useAlert } from '../../hooks/useAlert';
 import { useConfirm } from '../../hooks/useConfirm';
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
    const { showWarning, showError, showSuccess } = useAlert();
    const { showConfirm } = useConfirm();
    
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
    const [isLimpiezaLocked, setIsLimpiezaLocked] = useState(false);
    const [isOtroTratamientoLocked, setIsOtroTratamientoLocked] = useState(false);
    const [ortodonciaId, setOrtodonciaId] = useState(null);
    const [limpiezaId, setLimpiezaId] = useState(null);
    const [consultaId, setConsultaId] = useState(null);

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
                }

                // 🔍 BUSCAR EL ID DE LIMPIEZA
                const limpiezaTratamiento = tratamientos.find(
                    t => t.nombre_trat.toLowerCase() === 'limpieza'
                );
                
                if (limpiezaTratamiento) {
                    setLimpiezaId(limpiezaTratamiento.id);
                }

                // 🔍 BUSCAR EL ID DE CONSULTA
                const consultaTratamiento = tratamientos.find(
                    t => t.nombre_trat.toLowerCase() === 'consulta'
                );
                
                if (consultaTratamiento) {
                    setConsultaId(consultaTratamiento.id);
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
            setIsOrtodonciaLocked(false);
            setIsLimpiezaLocked(false);
            setIsOtroTratamientoLocked(false);
            setNuevoDetalle(prev => ({ ...prev, tratamiento: '' }));
            return;
        }

        if ((ortodonciaId || limpiezaId) && formData.detalles.length > 0) {
            const activaOrtodoncia = ortodonciaId && formData.detalles.some(
                d => (d.tratamiento === ortodonciaId) && d.pieza_dental !== 33
            );
            
            const activaLimpieza = limpiezaId && formData.detalles.some(
                d => (d.tratamiento === limpiezaId) && d.pieza_dental !== 33
            );
            
            if (activaOrtodoncia) {
                setIsOrtodonciaLocked(true);
                setIsLimpiezaLocked(false);
                setIsOtroTratamientoLocked(false);
                setNuevoDetalle(prev => ({
                    ...prev,
                    tratamiento: ortodonciaId
                }));
            } else if (activaLimpieza) {
                setIsOrtodonciaLocked(false);
                setIsLimpiezaLocked(true);
                setIsOtroTratamientoLocked(false);
                setNuevoDetalle(prev => ({
                    ...prev,
                    tratamiento: limpiezaId
                }));
            } else {
                if (formData.detalles.length === 1) {
                    setIsOtroTratamientoLocked(true);
                    setIsOrtodonciaLocked(false);
                    setIsLimpiezaLocked(false);
                } else {
                    setIsOtroTratamientoLocked(false);
                    setIsOrtodonciaLocked(false);
                    setIsLimpiezaLocked(false);
                }
            }
        } else if (formData.detalles.length > 0) {
            setIsOtroTratamientoLocked(true);
            setIsOrtodonciaLocked(false);
            setIsLimpiezaLocked(false);
        }
    }, [formData.detalles, ortodonciaId, limpiezaId]);

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
        
        if (name === 'tratamiento' && (isOrtodonciaLocked || isLimpiezaLocked)) {
            return;
        }

        setNuevoDetalle(prev => ({
            ...prev,
            [name]: value === '' ? '' : parseInt(value),
        }));
    };

    // ✅ Agregar detalle
    const addDetalle = () => {
        const isConsulta = nuevoDetalle.tratamiento === consultaId;
        
        if (!nuevoDetalle.tratamiento) {
            showWarning("Debe seleccionar un Tratamiento.");
            return;
        }

        if (!isConsulta) {
            if (!nuevoDetalle.pieza_dental) {
                showWarning("Debe seleccionar la Pieza dental.");
                return;
            }
            if (!nuevoDetalle.cara_dental) {
                showWarning("Debe seleccionar la Cara dental.");
                return;
            }
        }

        if (isOtroTratamientoLocked) {
            showWarning("Solo se puede agregar un detalle para tratamientos que no sean Ortodoncia o Limpieza.");
            return;
        }

        // =====================================================================
        // 🛡️ VALIDACIÓN: Evitar duplicados (Tratamiento + Pieza + Cara)
        // =====================================================================
        const existeDuplicado = formData.detalles.some(detalle => {
            // Normalizamos los valores:
            // Si 'pieza_dental' es null en detalle, lo comparamos con '' del state o null
            const tratIgual = detalle.tratamiento === nuevoDetalle.tratamiento;
            const piezaIgual = (detalle.pieza_dental || null) === (nuevoDetalle.pieza_dental || null);
            const caraIgual = (detalle.cara_dental || null) === (nuevoDetalle.cara_dental || null);

            return tratIgual && piezaIgual && caraIgual;
        });

        if (existeDuplicado) {
            showWarning('Error: No se puede repetir diente y cara.');
            return;
        }
        // =====================================================================

        const tratamientoNombre = catalogos.tratamientos.find(t => t.id === nuevoDetalle.tratamiento)?.nombre_trat;
        const piezaCodigo = nuevoDetalle.pieza_dental 
            ? catalogos.piezas.find(p => p.id === nuevoDetalle.pieza_dental)?.codigo_pd 
            : 'N/A';
        const caraNombre = nuevoDetalle.cara_dental 
            ? catalogos.caras.find(c => c.id === nuevoDetalle.cara_dental)?.nombre_cara 
            : 'N/A';
        
        const nuevoDetalleObjeto = {
            tratamiento: nuevoDetalle.tratamiento,
            pieza_dental: nuevoDetalle.pieza_dental || null,
            cara_dental: nuevoDetalle.cara_dental || null,
            tratamiento_nombre: tratamientoNombre,
            pieza_codigo: piezaCodigo,
            cara_nombre: caraNombre
        };
        
        setFormData(prev => ({
            ...prev,
            detalles: [...prev.detalles, nuevoDetalleObjeto]
        }));

        setNuevoDetalle({
            tratamiento: isOrtodonciaLocked ? ortodonciaId : (isLimpiezaLocked ? limpiezaId : ''),
            pieza_dental: '',
            cara_dental: '',
        });
    };

    // ✅ Eliminar detalle
    const removeDetalle = (index) => {
        const detalleEliminado = formData.detalles[index];
        
        setFormData(prev => {
            const nuevosDetalles = prev.detalles.filter((_, i) => i !== index);
            
            if (nuevosDetalles.length === 0) {
                setIsOrtodonciaLocked(false);
                setIsLimpiezaLocked(false);
                setIsOtroTratamientoLocked(false);
                setNuevoDetalle({
                    tratamiento: '',
                    pieza_dental: '',
                    cara_dental: '',
                });
            } else if (detalleEliminado.tratamiento === ortodonciaId) {
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
            } else if (detalleEliminado.tratamiento === limpiezaId) {
                const quedaLimpieza = nuevosDetalles.some(d => d.tratamiento === limpiezaId);
                if (!quedaLimpieza) {
                    setIsLimpiezaLocked(false);
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

    // ✅ Manejador para cerrar con confirmación si hay detalles sin guardar
    const handleClose = async () => {
        // Si hay detalles agregados pero no guardados (no está editando), mostrar confirmación
        if (!isEditing && formData.detalles.length > 0) {
            const confirmed = await showConfirm(
                '¿Estás seguro de cerrar? Tienes detalles sin guardar que se perderán.',
                'Datos sin guardar'
            );
            
            if (confirmed) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    // --- Manejador de Envío ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.detalles.length === 0) {
            showWarning("Debe agregar al menos un detalle de tratamiento.");
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
                cara_dental: d.cara_dental || null,
                pieza_dental: d.pieza_dental || null,
            }))
        };

        try {
            let result;
            if (isEditing) {
                result = await updateHistoriaClinica(initialData.id, payload);
                showSuccess(`Historia Clínica N° ${result.id} actualizada con éxito.`);
            } else {
                result = await createHistoriaClinica(payload);
                showSuccess(`Historia Clínica N° ${result.id} creada con éxito.`);
            }

            onSave(result);
        } catch (err) {
            // Mensaje genérico para errores de red o servidor no controlados previamente
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la Historia Clínica.`);
            console.error(`Error de API (${isEditing ? 'UPDATE' : 'CREATE'} HC):`, err);
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
                    <button onClick={handleClose} className={styles.closeButton}>&times;</button>
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
                            {isLimpiezaLocked && (
                                <span className={styles.ortodonciaWarning}>
                                    🔒 Modo Limpieza: Puede agregar múltiples piezas dentales
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
                        {!isOtroTratamientoLocked && (
                            <div className={styles.detalleFormRow}>
                                <select 
                                    name="tratamiento" 
                                    onChange={handleDetalleChange} 
                                    value={nuevoDetalle.tratamiento}
                                    disabled={isOrtodonciaLocked || isLimpiezaLocked}
                                    className={(isOrtodonciaLocked || isLimpiezaLocked) ? styles.lockedSelect : ''}
                                >
                                    {isOrtodonciaLocked ? (
                                        catalogos.tratamientos
                                            .filter(t => t.id === ortodonciaId)
                                            .map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nombre_trat} (Bloqueado)
                                                </option>
                                            ))
                                    ) : isLimpiezaLocked ? (
                                        catalogos.tratamientos
                                            .filter(t => t.id === limpiezaId)
                                            .map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nombre_trat} (Bloqueado)
                                                </option>
                                            ))
                                    ) : (
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
                                    disabled={nuevoDetalle.tratamiento === consultaId}
                                    className={nuevoDetalle.tratamiento === consultaId ? styles.disabledSelect : ''}
                                >
                                    <option value="">
                                        {nuevoDetalle.tratamiento === consultaId 
                                            ? "--- No aplica ---" 
                                            : "--- Seleccionar Pieza ---"}
                                    </option>
                                    
                                    {nuevoDetalle.tratamiento !== consultaId && (
                                        (nuevoDetalle.tratamiento !== 3 && nuevoDetalle.tratamiento !== 4)
                                            ? catalogos.piezas.filter(p => p.codigo_pd !== "Todas")
                                            : catalogos.piezas
                                    ).map(p => (
                                        <option key={p.id} value={p.id}>{p.codigo_pd}</option>
                                    ))}
                                </select>

                                <select 
                                    name="cara_dental" 
                                    onChange={handleDetalleChange} 
                                    value={nuevoDetalle.cara_dental}
                                    disabled={nuevoDetalle.tratamiento === consultaId}
                                    className={nuevoDetalle.tratamiento === consultaId ? styles.disabledSelect : ''}
                                >
                                    <option value="">
                                        {nuevoDetalle.tratamiento === consultaId 
                                            ? "--- No aplica ---" 
                                            : "--- Seleccionar Cara ---"}
                                    </option>
                                    {nuevoDetalle.tratamiento !== consultaId && catalogos.caras
                                        .filter(c => {
                                            if ((nuevoDetalle.tratamiento === 1 || nuevoDetalle.tratamiento === 2) && c.id === 6) {
                                                return false;
                                            }
                                            return true;
                                        })
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre_cara}</option>
                                        ))
                                    }
                                </select>

                                <button type="button" onClick={addDetalle} className={styles.addButton}>
                                    Agregar Detalle
                                </button>
                            </div>
                        )}
                    </fieldset>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={handleClose} className={styles.cancelButton}>Cancelar</button>
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