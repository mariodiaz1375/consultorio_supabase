// src/components/HistoriaClinica/HistoriaClinicaList.jsx

import React, { useState, useEffect } from 'react';
import { getHistoriasClinicas, updateHistoriaClinica } from '../../api/historias.api'; 
import styles from './HistoriaClinicaList.module.css'; // Debes crear este archivo CSS
import HistoriaClinicaForm from '../historiaClinicaForm/HistoriaClinicaForm'
import HistoriaDetail from '../historiaClinicaDetail/HistoriaClinicaDetail';
import PagosModal from '../pagosModal/PagosModal';

// Componente para manejar la lista de Historias Clínicas de UN paciente
export default function HistoriaClinicaList({ pacienteId, nombrePaciente, odontologoId, userRole }) {
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedHcId, setSelectedHcId] = useState(null);
    const [editingHc, setEditingHc] = useState(null);
    // const [refreshKey, setRefreshKey] = useState(0);
    const [pagosModalHc, setPagosModalHc] = useState(null);

    // 🚨 NUEVA FUNCIÓN: Determina si la HC contiene tratamiento de ortodoncia
    const esOrtodoncia = (historiaClinica) => {
        if (!historiaClinica.detalles || historiaClinica.detalles.length === 0) {
            return false;
        }
        
        // Busca si algún detalle tiene un tratamiento con nombre que incluya "ortodoncia"
        return historiaClinica.detalles.some(detalle => {
            const tratamientoNombre = detalle.tratamiento_nombre?.toLowerCase() || '';
            return tratamientoNombre.includes('ortodoncia');
        });
    };

    const handleHcSave = (nuevaHc) => {
        // Si se crea una nueva, la añadimos a la lista
        if (!editingHc) {
            setHistorias(prev => [nuevaHc, ...prev]);
        } else {
            // Si se edita, la reemplazamos
            setHistorias(prev => prev.map(hc => hc.id === nuevaHc.id ? nuevaHc : hc));
        }
        setShowForm(false);
        setEditingHc(null); // Limpiar el estado de edición
    };

    const handleEdit = (hc) => {
        setEditingHc(hc); // Guarda el objeto HC para pasar al formulario
        setShowForm(true); // Abre el formulario
    };

    const handleCancelEdit = () => {
        setEditingHc(null); // Limpia el objeto
        setShowForm(false); // Cierra el formulario
    };
    
    const handleFinalizarHc = async (historia) => {
        try {
            // 1. Determinar el nuevo estado
            const nuevoFinalizado = !historia.finalizado;
            
            // Determinar la fecha de finalización (solo si se está finalizando)
            const nuevaFechaFin = nuevoFinalizado ? new Date().toISOString().split('T')[0] : null; 

            const updatedData = {
                // Se envían solo los campos a modificar
                finalizado: nuevoFinalizado,
                fecha_fin: nuevaFechaFin, 
                // Opcional: descripción
                // descripcion: historia.descripcion // Asegúrate de incluir campos requeridos si la API lo necesita
            };
            
            // 2. Llamar a la API de actualización
            // La API debe devolver el objeto de Historia Clínica ya actualizado (updatedHc)
            const updatedHc = await updateHistoriaClinica(historia.id, updatedData);

            // 3. ✅ ACTUALIZACIÓN CLAVE: Reemplazar el objeto antiguo en el estado
            setHistorias(prev => 
                prev.map(hc => hc.id === updatedHc.id ? updatedHc : hc)
            );

            // Opcional: Notificación de éxito
            console.log(`Historia Clínica ${historia.id} actualizada.`);
        } catch (err) {
            console.error("Error al finalizar/reabrir HC:", err);
            // Manejo de error
            // setError("Error al actualizar la Historia Clínica.");
        }
    };

    // useEffect se dispara cuando el pacienteId cambia
    useEffect(() => {
        const fetchHistorias = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Obtener TODAS las historias
                const allHistorias = await getHistoriasClinicas();
                
                // 2. Filtrar solo las que pertenecen al paciente actual
                // (Podrías crear un endpoint en Django que filtre por paciente_id, 
                // pero por simplicidad de desarrollo inicial, filtramos aquí).
                const historiasFiltradas = allHistorias.filter(
                    (hc) => hc.paciente === pacienteId
                );

                setHistorias(historiasFiltradas);
            } catch (err) {
                console.error("Error al cargar las historias clínicas:", err);
                // Muestra un mensaje amigable al usuario
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
    }, [pacienteId]); // Dependencia clave

    const handleViewDetail = (hcId) => {
        setSelectedHcId(hcId); // Muestra el componente de detalle
    };
    
    const handleBackToList = () => {
        setSelectedHcId(null); // Vuelve a mostrar la lista
        // Opcional: Re-fetch para actualizar la lista después de volver
        // fetchHistorias(); 
    };
    
    // 1. Mostrar el Detalle si hay un ID seleccionado
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
            <h3>Historias Clínicas de {nombrePaciente} ({historias.length} en total)</h3>

            {historias.length === 0 ? (
                <p>No hay historias clínicas registradas para este paciente.</p>
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
                        {historias.map((hc) => (
                            <tr key={hc.id}>
                                <td>{hc.odontologo_nombre}</td>
                                <td>
                                    {hc.detalles && hc.detalles.length > 0
                                        ? hc.detalles[0].tratamiento_nombre
                                        : 'Sin detalles'
                                    }
                                </td>
                                <td>{new Date(hc.fecha_inicio).toLocaleDateString()}</td>
                                {/* Mostrar el último tratamiento registrado */}
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
                                    {/* Aquí se agregará la lógica para ver el detalle */}
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
                                        className={styles.pagosButton} // Necesitaremos este estilo
                                        onClick={() => setPagosModalHc(hc)} // Pasa el objeto HC completo
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
            {/* Renderizado Condicional del Modal */}
            {showForm && (
                <HistoriaClinicaForm
                    pacienteId={pacienteId}
                    odontologoId={odontologoId}
                    isEditing={!!editingHc} // Pasa true si hay un objeto en editingHc
                    initialData={editingHc} // Pasa el objeto para precargar
                    onClose={handleCancelEdit} // Usamos el manejador de cancelación
                    onSave={handleHcSave}
                />
            )}
            {pagosModalHc && (
                <PagosModal
                    historiaClinica={pagosModalHc} // Pasa el objeto HC
                    currentPersonalId={odontologoId}
                    esOrtodoncia={esOrtodoncia(pagosModalHc)}
                    onClose={() => setPagosModalHc(null)}
                />
            )}
        </div>
    );
}