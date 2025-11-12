// src/components/HistoriaClinica/HistoriaDetail.jsx

import React, { useState, useEffect } from 'react';
import { getHistoriaClinicaById } from '../../api/historias.api';
import styles from './HistoriaClinicaDetail.module.css'; // Crear este archivo CSS
import SeguimientoForm from './SeguimientoForm'; // Componente que crearemos a continuación

// Recibe el ID de la HC a mostrar y una función para volver a la lista
export default function HistoriaDetail({ historiaId, onBack, odontologoId, userRole}) {
    const [historia, setHistoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSeguimientoForm, setShowSeguimientoForm] = useState(false);

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

    useEffect(() => {
        fetchHistoria();
    }, [historiaId]);

    // Manejador para agregar un nuevo seguimiento a la lista local
    const handleAddSeguimiento = (nuevoSeguimiento) => {
        // Actualiza el estado de la HC con el nuevo seguimiento
        setHistoria(prev => ({
            ...prev,
            seguimientos: [nuevoSeguimiento, ...prev.seguimientos] // Añadir al inicio de la lista
        }));
        setShowSeguimientoForm(false);
    };

    if (loading) return <div className={styles.loading}>Cargando Historia Clínica...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!historia) return <div className={styles.container}><p>Historia Clínica no encontrada.</p></div>;

    // --- Renderizado del Detalle ---
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
                                <td>{detalle.pieza_codigo}</td>
                                <td>{detalle.cara_nombre}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.sectionHeader}>
                <h3>Seguimientos y Evolución ({historia.seguimientos.length})</h3>
                {(userRole === 'Odontólogo/a' || userRole === 'Admin') && (
                    <button 
                        className={styles.newSeguimientoButton}
                        onClick={() => setShowSeguimientoForm(true)}
                    >
                        + Agregar Seguimiento
                    </button>
                )}
            </div>

            {/* Modal de Seguimiento */}
            {showSeguimientoForm && (
                <SeguimientoForm 
                    historiaId={historia.id} 
                    odontologoId={odontologoId}
                    onClose={() => setShowSeguimientoForm(false)}
                    onSave={handleAddSeguimiento}
                />
            )}
            
            {/* 3. Lista de Seguimientos */}
            <div className={styles.seguimientoList}>
                {historia.seguimientos.length === 0 ? (
                    <p>No hay seguimientos registrados para esta Historia Clínica.</p>
                ) : (
                    // Muestra los seguimientos del más reciente al más antiguo
                    historia.seguimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((seguimiento) => (
                        <div key={seguimiento.id} className={styles.seguimientoCard}>
                            <p><strong>Odontólogo:</strong> {seguimiento.odontologo_nombre}</p>
                            <p><strong>Fecha:</strong> {new Date(seguimiento.fecha).toLocaleString()}</p>
                            <p className={styles.seguimientoDesc}>{seguimiento.descripcion}</p>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}