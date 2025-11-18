// src/components/HistoriaClinica/HistoriaDetail.jsx

import React, { useState, useEffect } from 'react';
import { getHistoriaClinicaById } from '../../api/historias.api';
import styles from './HistoriaClinicaDetail.module.css';
import SeguimientoForm from './SeguimientoForm';

export default function HistoriaDetail({ historiaId, onBack, odontologoId, userRole }) {
    const [historia, setHistoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSeguimientoForm, setShowSeguimientoForm] = useState(false);
    const [editingSeguimiento, setEditingSeguimiento] = useState(null);

useEffect(() => {
    const fetchHistoria = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getHistoriaClinicaById(historiaId);
            setHistoria(data);
        } catch (err) {
            console.error("Error al cargar la Historia Clínica:", err);
            setError("No se pudo cargar el detalle de la Historia Clínica.");
        } finally {
            setLoading(false);
        }
    };
    
    fetchHistoria();
}, [historiaId]);

    // ✅ Manejador para agregar O editar seguimiento
    const handleSaveSeguimiento = (seguimientoActualizado, isEditing) => {
        if (isEditing) {
            // Actualizar el seguimiento existente en la lista
            setHistoria(prev => ({
                ...prev,
                seguimientos: prev.seguimientos.map(s => 
                    s.id === seguimientoActualizado.id ? seguimientoActualizado : s
                )
            }));
        } else {
            // Agregar nuevo seguimiento al inicio
            setHistoria(prev => ({
                ...prev,
                seguimientos: [seguimientoActualizado, ...prev.seguimientos]
            }));
        }
        setShowSeguimientoForm(false);
        setEditingSeguimiento(null);
    };

    // ✅ Manejador para abrir el formulario de edición
    const handleEditSeguimiento = (seguimiento) => {
        setEditingSeguimiento(seguimiento);
        setShowSeguimientoForm(true);
    };

    // ✅ Manejador para cerrar formulario
    const handleCloseForm = () => {
        setShowSeguimientoForm(false);
        setEditingSeguimiento(null);
    };

    if (loading) return <div className={styles.loading}>Cargando Historia Clínica...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!historia) return <div className={styles.container}><p>Historia Clínica no encontrada.</p></div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={onBack} className={styles.backButton}>&larr; Volver a Historias</button>
                <h2>HC N° {historia.id} | Paciente: {historia.paciente_nombre}</h2>
            </div>
            
            {/* 1. Información General */}
            <div className={styles.infoGrid}>
                <div className={styles.card}>
                    <h3>Datos Generales</h3>
                    <p><strong>Fecha Inicio:</strong> {new Date(historia.fecha_inicio).toLocaleDateString()}</p>
                    <p><strong>Odontólogo Creador:</strong> {historia.odontologo_nombre}</p>
                    <p><strong>Estado:</strong> 
                        <span className={historia.finalizado ? styles.finalizada : styles.abierta}>
                            {historia.finalizado ? 'Finalizada' : 'Abierta'}
                        </span>
                    </p>
                    <p><strong>Motivo Consulta:</strong> {historia.descripcion}</p>
                </div>
            </div>

            {/* 2. DetallesHC (Plan de Tratamiento Inicial) */}
            <div className={styles.section}>
                <h3>Plan de Tratamiento Inicial</h3>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tratamiento</th>
                            <th>Pieza</th>
                            <th>Cara</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historia.detalles.map((detalle) => (
                            <tr key={detalle.id}>
                                <td>{detalle.tratamiento_nombre}</td>
                                <td>{detalle.pieza_codigo ? detalle.pieza_codigo : 'N/A'}</td>
                                <td>{detalle.cara_nombre ? detalle.cara_nombre : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.sectionHeader}>
                <h3>Seguimientos y Evolución ({historia.seguimientos.length})</h3>
                {(userRole === 'Odontólogo/a' || userRole === 'Admin') && (!historia.finalizado) && (
                    <button 
                        className={styles.newSeguimientoButton}
                        onClick={() => {
                            setEditingSeguimiento(null);
                            setShowSeguimientoForm(true);
                        }}
                    >
                        + Agregar Seguimiento
                    </button>
                )}
            </div>

            {/* Modal de Seguimiento (Crear o Editar) */}
            {showSeguimientoForm && (
                <SeguimientoForm 
                    historiaId={historia.id} 
                    odontologoId={odontologoId}
                    onClose={handleCloseForm}
                    onSave={handleSaveSeguimiento}
                    isEditing={!!editingSeguimiento}
                    initialData={editingSeguimiento}
                />
            )}
            
            {/* 3. Lista de Seguimientos */}
            <div className={styles.seguimientoList}>
                {historia.seguimientos.length === 0 ? (
                    <p>No hay seguimientos registrados para esta Historia Clínica.</p>
                ) : (
                    historia.seguimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((seguimiento) => (
                        <div key={seguimiento.id} className={styles.seguimientoCard}>
                            <div className={styles.seguimientoHeader}>
                                <div>
                                    <p><strong>Odontólogo:</strong> {seguimiento.odontologo_nombre}</p>
                                    <p><strong>Fecha:</strong> {new Date(seguimiento.fecha).toLocaleString()}</p>
                                </div>
                                {(userRole === 'Odontólogo/a' || userRole === 'Admin') && (
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => handleEditSeguimiento(seguimiento)}
                                        title="Editar seguimiento"
                                    >
                                        ✏️ Editar
                                    </button>
                                )}
                            </div>
                            <p className={styles.seguimientoDesc}>{seguimiento.descripcion}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}