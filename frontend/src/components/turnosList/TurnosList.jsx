import React, { useEffect, useState, useCallback } from 'react';
import styles from './TurnosList.module.css';
import TurnosForm from '../turnosForm/TurnosForm';
import TurnoCard from '../turnosCard/TurnosCard'; 
// Importar APIs
import { 
    getTurnos, createTurno, updateTurno, 
    getHorariosFijos 
} from '../../api/turnos.api';
import { getPacientes } from '../../api/pacientes.api'; 
import { getPersonal } from '../../api/personal.api'; // Necesitas crear esta API

export default function TurnosList() {
    const [turnos, setTurnos] = useState([]);
    const [editingTurno, setEditingTurno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ESTADOS para los listados de opciones (Foreign Keys)
    const [pacientesOptions, setPacientesOptions] = useState([]);
    const [odontologosOptions, setOdontologosOptions] = useState([]);
    const [horariosFijosOptions, setHorariosFijosOptions] = useState([]);

    const isEditing = !!editingTurno;

    // ========================================================
    // 1. CARGA INICIAL DE DATOS
    // ========================================================

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar datos principales
            const [turnosData, pacientesData, odontologosData, horariosData] = await Promise.all([
                getTurnos(),
                getPacientes(), 
                getPersonal(), 
                getHorariosFijos(),
            ]);

            setTurnos(turnosData);
            setPacientesOptions(pacientesData);
            setOdontologosOptions(odontologosData);
            setHorariosFijosOptions(horariosData);

        } catch (err) {
            console.error("Error al cargar datos iniciales:", err);
            setError("Error al cargar los datos del sistema. Intente recargar.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ========================================================
    // 2. MANEJO DE FORMULARIO (Crear/Editar)
    // ========================================================

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                // Modo Edición
                await updateTurno(editingTurno.id, formData);
            } else {
                // Modo Creación
                await createTurno(formData);
            }
            // Recargar la lista después de la operación
            await loadData();
            // Limpiar el formulario
            setEditingTurno(null);
        } catch (err) {
            console.error("Error al guardar el turno:", err.response?.data || err);
            // Aquí puedes mostrar un mensaje de error más específico al usuario
            alert("Hubo un error al guardar el turno. Verifique los datos.");
        }
    };

    // Función para mapear el Turno (de la API) a la estructura del Formulario
    const handleEditStart = (turno) => {
        // Mapeamos los campos de visualización de la API (ej: 'paciente_nombre')
        // a los campos de ID que necesita el formulario para el selector (ej: 'paciente_id')
        setEditingTurno({
            id: turno.id,
            paciente_id: turno.paciente, // Usamos el ID
            odontologo_id: turno.odontologo, // Usamos el ID
            horario_turno_id: turno.horario_turno, // Usamos el ID
            fecha_turno: turno.fecha_turno,
            motivo: turno.motivo || '', // Asume que agregaste 'motivo' a la API
        });
    };

    const handleCancelEdit = () => {
        setEditingTurno(null);
    };

    // ========================================================
    // 3. RENDERIZADO
    // ========================================================

    if (loading) {
        return <div className={styles['loading']}>Cargando turnos y opciones...</div>;
    }

    if (error) {
        return <div className={styles['error']}>{error}</div>;
    }

    return (
        <div className={styles['turnos-container']}>
            
            {/* -------------------- COLUMNA IZQUIERDA: FORMULARIO -------------------- */}
            <div className={styles['form-column']}>
                <TurnosForm
                    onSubmit={handleFormSubmit}
                    pacientes={pacientesOptions}
                    odontologos={odontologosOptions}
                    horariosFijos={horariosFijosOptions}
                    initialData={editingTurno} // Pasamos la data mapeada
                    isEditing={isEditing}
                    turnosExistentes={turnos}
                />
                {isEditing && (
                    <button 
                        className={styles['cancel-edit-btn']} 
                        onClick={handleCancelEdit}
                    >
                        Cancelar Edición
                    </button>
                )}
            </div>

            {/* -------------------- COLUMNA DERECHA: LISTA -------------------- */}
            <div className={styles['list-column']}>
                <h2>Próximos Turnos ({turnos.length})</h2>
                <div className={styles['turnos-list']}>
                    {turnos.length === 0 ? (
                        <p>No hay turnos registrados.</p>
                    ) : (
                        turnos.map(turno => (
                            <TurnoCard 
                                key={turno.id} 
                                turno={turno} 
                                onEditStart={handleEditStart}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// **Componente TurnoCard CORREGIDO**