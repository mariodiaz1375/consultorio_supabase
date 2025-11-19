// src/components/turnosList/TurnosList.jsx

import React, { useEffect, useState, useCallback } from 'react';
import Select from 'react-select'; 
import styles from './TurnosList.module.css';
import TurnosForm from '../turnosForm/TurnosForm';
import TurnoCard from '../turnosCard/TurnosCard'; 
import ModalAdd from '../modalAdd/ModalAdd';
import ListManagerContent from '../listaMaestra/ListManagerContent';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';
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

const filterSelectStyles = {
    container: (base) => ({
        ...base,
        flexGrow: 1,
        minWidth: '250px',
        maxWidth: '400px',
    }),
    control: (base, state) => ({
        ...base,
        borderColor: '#1a1f36',
        borderWidth: '2px',
        borderRadius: '8px',
        minHeight: '43px', 
        boxShadow: state.isFocused ? '0 0 0 3px rgba(26, 31, 54, 0.2)' : 'none',
        '&:hover': { borderColor: '#0f1419' }
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#1a1f36' : state.isFocused ? 'rgba(26, 31, 54, 0.1)' : 'white',
        color: state.isSelected ? 'white' : '#1a1f36',
        cursor: 'pointer',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#1a1f36',
        fontWeight: '500',
    }),
    menuPortal: (base) => ({ 
        ...base, 
        zIndex: 9999 
    })
};

export default function TurnosList() {
    const { showSuccess, showError } = useAlert();
    const { showConfirm } = useConfirm();
    const [turnos, setTurnos] = useState([]);
    const [editingTurno, setEditingTurno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

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

    const pacienteFilterOptions = React.useMemo(() => {
        return pacientesOptions.map(p => ({
            value: p.id,
            label: `${p.nombre} ${p.apellido} (DNI: ${p.dni})`
        }));
    }, [pacientesOptions]);

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
        if (!confirmed) return;

        try {
            // Aseguramos que se registre quién eliminó antes de borrar
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
        if (!confirmed) return;

        try {
            // 🚨 CORRECCIÓN: Añadimos modificado_por al payload
            const updatePayload = { 
                estado_turno: CANCELADO_ESTADO_ID,
                modificado_por: currentUser?.id // <--- Esto faltaba
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

    const ATENDIDO_ESTADO_ID = '2'; 

    const handleBulkAttended = async () => {
        if (selectedTurnos.size === 0) return;

        const confirmed = await showConfirm(`¿Está seguro de que desea marcar como ATENDIDO ${selectedTurnos.size} turno(s) seleccionado(s)?`);
        if (!confirmed) return;

        try {
            // 🚨 CORRECCIÓN: Añadimos modificado_por al payload
            const updatePayload = { 
                estado_turno: ATENDIDO_ESTADO_ID,
                modificado_por: currentUser?.id // <--- Esto faltaba
            };

            const updatePromises = Array.from(selectedTurnos).map(id => 
                updateTurno(id, updatePayload)
            );
            await Promise.all(updatePromises);

            showSuccess(`${selectedTurnos.size} turno(s) marcados como atendidos correctamente.`);
            setSelectedTurnos(new Set());
            await loadData();
        } catch (err) {
            console.error("Error al marcar turnos como atendidos:", err);
            showError("Hubo un error al marcar los turnos como atendidos. Verifique los datos.");
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
            
            const filteredPacientes = pacientesData.filter(paciente => paciente.activo === true);

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
                default: break;
            }
            await loadHorarios();
        } catch (error) {
            showError("Error manipulando horarios");
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

    const handleFormSubmit = async (formData) => {
        try {
            const payload = { ...formData, modificado_por: currentUser?.id };

            const paciente = pacientesOptions.find(p => p.id === payload.paciente);
            const odontologo = odontologosOptions.find(o => o.id === payload.odontologo);
            const horario = horariosFijosOptions.find(h => h.id === payload.horario_turno);
            
            const nombrePaciente = paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente';
            const nombreOdontologo = odontologo ? `${odontologo.nombre} ${odontologo.apellido}` : 'Odontólogo';
            
            if (isEditing) {
                await updateTurno(editingTurno.id, payload);
                showSuccess(`✅ Turno actualizado: ${nombrePaciente} con ${nombreOdontologo}`);
            } else {
                await createTurno(payload);
                showSuccess(`✅ Turno creado: ${nombrePaciente} con ${nombreOdontologo}`);
            }
            
            await loadData();
            setEditingTurno(null);
        } catch (err) {
            console.error("Error al guardar el turno:", err.response?.data || err);
            showError("Hubo un error al guardar el turno.");
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
            showError("Hubo un error al eliminar el turno.");
        }
    };

    const filteredTurnos = React.useMemo(() => {
        const filtered = turnos.filter(turno => {
            let matches = true;
            if (filterDate) matches = matches && (turno.fecha_turno === filterDate);
            if (filterOdontologo) matches = matches && (String(turno.odontologo) === filterOdontologo);
            if (filterPaciente) matches = matches && (String(turno.paciente) === String(filterPaciente));
            if (filterEstado) matches = matches && (String(turno.estado_turno) === filterEstado);
            return matches;
        });

        return filtered.sort((a, b) => {
            if (a.fecha_turno < b.fecha_turno) return -1;
            if (a.fecha_turno > b.fecha_turno) return 1;
            if (a.horario_display < b.horario_display) return -1;
            if (a.horario_display > b.horario_display) return 1;
            return a.id - b.id;
        });
    }, [turnos, filterDate, filterOdontologo, filterPaciente, filterEstado]);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
    };
    
    const handlePacienteFilterChange = (selectedOption) => {
        setFilterPaciente(selectedOption ? selectedOption.value : '');
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
        return (
            <div className={styles['turnos-loading']}>
                <div className={styles['spinner-large']}></div>
                <p>Cargando turnos...</p>
            </div>
        );
    }

    if (error) return <div className={styles['error']}>{error}</div>;
    
    const handleEdit = (turno) => setEditingTurno(turno);
    const handleCancelEdit = () => setEditingTurno(null);

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

                    <Select
                        value={pacienteFilterOptions.find(opt => String(opt.value) === String(filterPaciente))}
                        onChange={handlePacienteFilterChange}
                        options={pacienteFilterOptions}
                        placeholder="Buscar Paciente..."
                        isClearable
                        styles={filterSelectStyles}
                        noOptionsMessage={() => "No hay pacientes"}
                        menuPortalTarget={document.body}
                    />

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
                            onClick={handleBulkAttended} 
                            className={styles['attended-bulk-btn']} 
                            disabled={selectedTurnos.size === 0}
                        >
                            Atendido ({selectedTurnos.size})
                        </button>

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