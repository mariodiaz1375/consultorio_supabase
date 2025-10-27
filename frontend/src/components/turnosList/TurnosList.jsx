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
    const [currentUser, setCurrentUser] = useState(null);

    // ESTADOS para los listados de opciones (Foreign Keys)
    const [pacientesOptions, setPacientesOptions] = useState([]);
    const [odontologosOptions, setOdontologosOptions] = useState([]);
    const [horariosFijosOptions, setHorariosFijosOptions] = useState([]);

    const [filterDate, setFilterDate] = useState('');      // Para filtrar por fecha
    const [filterOdontologo, setFilterOdontologo] = useState(''); // Para filtrar por odontólogo ID
    const [filterPaciente, setFilterPaciente] = useState('');   // Para filtrar por paciente ID

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
        
        // Cargar información del usuario desde localStorage
        const userInfoString = localStorage.getItem('user_info');
        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                setCurrentUser(userInfo);

                const userRole = userInfo?.puesto_info?.nombre_puesto;
                if (userRole === 'Odontólogo/a') {
                    // El ID del usuario está en el campo 'user' o 'id' de la API /me/. 
                    // Asumiremos que el campo que enlaza con el modelo de Personal es `id`.
                    // Si el backend usa `user` para el ID de personal, úsalo: userInfo.id
                    
                    // 🚨 IMPORTANTE: Asegúrate de que el ID es el correcto (string) para el filtro
                    setFilterOdontologo(String(userInfo.id));
                }
            } catch (e) {
                console.error("Error parsing user info from localStorage:", e);
                // Opcional: limpiar localStorage o forzar logout si la data es corrupta
            }
        }
    }, [loadData]);

    // Helper para obtener el rol de forma segura
    const userRole = currentUser?.puesto_info?.nombre_puesto;
    const isFilterBlocked = userRole === 'Odontólogo/a'
    const loggedInUserId = currentUser?.id;

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

    const filteredTurnos = React.useMemo(() => {
        return turnos.filter(turno => {
            let matches = true;

            // Filtro por Fecha (YYYY-MM-DD)
            if (filterDate) {
                // Asume que la fecha del turno ya está en formato YYYY-MM-DD
                matches = matches && (turno.fecha_turno === filterDate);
            }

            // Filtro por Odontólogo (ID)
            if (filterOdontologo) {
                // Compara el ID del odontólogo (que asumimos es un número)
                // Usamos == para comparación flexible si los tipos son distintos (string vs number)
                matches = matches && (String(turno.odontologo) === filterOdontologo);
            }

            // Filtro por Paciente (ID)
            if (filterPaciente) {
                // Compara el ID del paciente
                matches = matches && (String(turno.paciente) === filterPaciente);
            }

            return matches;
        });
    }, [turnos, filterDate, filterOdontologo, filterPaciente]);

    // ========================================================
    // 3. MANEJADORES DE CAMBIOS DE FILTRO
    // ========================================================

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
    };
    
    // Función para limpiar todos los filtros
    const handleClearFilters = () => {
        setFilterDate('');
        setFilterOdontologo('');
        setFilterPaciente('');
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
                    isFilterBlocked={isFilterBlocked}
                    loggedInUserId={loggedInUserId}
                />
            </div>

            {/* -------------------- COLUMNA DERECHA: LISTA -------------------- */}
            <div className={styles['list-column']}>

                {/* ======================= 🚨 CONTROLES DE FILTRO 🚨 ======================= */}
                <div className={styles['filter-bar']}>
                    <h3>Filtrar Turnos</h3>

                    {/* 1. FILTRO POR FECHA */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={handleFilterChange(setFilterDate)}
                        className={styles['filter-input']}
                    />

                    {/* 2. FILTRO POR ODONTÓLOGO */}
                    <select
                        value={filterOdontologo}
                        onChange={handleFilterChange(setFilterOdontologo)}
                        className={styles['filter-select']}
                        disabled={isFilterBlocked}
                    >
                        {isFilterBlocked ? (
                            // Mostrar solo la opción del odontólogo logueado si está bloqueado
                            odontologosOptions
                                .filter(o => String(o.id) === filterOdontologo)
                                .map(o => (
                                    <option key={o.id} value={o.id}>
                                        {`${o.nombre} ${o.apellido} (Mi cuenta)`}
                                    </option>
                                ))
                        ) : (
                            // Mostrar todas las opciones si no está bloqueado (Admin o no Odontólogo)
                            <>
                                <option value="">Todos los Odontólogos</option>
                                {odontologosOptions.map(o => (
                                    <option key={o.id} value={o.id}>
                                        {`${o.nombre} ${o.apellido}`}
                                    </option>
                                ))}
                            </>
                        )}
                    </select>

                    {/* 3. FILTRO POR PACIENTE */}
                    <select
                        value={filterPaciente}
                        onChange={handleFilterChange(setFilterPaciente)}
                        className={styles['filter-select']}
                    >
                        <option value="">Todos los Pacientes</option>
                        {pacientesOptions.map(p => (
                            <option key={p.id} value={p.id}>
                                {`${p.nombre} ${p.apellido}`}
                            </option>
                        ))}
                    </select>

                    {/* Botón para limpiar filtros */}
                    <button onClick={handleClearFilters} className={styles['clear-btn']}>
                        Limpiar Filtros
                    </button>
                </div>
                {/* ======================================================================= */}

                <h2>Próximos Turnos ({filteredTurnos.length})</h2>
                <div className={styles['turnos-list']}>
                    {filteredTurnos.length === 0 ? (
                        <p>No hay turnos registrados que coincidan con los filtros.</p>
                    ) : (
                        filteredTurnos.map(turno => (
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