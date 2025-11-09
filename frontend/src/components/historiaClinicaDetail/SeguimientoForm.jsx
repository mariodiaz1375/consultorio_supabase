// src/components/HistoriaClinica/SeguimientoForm.jsx

import React, { useState } from 'react';
import { createSeguimiento } from '../../api/historias.api';
import styles from './HistoriaClinicaDetail.module.css'; // Reutilizaremos los estilos del modal

export default function SeguimientoForm({ historiaId, odontologoId, onClose, onSave }) {
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion.trim()) return;

        setLoading(true);
        setError(null);
        
        const seguimientoData = {
            descripcion: descripcion,
            // Los campos FK necesarios para la API
            historia_clinica: historiaId, 
            odontologo: odontologoId 
        };

        try {
            const nuevoSeguimiento = await createSeguimiento(historiaId, seguimientoData);
            onSave(nuevoSeguimiento); // Actualiza la lista en el padre (HistoriaDetail)
        } catch (err) {
            setError("Error al registrar el seguimiento. Intente nuevamente.");
            console.error("Error al crear seguimiento:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContentSmall}> {/* Usamos una clase más pequeña */}
                <div className={styles.modalHeader}>
                    <h2>Nuevo Seguimiento/Evolución</h2>
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
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <div className={styles.modalFooter}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={loading || !descripcion.trim()}>
                            {loading ? 'Guardando...' : 'Guardar Seguimiento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}