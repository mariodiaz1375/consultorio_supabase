import React, { useEffect, useState, useCallback } from 'react';
import styles from './TurnosList.module.css';
import TurnosForm from '../turnosForm/TurnosForm';
import TurnoCard from '../turnosCard/TurnosCard'; 
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
// Importar APIs
import { 
    getTurnos, createTurno, updateTurno, 
    getHorariosFijos, updateHorarioFijo, deleteHorarioFijo, createHorarioFijo,
    deleteTurno, getEstadosTurno
} from '../../api/turnos.api';
import { getPacientes } from '../../api/pacientes.api'; 
import { getPersonal } from '../../api/personal.api'; // Necesitas crear esta API

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};
const TODAY_DATE = getTodayDateString();

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
    const [estadosTurnoOptions, setEstadosTurnoOptions] = useState([]);
    const [horariosOptions, setHorariosOptions] = useState([]);
    const [isHorarioModalOpen, setIsHorarioModalOpen] = useState(false);

    const [filterDate, setFilterDate] = useState(TODAY_DATE);      // Para filtrar por fecha
    const [filterOdontologo, setFilterOdontologo] = useState(''); // Para filtrar por odontólogo ID
    const [filterPaciente, setFilterPaciente] = useState('');   // Para filtrar por paciente ID
    const [filterEstado, setFilterEstado] = useState('');
    const [selectedTurnos, setSelectedTurnos] = useState(new Set()); // 🚨 NUEVO ESTADO

    const isEditing = !!editingTurno;

    const handleToggleSelect = useCallback((id, isSelected) => {
        setSelectedTurnos(prevSelected => {
            const newSet = new Set(prevSelected);
            if (isSelected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    }, []);

    // Función para seleccionar/deseleccionar todos los turnos visibles
    const handleToggleSelectAll = () => {
        const allVisibleIds = filteredTurnos.map(t => t.id);
        
        if (selectedTurnos.size > 0 && selectedTurnos.size === allVisibleIds.length) {
            // Deseleccionar todo
            setSelectedTurnos(new Set());
        } else {
            // Seleccionar todo (de la lista visible)
            setSelectedTurnos(new Set(allVisibleIds));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTurnos.size === 0) return;

        if (!window.confirm(`¿Está seguro de que desea eliminar ${selectedTurnos.size} turno(s) seleccionado(s)? Esta acción es irreversible.`)) {
            return;
        }

        try {
            // Convertimos el Set a Array para el mapeo
            const deletePromises = Array.from(selectedTurnos).map(id => deleteTurno(id));
            await Promise.all(deletePromises);

            alert(`${selectedTurnos.size} turno(s) eliminados correctamente.`);
            setSelectedTurnos(new Set()); // Limpiar selección
            await loadData(); // Recargar la lista
        } catch (err) {
            console.error("Error al eliminar turnos en lote:", err);
            alert("Hubo un error al eliminar los turnos. Intente nuevamente.");
        }
    };
    
    // 🚨 NUEVA FUNCIÓN: Cancelar Múltiples Turnos (Estado ID 3 es 'Cancelado'?)
    // Asumo que el ID para "Cancelado" es conocido (ej: ID 4). 
    // Revisa tu lista `estadosTurnoOptions` para el ID correcto.
    const CANCELADO_ESTADO_ID = '1'; // 🚨 DEBES CONFIRMAR ESTE ID

    const handleBulkCancel = async () => {
        if (selectedTurnos.size === 0) return;

        if (!window.confirm(`¿Está seguro de que desea CANCELAR ${selectedTurnos.size} turno(s) seleccionado(s)?`)) {
            return;
        }

        try {
            // Preparamos los datos para la actualización: solo el nuevo estado
            const updatePayload = {
                estado_turno: CANCELADO_ESTADO_ID, 
            };
            
            const updatePromises = Array.from(selectedTurnos).map(id => 
                updateTurno(id, updatePayload)
            );
            await Promise.all(updatePromises);

            alert(`${selectedTurnos.size} turno(s) cancelados correctamente.`);
            setSelectedTurnos(new Set()); // Limpiar selección
            await loadData(); // Recargar la lista
        } catch (err) {
            console.error("Error al cancelar turnos en lote:", err);
            alert("Hubo un error al cancelar los turnos. Verifique los datos.");
        }
    };

    // ========================================================
    // 1. CARGA INICIAL DE DATOS
    // ========================================================

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar datos principales
            const [turnosData, pacientesData, odontologosData, horariosData, estadosData] = await Promise.all([
                getTurnos(),
                getPacientes(), 
                getPersonal(), 
                getHorariosFijos(),
                getEstadosTurno(),
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
            setEstadosTurnoOptions(estadosData);

        } catch (err) {
            console.error("Error al cargar datos iniciales:", err);
            setError("Error al cargar los datos del sistema. Intente recargar.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHorarios = useCallback(async () => {
        try {
            // Asumo que tienes una función getHorariosFijos importada.
            const data = await getHorariosFijos(); 
            setHorariosOptions(data);
        } catch (error) {
            console.error("Error al cargar horarios:", error);
        }
    }, []);

    const handleManipulateHorarioList = async (action, id, newName) => {
        try {
            const data = { hora: newName }; 
            
            switch (action) {
                case 'add':
                    // Asumo que tienes createHorarioFijo importada.
                    await createHorarioFijo(data); 
                    alert(`Horario "${newName}" registrado con éxito.`);
                    break;
                case 'edit':
                    // Asumo que tienes updateHorarioFijo importada.
                    await updateHorarioFijo(id, data); 
                    alert(`Horario "${newName}" (ID: ${id}) editado con éxito.`);
                    break;
                case 'delete':
                    // Asumo que tienes deleteHorarioFijo importada.
                    if (window.confirm(`¿Estás seguro de que quieres eliminar el horario ID ${id}?`)) {
                        await deleteHorarioFijo(id);
                        alert(`Horario ID ${id} eliminado con éxito.`);
                    }
                    break;
                default:
                    break;
            }

            
         

        } catch (error) {
            // 🚨 MANEJO DE ERRORES CLAVE
            
            let errorMessage = `Error al ejecutar ${action} en Horarios.`;

            // 1. Verificar si el error tiene una respuesta (es un error HTTP de Axios)
            if (error.response) {
                // 2. Intentar obtener el mensaje detallado del error 400/500
                // Lo enviamos como {"detail": "..."} desde Django
                if (error.response.data && error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else {
                    // Si no hay mensaje 'detail', usar el estado HTTP
                    errorMessage = `Error ${error.response.status}: ${error.response.statusText}.`;
                }
            }
            
            // Mostrar la alerta al usuario
            alert(errorMessage);
            console.error(errorMessage, error);
        } finally {
            // Recargar la lista de horarios para reflejar los cambios (o la falta de ellos)
            loadHorarios();
            loadData();
        }
    };

    useEffect(() => {
        loadData();
        loadHorarios();
        
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
    }, [loadHorarios, loadData]);

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
        const filtered = turnos.filter(turno => {
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

            if (filterEstado) {
                
                matches = matches && (String(turno.estado_turno) === filterEstado);
            }

            return matches;
        });

        // 🚨 PASO DE ORDENAMIENTO: Ordenar por Fecha y luego por Hora (Ascendente)
        return filtered.sort((a, b) => {
            // 1. ORDENAR POR FECHA (a.fecha_turno es YYYY-MM-DD)
            if (a.fecha_turno < b.fecha_turno) {
                return -1; // 'a' va antes que 'b'
            }
            if (a.fecha_turno > b.fecha_turno) {
                return 1; // 'b' va antes que 'a'
            }

            // 2. SI LAS FECHAS SON IGUALES, ORDENAR POR HORA (a.horario_display es HH:MM)
            if (a.horario_display < b.horario_display) {
                return -1; // 'a' (hora temprana) va antes que 'b'
            }
            if (a.horario_display > b.horario_display) {
                return 1; // 'b' (hora temprana) va antes que 'a'
            }
            
            // 3. SI FECHA Y HORA SON IGUALES, no hay cambio de orden (o usa el ID como desempate)
            return a.id - b.id; // Desempate por ID
        });

    }, [turnos, filterDate, filterOdontologo, filterPaciente, filterEstado]);

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
        setFilterEstado('');
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
    const handleEdit = (turno) => {
        setEditingTurno(turno);
        // Opcional: Desplazarse al formulario
        // window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleCancelEdit = () => {
        setEditingTurno(null); // Esto saca a la lista del modo edición
    };

    return (
        <div className={styles['turnos-container']}>

            {/* 🚨 MODAL PARA HORARIOS (Nuevo) */}
            <ModalAdd
                isOpen={isHorarioModalOpen}
                onClose={() => setIsHorarioModalOpen(false)}
                title="Administrar Horarios Fijos"
            >
                <ListManagerContent 
                    // 📢 CLAVE: Pasar el estado existente.
                    list={horariosOptions}
                    nameField="hora" // Ajusta este campo
                    onAdd={(name) => handleManipulateHorarioList('add', null, name)}
                    onEdit={(id, name) => handleManipulateHorarioList('edit', id, name)}
                    onDelete={(id) => handleManipulateHorarioList('delete', id)}
                />
            </ModalAdd>
            
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
                    onCancel={handleCancelEdit}
                    estadosTurno={estadosTurnoOptions}
                    onAddHorarioClick={() => setIsHorarioModalOpen(true)}
                    //turno={turno}
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

                    {/* 🚨 NUEVO FILTRO POR ESTADO 🚨 */}
                    <select
                        className={styles['filter-select']}
                        value={filterEstado}
                        onChange={handleFilterChange(setFilterEstado)}
                    >
                        <option value="">Todos los Estados</option>
                        {/* Usamos estadosTurnoOptions y la propiedad correcta 'nombre_est_tur' */}
                        {estadosTurnoOptions.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.nombre_est_tur}
                            </option>
                        ))}
                    </select>

                    {/* Botón para limpiar filtros */}
                    <button onClick={handleClearFilters} className={styles['clear-btn']}>
                        Limpiar Filtros
                    </button>
                    {/* ======================= 🚨 NUEVOS BOTONES DE ACCIÓN POR LOTE 🚨 ======================= */}
                    <div className={styles['bulk-actions']}> 

                            {/* Checkbox para SELECCIONAR/DESELECCIONAR TODOS */}
                        <label className={styles['select-all-label']}>
                            <input
                                type="checkbox"
                                checked={selectedTurnos.size > 0 && selectedTurnos.size === filteredTurnos.length}
                                onChange={handleToggleSelectAll}
                            />
                            Seleccionar Todos
                        </label>

                            {/* Botón de Cancelación */}
                        <button 
                            onClick={handleBulkCancel} 
                            className={styles['cancel-bulk-btn']} 
                            disabled={selectedTurnos.size === 0}
                        >
                            Cancelar ({selectedTurnos.size})
                        </button>

                            {/* Botón de Eliminación */}
                        <button 
                            onClick={handleBulkDelete} 
                            className={styles['delete-bulk-btn']} 
                            disabled={selectedTurnos.size === 0}
                        >
                            Eliminar ({selectedTurnos.size})
                        </button>
                    </div>
                        {/* ======================================================================================= */}
                </div>
                {/* ======================================================================= */}

                <h2>Turnos Listados ({filteredTurnos.length})</h2>
                <div className={styles['turnos-list']}>
                    {filteredTurnos.length === 0 ? (
                        <p>No hay turnos registrados que coincidan con los filtros.</p>
                    ) : (
                        filteredTurnos.map(turno => (
                            <TurnoCard 
                                key={turno.id} 
                                turno={turno} 
                                onDelete={handleDelete}
                                onEdit={() => handleEdit(turno)}
                                isSelected={selectedTurnos.has(turno.id)} 
                                onToggleSelect={handleToggleSelect}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// **Componente TurnoCard CORREGIDO**