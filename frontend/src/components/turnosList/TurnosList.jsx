import React, { useEffect, useState, useCallback } from 'react';
import styles from './TurnosList.module.css';
import TurnosForm from '../turnosForm/TurnosForm';
import TurnoCard from '../turnosCard/TurnosCard'; 
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';
// Importar APIs
import { 
    getTurnos, createTurno, updateTurno, 
    getHorariosFijos, updateHorarioFijo, deleteHorarioFijo, createHorarioFijo,
    deleteTurno, getEstadosTurno
} from '../../api/turnos.api';
import { getPacientes } from '../../api/pacientes.api'; 
import { getPersonal } from '../../api/personal.api';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};
const TODAY_DATE = getTodayDateString();

export default function TurnosList() {
    const { showSuccess, showError } = useAlert();
    const { showConfirm } = useConfirm();
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

    const [filterDate, setFilterDate] = useState(TODAY_DATE);
    const [filterOdontologo, setFilterOdontologo] = useState('');
    const [filterPaciente, setFilterPaciente] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [selectedTurnos, setSelectedTurnos] = useState(new Set());

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

    const handleToggleSelectAll = () => {
        const allVisibleIds = filteredTurnos.map(t => t.id);
        
        if (selectedTurnos.size > 0 && selectedTurnos.size === allVisibleIds.length) {
            setSelectedTurnos(new Set());
        } else {
            setSelectedTurnos(new Set(allVisibleIds));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTurnos.size === 0) return;

        const confirmed = await showConfirm(`¿Está seguro de que desea eliminar ${selectedTurnos.size} turno(s) seleccionado(s)? Esta acción es irreversible.`);
        
        if (!confirmed) {
            return;
        }

        try {
            if (currentUser?.id) {
                const updatePromises = Array.from(selectedTurnos).map(id => 
                    updateTurno(id, { modificado_por: currentUser.id })
                );
                await Promise.all(updatePromises);
            }
            
            const deletePromises = Array.from(selectedTurnos).map(id => deleteTurno(id));
            await Promise.all(deletePromises);

            showSuccess(`${selectedTurnos.size} turno(s) eliminados correctamente.`);
            setSelectedTurnos(new Set());
            await loadData();
        } catch (err) {
            console.error("Error al eliminar turnos en lote:", err);
            showError("Hubo un error al eliminar los turnos. Intente nuevamente.");
        }
    };
    
    const CANCELADO_ESTADO_ID = '1';

    const handleBulkCancel = async () => {
        if (selectedTurnos.size === 0) return;

        const confirmed = await showConfirm(`¿Está seguro de que desea CANCELAR ${selectedTurnos.size} turno(s) seleccionado(s)?`);
        
        if (!confirmed) {
            return;
        }

        try {
            const updatePayload = {
                estado_turno: CANCELADO_ESTADO_ID, 
            };
            
            const updatePromises = Array.from(selectedTurnos).map(id => 
                updateTurno(id, updatePayload)
            );
            await Promise.all(updatePromises);

            showSuccess(`${selectedTurnos.size} turno(s) cancelados correctamente.`);
            setSelectedTurnos(new Set());
            await loadData();
        } catch (err) {
            console.error("Error al cancelar turnos en lote:", err);
            showError("Hubo un error al cancelar los turnos. Verifique los datos.");
        }
    };

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [turnosData, pacientesData, odontologosData, horariosData, estadosData] = await Promise.all([
                getTurnos(),
                getPacientes(), 
                getPersonal(), 
                getHorariosFijos(),
                getEstadosTurno(),
            ]);
            
            const filteredOdontologos = odontologosData.filter(miembro => {
                return miembro.activo === true && (
                    miembro.puesto_info.nombre_puesto === 'Odontólogo/a' || miembro.puesto_info.nombre_puesto === 'Admin'
                );
            });
            
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
                    await createHorarioFijo(data); 
                    showSuccess(`Horario "${newName}" registrado con éxito.`);
                    break;
                case 'edit':
                    await updateHorarioFijo(id, data); 
                    showSuccess(`Horario "${newName}" (ID: ${id}) editado con éxito.`);
                    break;
                case 'delete':
                    const confirmed = await showConfirm(`¿Estás seguro de que quieres eliminar el horario ID ${id}?`);
                    if (confirmed) {
                        await deleteHorarioFijo(id);
                        showSuccess(`Horario ID ${id} eliminado con éxito.`);
                    }
                    break;
                default:
                    break;
            }

            await loadHorarios();
            
        } catch (error) {
            let errorMessage = `Error al ejecutar ${action} en Horarios.`;

            if (error.response) {
                if (error.response.data && error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else {
                    errorMessage = `Error ${error.response.status}: El formato de hora es incorrecto.`;
                }
            }
            
            showError(errorMessage);
            console.error(errorMessage, error);
        } finally {
            loadHorarios();
            loadData();
        }
    };

    useEffect(() => {
        loadData();
        loadHorarios();
        
        const userInfoString = localStorage.getItem('user_info');
        if (userInfoString) {
            try {
                const userInfo = JSON.parse(userInfoString);
                setCurrentUser(userInfo);

                const userRole = userInfo?.puesto_info?.nombre_puesto;
                if (userRole === 'Odontólogo/a') {
                    setFilterOdontologo(String(userInfo.id));
                }
            } catch (e) {
                console.error("Error parsing user info from localStorage:", e);
            }
        }
    }, [loadHorarios, loadData]);

    const userRole = currentUser?.puesto_info?.nombre_puesto;
    const isFilterBlocked = userRole === 'Odontólogo/a'
    const loggedInUserId = currentUser?.id;

    // 🆕 FUNCIÓN MEJORADA CON ALERTAS DETALLADAS
    const handleFormSubmit = async (formData) => {
        try {
            const payload = {
                ...formData,
                modificado_por: currentUser?.id
            };

            // Obtener nombres para la alerta
            const paciente = pacientesOptions.find(p => p.id === payload.paciente);
            const odontologo = odontologosOptions.find(o => o.id === payload.odontologo);
            const horario = horariosFijosOptions.find(h => h.id === payload.horario_turno);
            
            const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
            const nombreOdontologo = odontologo ? `${odontologo.nombre} ${odontologo.apellido}` : 'Odontólogo';
            const horaFormateada = horario ? horario.hora : 'N/A';

            if (isEditing) {
                // Modo Edición
                await updateTurno(editingTurno.id, payload);
                // 🆕 ALERTA DETALLADA DE ÉXITO PARA EDICIÓN
                showSuccess(`✅ Turno actualizado: ${nombrePaciente} con ${nombreOdontologo} - ${payload.fecha_turno} a las ${horaFormateada}`);
            } else {
                // Modo Creación
                await createTurno(payload);
                // 🆕 ALERTA DETALLADA DE ÉXITO PARA CREACIÓN
                showSuccess(`✅ Turno creado: ${nombrePaciente} con ${nombreOdontologo} - ${payload.fecha_turno} a las ${horaFormateada}`);
            }
            
            await loadData();
            setEditingTurno(null);
            
        } catch (err) {
            console.error("Error al guardar el turno:", err.response?.data || err);
            showError("Hubo un error al guardar el turno. Verifique los datos.");
        }
    };

    const handleDelete = async (id) => {
        try {
            if (currentUser?.id) {
                await updateTurno(id, { modificado_por: currentUser.id });
            }
            
            await deleteTurno(id);
            
            await loadData(); 
            setEditingTurno(null); 
        } catch (err) {
            console.error("Error al eliminar el turno:", err.response?.data || err);
            showError("Hubo un error al eliminar el turno. Intente nuevamente.");
        }
    };

    const filteredTurnos = React.useMemo(() => {
        const filtered = turnos.filter(turno => {
            let matches = true;

            if (filterDate) {
                matches = matches && (turno.fecha_turno === filterDate);
            }

            if (filterOdontologo) {
                matches = matches && (String(turno.odontologo) === filterOdontologo);
            }

            if (filterPaciente) {
                matches = matches && (String(turno.paciente) === filterPaciente);
            }

            if (filterEstado) {
                matches = matches && (String(turno.estado_turno) === filterEstado);
            }

            return matches;
        });

        return filtered.sort((a, b) => {
            if (a.fecha_turno < b.fecha_turno) {
                return -1;
            }
            if (a.fecha_turno > b.fecha_turno) {
                return 1;
            }

            if (a.horario_display < b.horario_display) {
                return -1;
            }
            if (a.horario_display > b.horario_display) {
                return 1;
            }
            
            return a.id - b.id;
        });

    }, [turnos, filterDate, filterOdontologo, filterPaciente, filterEstado]);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
    };
    
    const handleClearFilters = () => {
        if (isFilterBlocked) {
            setFilterDate(TODAY_DATE);
            setFilterPaciente('');
            setFilterEstado('');
        } else {
            setFilterDate(TODAY_DATE);
            setFilterOdontologo('');
            setFilterPaciente('');
            setFilterEstado('');
        }
    };

    if (loading) {
        return <div className={styles['loading']}>Cargando turnos y opciones...</div>;
    }

    if (error) {
        return <div className={styles['error']}>{error}</div>;
    }
    
    const handleEdit = (turno) => {
        setEditingTurno(turno);
    };
    
    const handleCancelEdit = () => {
        setEditingTurno(null);
    };

    return (
        <div className={styles['turnos-container']}>

            <ModalAdd
                isOpen={isHorarioModalOpen}
                onClose={() => setIsHorarioModalOpen(false)}
                title="Administrar Horarios Fijos"
            >
                <ListManagerContent 
                    list={horariosOptions}
                    nameField="hora"
                    onAdd={(name) => handleManipulateHorarioList('add', null, name)}
                    onEdit={(id, name) => handleManipulateHorarioList('edit', id, name)}
                    onDelete={(id) => handleManipulateHorarioList('delete', id)}
                    placeHolder={'Ingrese la hora'}
                />
            </ModalAdd>
            
            <div className={styles['form-column']}>
                <TurnosForm
                    onSubmit={handleFormSubmit}
                    pacientes={pacientesOptions}
                    odontologos={odontologosOptions}
                    horariosFijos={horariosFijosOptions}
                    initialData={editingTurno}
                    isEditing={isEditing}
                    turnosExistentes={turnos}
                    isFilterBlocked={isFilterBlocked}
                    loggedInUserId={loggedInUserId}
                    onCancel={handleCancelEdit}
                    estadosTurno={estadosTurnoOptions}
                    onAddHorarioClick={() => setIsHorarioModalOpen(true)}
                />
            </div>

            <div className={styles['list-column']}>

                <div className={styles['filter-bar']}>
                    <h3>Filtrar Turnos</h3>

                    <input
                        type="date"
                        value={filterDate}
                        onChange={handleFilterChange(setFilterDate)}
                        className={styles['filter-input']}
                    />

                    <select
                        value={filterOdontologo}
                        onChange={handleFilterChange(setFilterOdontologo)}
                        className={styles['filter-select']}
                        disabled={isFilterBlocked}
                    >
                        {isFilterBlocked ? (
                            odontologosOptions
                                .filter(o => String(o.id) === filterOdontologo)
                                .map(o => (
                                    <option key={o.id} value={o.id}>
                                        {`${o.nombre} ${o.apellido} (Mi cuenta)`}
                                    </option>
                                ))
                        ) : (
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

                    <select
                        className={styles['filter-select']}
                        value={filterEstado}
                        onChange={handleFilterChange(setFilterEstado)}
                    >
                        <option value="">Todos los Estados</option>
                        {estadosTurnoOptions.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.nombre_est_tur}
                            </option>
                        ))}
                    </select>

                    <button onClick={handleClearFilters} className={styles['clear-btn']}>
                        Limpiar Filtros
                    </button>
                    
                    <div className={styles['bulk-actions']}> 
                        <label className={styles['select-all-label']}>
                            <input
                                type="checkbox"
                                checked={selectedTurnos.size > 0 && selectedTurnos.size === filteredTurnos.length}
                                onChange={handleToggleSelectAll}
                            />
                            Seleccionar Todos
                        </label>

                        <button 
                            onClick={handleBulkCancel} 
                            className={styles['cancel-bulk-btn']} 
                            disabled={selectedTurnos.size === 0}
                        >
                            Cancelar ({selectedTurnos.size})
                        </button>

                        <button 
                            onClick={handleBulkDelete} 
                            className={styles['delete-bulk-btn']} 
                            disabled={selectedTurnos.size === 0}
                        >
                            Eliminar ({selectedTurnos.size})
                        </button>
                    </div>
                </div>

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