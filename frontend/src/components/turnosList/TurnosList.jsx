import React, { useEffect, useState, useCallback } from 'react';
import styles from './TurnosList.module.css';
import TurnosForm from '../turnosForm/TurnosForm';
import TurnoCard from '../turnosCard/TurnosCard'; 
// Importar APIs
import { 
    getTurnos, createTurno, updateTurno, 
    getHorariosFijos, deleteTurno
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
            const filteredOdontologos = odontologosData.filter(miembro => {
                // Condición: Es ACTIVO Y (Es Odontólogo O Es Admin)
                return miembro.activo === true && (
                    miembro.puesto_info.nombre_puesto === 'Odontólogo/a' || miembro.puesto_info.nombre_puesto === 'Admin'
                );
            });
            
            // =========================================================
            // 🚨 CORRECCIÓN 2: FILTRADO DE PACIENTES (Solo Activos)
            // =========================================================
            const filteredPacientes = pacientesData.filter(paciente => 
                paciente.activo === true
            );

            setTurnos(turnosData);
            setPacientesOptions(filteredPacientes);
            setOdontologosOptions(filteredOdontologos);
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

    const handleDelete = async (id) => {
        try {
            await deleteTurno(id);
            
            // Recargar la lista y resetear cualquier edición pendiente
            await loadData(); 
            setEditingTurno(null); 
        } catch (err) {
            console.error("Error al eliminar el turno:", err.response?.data || err);
            alert("Hubo un error al eliminar el turno. Intente nuevamente.");
        }
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
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// **Componente TurnoCard CORREGIDO**