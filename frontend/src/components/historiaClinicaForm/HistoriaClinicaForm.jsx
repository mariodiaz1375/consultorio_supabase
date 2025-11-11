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
// IMPORTANTE: Necesitas estas APIs para llenar los selectores (dropdowns)
// Asumo que tienes APIs de catálogo:

const initialFormData = {
    descripcion: '',
    finalizado: false,
    detalles: [] // Array de DetallesHC
};

export default function HistoriaClinicaForm({ 
    pacienteId, 
    odontologoId, 
    onClose, 
    onSave,
    isEditing = false, 
    initialData = null 
}) {
    // 1. Estados del Formulario Principal
    const [formData, setFormData] = useState(
        isEditing && initialData 
            ? { 
                ...initialData,
                // Mapeo específico si los campos son diferentes de los de la API (ej: desc_hc -> descripcion)
                descripcion: initialData.descripcion || initialData.desc_hc,
                // Si la edición incluye Detalles, cargarlos
                detalles: initialData.detalles || [] 
              }
            : initialFormData
    );
    
    // 2. Estado para la lista de DetallesHC (los hijos)
    const [detalles, setDetalles] = useState([]);

    // 3. Estado del Detalle en curso (para agregar uno nuevo)
    const [nuevoDetalle, setNuevoDetalle] = useState({
        tratamiento: '',
        pieza_dental: '',
        cara_dental: '',
    });

    // 4. Estados de catálogos (para los <select>)
    const [catalogos, setCatalogos] = useState({
        tratamientos: [],
        piezas: [],
        caras: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Carga de Catálogos ---
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                // Asumiendo que tienes endpoints de catálogo funcionales
                const [tratamientos, piezas, caras] = await Promise.all([
                    getTratamientos(),
                    getPiezasDentales(),
                    getCarasDentales()
                ]);
                setCatalogos({ tratamientos, piezas, caras });
            } catch (err) {
                setError("Error al cargar los catálogos de tratamientos/piezas.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogos();
    }, []);

    // --- Manejadores de Cambio ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFinalizadoChange = (e) => {
        // Maneja el checkbox 'Finalizado'
        setFormData(prev => ({
            ...prev,
            finalizado: e.target.checked
        }));
    };

    const handleDetalleChange = (e) => {
        const { name, value } = e.target;
        setNuevoDetalle({
            ...nuevoDetalle,
            [name]: value === '' ? '' : parseInt(value), // Convertir a entero para FKs
        });
    };

    const addDetalle = () => {
        // Validación básica antes de agregar el detalle
        if (!nuevoDetalle.tratamiento || !nuevoDetalle.pieza_dental || !nuevoDetalle.cara_dental) {
            alert("Debe seleccionar Tratamiento, Pieza y Cara.");
            return;
        }

        setDetalles([...detalles, nuevoDetalle]);
        // Resetear el detalle en curso para agregar el siguiente
        setNuevoDetalle({
            tratamiento: '',
            pieza_dental: '',
            cara_dental: '',
        });
    };

    const removeDetalle = (index) => {
        setDetalles(detalles.filter((_, i) => i !== index));
    };

    const handleDetalleRemove = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            detalles: prev.detalles.filter((_, index) => index !== indexToRemove)
        }));
    };

    // --- Manejador de Envío Principal ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // El objeto de datos final para el API (padre + hijos)
        const payload = {
            paciente: pacienteId,
            odontologo: odontologoId,
            descripcion: formData.descripcion,
            finalizado: formData.finalizado,
            fecha_fin: formData.finalizado ? new Date().toISOString() : null, // Opcional: registrar fecha de fin
            detalles: formData.detalles.map(d => ({
                // Solo enviamos los IDs para los detalles
                tratamiento: d.tratamiento,
                cara_dental: d.cara_dental,
                pieza_dental: d.pieza_dental,
            }))
        };

        try {
            let result;
            if (isEditing) {
                // ⭐ LÓGICA DE EDICIÓN
                result = await updateHistoriaClinica(initialData.id, payload);
                alert(`Historia Clínica N° ${result.id} actualizada con éxito.`);
            } else {
                // LÓGICA DE CREACIÓN
                result = await createHistoriaClinica(payload);
                alert(`Historia Clínica N° ${result.id} creada con éxito.`);
            }

            onSave(result); // Pasa la HC actualizada/creada al componente padre
        } catch (err) {
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la Historia Clínica.`);
            console.error(`Error de API (${isEditing ? 'UPDATE' : 'CREATE'} HC):`, err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className={styles.loading}>Cargando datos de catálogo...</div>;

    // --- Renderizado del Formulario ---
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? `Editar HC N° ${initialData.id}` : `Nueva Historia Clínica`}</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    
                    {/* Sección 1: Datos Principales de la HC */}
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
                        {!isEditing && (
                        <div className={styles.formGroupCheck}>
                            <label htmlFor="finalizado">
                                <input
                                    type="checkbox"
                                    id="finalizado"
                                    name="finalizado"
                                    checked={formData.finalizado}
                                    onChange={handleInputChange}
                                />
                                Marcar como finalizada inmediatamente
                            </label>
                        </div>
                        )}
                        {/* Campo de Finalizado (Solo visible en edición) */}
                    {isEditing && (
                        <div className={styles.formRow}>
                            <div className={styles.formGroupCheckbox}>
                                <input
                                    type="checkbox"
                                    id="finalizado"
                                    name="finalizado"
                                    checked={formData.finalizado}
                                    onChange={handleFinalizadoChange}
                                />
                                <label htmlFor="finalizado">Historia Clínica Finalizada</label>
                            </div>
                        </div>
                    )}
                    </fieldset>

                    {/* Sección 2: Creación de DetallesHC Anidados */}
                    <fieldset className={styles.fieldset}>
                        <legend>Plan de Tratamiento Inicial (Detalles HC)</legend>
                        
                        {/* Tabla de Detalles Agregados */}
                        {detalles.length > 0 && (
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
                                    {detalles.map((d, index) => (
                                        <tr key={index}>
                                            <td>{catalogos.tratamientos.find(t => t.id === d.tratamiento)?.nombre_trat || 'N/A'}</td>
                                            <td>{catalogos.piezas.find(p => p.id === d.pieza_dental)?.codigo_pd || 'N/A'}</td>
                                            <td>{catalogos.caras.find(c => c.id === d.cara_dental)?.nombre_cara || 'N/A'}</td>
                                            <td>
                                                <button type="button" onClick={() => removeDetalle(index)} className={styles.removeButton}>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
                                            <td>
                                                {detalle.tratamiento_nombre}
                                            </td>
                                            <td>
                                                {detalle.pieza_codigo}
                                            </td>
                                            <td>
                                                {detalle.cara_nombre}
                                            </td>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDetalleRemove(index)}
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
                        <div className={styles.detalleFormRow}>
                            <select name="tratamiento" onChange={handleDetalleChange} value={nuevoDetalle.tratamiento}>
                                <option value="">--- Seleccionar Tratamiento ---</option>
                                {catalogos.tratamientos.map(t => (
                                    <option key={t.id} value={t.id}>{t.nombre_trat}</option>
                                ))}
                            </select>
                            <select name="pieza_dental" onChange={handleDetalleChange} value={nuevoDetalle.pieza_dental}>
                                <option value="">--- Seleccionar Pieza ---</option>
                                {catalogos.piezas.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo_pd}</option>
                                ))}
                            </select>
                            <select name="cara_dental" onChange={handleDetalleChange} value={nuevoDetalle.cara_dental}>
                                <option value="">--- Seleccionar Cara ---</option>
                                {catalogos.caras.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre_cara}</option>
                                ))}
                            </select>
                            <button type="button" onClick={addDetalle} className={styles.addButton}>
                                Agregar Detalle
                            </button>
                        </div>
                    </fieldset>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                        <button type="submit" className={styles.submitButton} disabled={detalles.length === 0 }>
                            {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Historia Clínica'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}