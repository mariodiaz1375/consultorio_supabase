// src/components/HistoriaClinica/HistoriaClinicaList.jsx

import React, { useState, useEffect } from 'react';
import { getHistoriasClinicas, updateHistoriaClinica } from '../../api/historias.api'; 
import styles from './HistoriaClinicaList.module.css'; // Debes crear este archivo CSS
import HistoriaClinicaForm from '../historiaClinicaForm/HistoriaClinicaForm'
import HistoriaDetail from '../historiaClinicaDetail/HistoriaClinicaDetail';

// Componente para manejar la lista de Historias Clínicas de UN paciente
export default function HistoriaClinicaList({ pacienteId, nombrePaciente, odontologoId, userRole }) {
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedHcId, setSelectedHcId] = useState(null);
    const [editingHc, setEditingHc] = useState(null);

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
    
    const handleFinalizarHc = async (hc) => {
        // Lógica simple para finalizar/abrir directamente desde la lista (Opcional)
        // Podrías pedir confirmación aquí
        try {
            const dataToUpdate = { finalizado: !hc.finalizado };
            const updatedHc = await updateHistoriaClinica(hc.id, dataToUpdate);
            
            // Actualiza el estado de la lista
            setHistorias(prev => prev.map(item => 
                item.id === hc.id ? { ...item, finalizado: updatedHc.finalizado } : item
            ));
            alert(`Historia Clínica N° ${hc.id} ${updatedHc.finalizado ? 'Finalizada' : 'Re-abierta'} con éxito.`);
        } catch (err) {
            console.error("Error al cambiar estado de HC:", err);
            alert("Error al intentar cambiar el estado de la Historia Clínica.");
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
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => handleEdit(hc)} 
                                    >
                                        Editar
                                    </button>
                                    
                                    {/* ⭐ BOTÓN FINALIZAR/REABRIR */}
                                    <button 
                                        className={hc.finalizado ? styles.reabrirButton : styles.finalizarButton}
                                        onClick={() => handleFinalizarHc(hc)}
                                    >
                                        {hc.finalizado ? 'Re-abrir' : 'Finalizar'}
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
        </div>
    );
}