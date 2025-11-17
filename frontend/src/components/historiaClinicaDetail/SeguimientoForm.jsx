// src/components/HistoriaClinica/SeguimientoForm.jsx

import React, { useState } from 'react';
import { createSeguimiento, updateSeguimiento } from '../../api/historias.api';
import { useAlert } from '../../hooks/useAlert';
import styles from './HistoriaClinicaDetail.module.css';

export default function SeguimientoForm({ 
    historiaId, 
    odontologoId, 
    onClose, 
    onSave,
    isEditing = false,
    initialData = null 
}) {
    const { showWarning, showSuccess } = useAlert();
    
    const [descripcion, setDescripcion] = useState(initialData?.descripcion || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion.trim()) {
            showWarning("La descripción no puede estar vacía.");
            return;
        }

        setLoading(true);
        setError(null);
        
        const seguimientoData = {
            descripcion: descripcion,
            historia_clinica: historiaId, 
            odontologo: odontologoId, // ✅ Siempre se actualiza al odontólogo que está editando/creando
            fecha: new Date().toISOString() // ✅ Actualizar la fecha al momento actual
        };

        try {
            let resultado;
            
            if (isEditing) {
                // ✅ MODO EDICIÓN: Actualiza descripción Y odontólogo
                resultado = await updateSeguimiento(historiaId, initialData.id, seguimientoData);
                showSuccess("Seguimiento actualizado correctamente.");
            } else {
                // MODO CREACIÓN
                resultado = await createSeguimiento(historiaId, seguimientoData);
                showSuccess("Seguimiento creado correctamente.");
            }
            
            onSave(resultado, isEditing);
        } catch (err) {
            setError(`Error al ${isEditing ? 'actualizar' : 'registrar'} el seguimiento. Intente nuevamente.`);
            console.error("Error en seguimiento:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContentSmall}>
                <div className={styles.modalHeader}>
                    <h2>{isEditing ? 'Editar Seguimiento' : 'Nuevo Seguimiento/Evolución'}</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="descripcion">Nota de Evolución:</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows="5"
                            required
                        />
                    </div>
                    
                    {/* Mostrar información original si es edición */}
                    {isEditing && initialData && (
                        <div className={styles.editInfo}>
                            <p><small>Creado originalmente por: {initialData.odontologo_nombre}</small></p>
                            <p><small>Fecha original: {new Date(initialData.fecha).toLocaleString()}</small></p>
                        </div>
                    )}
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={loading || !descripcion.trim()}>
                            {loading ? 'Guardando...' : isEditing ? 'Actualizar Seguimiento' : 'Guardar Seguimiento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}