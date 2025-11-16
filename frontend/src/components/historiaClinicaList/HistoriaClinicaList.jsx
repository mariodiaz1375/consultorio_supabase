// src/components/HistoriaClinica/HistoriaClinicaList.jsx

import React, { useState, useEffect } from 'react';
import { getHistoriasClinicas, updateHistoriaClinica } from '../../api/historias.api'; 
import styles from './HistoriaClinicaList.module.css';
import HistoriaClinicaForm from '../historiaClinicaForm/HistoriaClinicaForm'
import HistoriaDetail from '../historiaClinicaDetail/HistoriaClinicaDetail';
import PagosModal from '../pagosModal/PagosModal';

export default function HistoriaClinicaList({ pacienteId, nombrePaciente, odontologoId, userRole }) {
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedHcId, setSelectedHcId] = useState(null);
    const [editingHc, setEditingHc] = useState(null);
    const [pagosModalHc, setPagosModalHc] = useState(null);
    
    // NUEVOS ESTADOS PARA FILTROS
    const [filtros, setFiltros] = useState({
        tratamiento: '',
        odontologo: '',
        fechaDesde: '',
        fechaHasta: '',
        estado: 'todas' // 'todas', 'abiertas', 'finalizadas'
    });
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const esOrtodoncia = (historiaClinica) => {
        if (!historiaClinica.detalles || historiaClinica.detalles.length === 0) {
            return false;
        }
        
        return historiaClinica.detalles.some(detalle => {
            const tratamientoNombre = detalle.tratamiento_nombre?.toLowerCase() || '';
            return tratamientoNombre.includes('ortodoncia');
        });
    };

    const handleHcSave = (nuevaHc) => {
        if (!editingHc) {
            setHistorias(prev => [nuevaHc, ...prev]);
        } else {
            setHistorias(prev => prev.map(hc => hc.id === nuevaHc.id ? nuevaHc : hc));
        }
        setShowForm(false);
        setEditingHc(null);
    };

    const handleEdit = (hc) => {
        setEditingHc(hc);
        setShowForm(true);
    };

    const handleCancelEdit = () => {
        setEditingHc(null);
        setShowForm(false);
    };
    
    const handleFinalizarHc = async (historia) => {
        try {
            const nuevoFinalizado = !historia.finalizado;
            const nuevaFechaFin = nuevoFinalizado ? new Date().toISOString().split('T')[0] : null; 

            const updatedData = {
                finalizado: nuevoFinalizado,
                fecha_fin: nuevaFechaFin,
            };
            
            const updatedHc = await updateHistoriaClinica(historia.id, updatedData);

            setHistorias(prev => 
                prev.map(hc => hc.id === updatedHc.id ? updatedHc : hc)
            );

            console.log(`Historia Clínica ${historia.id} actualizada.`);
        } catch (err) {
            console.error("Error al finalizar/reabrir HC:", err);
        }
    };

    // FUNCIÓN PARA MANEJAR CAMBIOS EN LOS FILTROS
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // FUNCIÓN PARA LIMPIAR FILTROS
    const limpiarFiltros = () => {
        setFiltros({
            tratamiento: '',
            odontologo: '',
            fechaDesde: '',
            fechaHasta: '',
            estado: 'todas'
        });
    };

    // FUNCIÓN PARA APLICAR FILTROS
    const aplicarFiltros = (historiasList) => {
        let historiasFiltradas = [...historiasList];

        // Filtro por tratamiento
        if (filtros.tratamiento.trim()) {
            historiasFiltradas = historiasFiltradas.filter(hc => {
                const tratamientos = hc.detalles?.map(d => d.tratamiento_nombre?.toLowerCase()).join(' ') || '';
                return tratamientos.includes(filtros.tratamiento.toLowerCase());
            });
        }

        // Filtro por odontólogo
        if (filtros.odontologo.trim()) {
            historiasFiltradas = historiasFiltradas.filter(hc => {
                const odontologoNombre = hc.odontologo_nombre?.toLowerCase() || '';
                return odontologoNombre.includes(filtros.odontologo.toLowerCase());
            });
        }

        // Filtro por fecha desde
        if (filtros.fechaDesde) {
            historiasFiltradas = historiasFiltradas.filter(hc => {
                const fechaInicio = new Date(hc.fecha_inicio);
                const fechaDesde = new Date(filtros.fechaDesde);
                return fechaInicio >= fechaDesde;
            });
        }

        // Filtro por fecha hasta
        if (filtros.fechaHasta) {
            historiasFiltradas = historiasFiltradas.filter(hc => {
                const fechaInicio = new Date(hc.fecha_inicio);
                const fechaHasta = new Date(filtros.fechaHasta);
                return fechaInicio <= fechaHasta;
            });
        }

        // Filtro por estado
        if (filtros.estado === 'abiertas') {
            historiasFiltradas = historiasFiltradas.filter(hc => !hc.finalizado);
        } else if (filtros.estado === 'finalizadas') {
            historiasFiltradas = historiasFiltradas.filter(hc => hc.finalizado);
        }

        return historiasFiltradas;
    };

    // Aplicar filtros a las historias
    const historiasFiltradas = aplicarFiltros(historias);

    // useEffect se dispara cuando el pacienteId cambia
    useEffect(() => {
        const fetchHistorias = async () => {
            setLoading(true);
            setError(null);
            try {
                const allHistorias = await getHistoriasClinicas();
                
                const historiasFiltradas = allHistorias.filter(
                    (hc) => hc.paciente === pacienteId
                );

                setHistorias(historiasFiltradas);
            } catch (err) {
                console.error("Error al cargar las historias clínicas:", err);
                setError("No se pudieron cargar las historias clínicas. Intente nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        if (pacienteId) {
            fetchHistorias();
        } else {
            setLoading(false);
        }
    }, [pacienteId]);

    const handleViewDetail = (hcId) => {
        setSelectedHcId(hcId);
    };
    
    const handleBackToList = () => {
        setSelectedHcId(null);
    };
    
    if (selectedHcId) {
        return <HistoriaDetail 
            historiaId={selectedHcId} 
            onBack={handleBackToList}
            odontologoId={odontologoId}
            userRole={userRole}
        />;
    }

    if (loading) {
        return <p>Cargando historias clínicas...</p>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    return (
        <div className={styles.hcListContainer}>
            <div className={styles.headerContainer}>
                <h3>Historias Clínicas de {nombrePaciente} ({historiasFiltradas.length} de {historias.length})</h3>
                <button 
                    className={styles.toggleFiltrosButton}
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                >
                    {mostrarFiltros ? '▼ Ocultar Filtros' : '▶ Mostrar Filtros'}
                </button>
            </div>

            {/* PANEL DE FILTROS */}
            {mostrarFiltros && (
                <div className={styles.filtrosPanel}>
                    <div className={styles.filtrosGrid}>
                        <div className={styles.filtroItem}>
                            <label>Tratamiento:</label>
                            <input
                                type="text"
                                name="tratamiento"
                                value={filtros.tratamiento}
                                onChange={handleFiltroChange}
                                placeholder="Ej: Ortodoncia, Extracción..."
                            />
                        </div>

                        <div className={styles.filtroItem}>
                            <label>Odontólogo:</label>
                            <input
                                type="text"
                                name="odontologo"
                                value={filtros.odontologo}
                                onChange={handleFiltroChange}
                                placeholder="Nombre del odontólogo"
                            />
                        </div>

                        <div className={styles.filtroItem}>
                            <label>Desde:</label>
                            <input
                                type="date"
                                name="fechaDesde"
                                value={filtros.fechaDesde}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className={styles.filtroItem}>
                            <label>Hasta:</label>
                            <input
                                type="date"
                                name="fechaHasta"
                                value={filtros.fechaHasta}
                                onChange={handleFiltroChange}
                            />
                        </div>

                        <div className={styles.filtroItem}>
                            <label>Estado:</label>
                            <select
                                name="estado"
                                value={filtros.estado}
                                onChange={handleFiltroChange}
                            >
                                <option value="todas">Todas</option>
                                <option value="abiertas">Abiertas</option>
                                <option value="finalizadas">Finalizadas</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.filtrosAcciones}>
                        <button 
                            className={styles.limpiarFiltrosButton}
                            onClick={limpiarFiltros}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            )}

            {historiasFiltradas.length === 0 ? (
                <p className={styles.noResultados}>
                    {historias.length === 0 
                        ? 'No hay historias clínicas registradas para este paciente.'
                        : 'No se encontraron historias clínicas con los filtros aplicados.'
                    }
                </p>
            ) : (
                <table className={styles.hcTable}>
                    <thead>
                        <tr>
                            <th>Odontólogo</th>
                            <th>Tratamiento aplicado</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha de fin.</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historiasFiltradas.map((hc) => (
                            <tr key={hc.id}>
                                <td>{hc.odontologo_nombre}</td>
                                <td>
                                    {hc.detalles && hc.detalles.length > 0
                                        ? hc.detalles[0].tratamiento_nombre
                                        : 'Sin detalles'
                                    }
                                </td>
                                <td>{new Date(hc.fecha_inicio).toLocaleDateString()}</td>
                                <td>
                                    {hc.fecha_fin
                                        ? new Date(hc.fecha_fin).toLocaleDateString()
                                        : 'N/A'}
                                </td>
                                <td>
                                    <span className={hc.finalizado ? styles.finalizada : styles.abierta}>
                                        {hc.finalizado ? 'Finalizada' : 'Abierta'}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => handleViewDetail(hc.id)}
                                    >
                                        Ver
                                    </button>
                                    {(userRole === 'Odontólogo/a' || userRole === 'Admin') && (
                                        <button 
                                            className={styles.editButton}
                                            onClick={() => handleEdit(hc)} 
                                        >
                                            Editar
                                        </button>
                                    )}
                                    {(userRole === 'Odontólogo/a' || userRole === 'Admin') && (
                                        <button 
                                            className={hc.finalizado ? styles.reabrirButton : styles.finalizarButton}
                                            onClick={() => handleFinalizarHc(hc)}
                                        >
                                            {hc.finalizado ? 'Re-abrir' : 'Finalizar'}
                                        </button>
                                    )}
                                    <button
                                        className={styles.pagosButton}
                                        onClick={() => setPagosModalHc(hc)}
                                    >
                                        Pagos
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {(userRole === 'Odontólogo/a' || userRole === 'Admin') && (
                <button 
                    className={styles.newHcButton} 
                    onClick={() => setShowForm(true)} 
                >
                    + Nueva Historia Clínica
                </button>
            )}
            {showForm && (
                <HistoriaClinicaForm
                    pacienteId={pacienteId}
                    odontologoId={odontologoId}
                    isEditing={!!editingHc}
                    initialData={editingHc}
                    onClose={handleCancelEdit}
                    onSave={handleHcSave}
                />
            )}
            {pagosModalHc && (
                <PagosModal
                    historiaClinica={pagosModalHc}
                    currentPersonalId={odontologoId}
                    esOrtodoncia={esOrtodoncia(pagosModalHc)}
                    onClose={() => setPagosModalHc(null)}
                />
            )}
        </div>
    );
}