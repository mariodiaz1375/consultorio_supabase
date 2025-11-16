import React, { useEffect, useState, useCallback } from 'react';
import PersonalCard from '../personalCard/PersonalCard';
import PersonalForm from '../personalForm/PersonalForm';
import PersonalDetail from '../personalDetail/PersonalDetail';
import { 
    getPersonal, 
    createMiembro, 
    updateMiembro,
    getPuestos, 
    getEspecialidades 
} from '../../api/personal.api'; 
import styles from './PersonalList.module.css';

export default function PersonalList() {
    const [userInfo, setUserInfo] = useState(null);
    const [personal, setPersonal] = useState([]);
    const [showForm, setShowForm] = useState(false); 
    const [puestos, setPuestos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [editingMiembro, setEditingMiembro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isEditing = showForm && editingMiembro;
    const [viewingDetail, setViewingDetail] = useState(null);
    const [activo, setActivo] = useState(true);

    const fetchPersonal = async () => {
        try {
            const data = await getPersonal();
            setPersonal(data);
        } catch (error) {
            console.error('Error al cargar la lista de personal:', error);
        }
    };
    
    const fetchOptions = useCallback(async () => {
        try {
            const [puestosData, especialidadesData] = await Promise.all([
                getPuestos(),
                getEspecialidades()
            ]);
            setPuestos(puestosData);
            setEspecialidades(especialidadesData);
        } catch (error) {
            console.error('Error al cargar puestos o especialidades:', error);
        }
    }, []);

    const toggleSwitch = () => {
        setActivo(prevActivo => !prevActivo);
    };

    const handleEditStart = (miembro) => {
        setEditingMiembro(miembro);
        setShowForm(true);
    };

    const checkDniUniqueness = async (dni) => {
        const dniString = String(dni); 

        const exists = personal.some(miembro => 
            String(miembro.dni) === dniString &&
            (editingMiembro ? miembro.id !== editingMiembro.id : true) 
        );
        
        console.log(`Verificando DNI: ${dniString}. Resultado: ${exists ? 'Duplicado' : 'Único'}`);

        return exists;
    };

    const handleViewDetail = (miembro) => {
        setShowForm(false);
        setEditingMiembro(null); 
        setViewingDetail(miembro); 
    };

    useEffect(() => {
        fetchPersonal();
        fetchOptions();
        const storedUserInfo = localStorage.getItem('user_info');
        if (storedUserInfo) {
            try {
                setUserInfo(JSON.parse(storedUserInfo));
            } catch (e) {
                console.error("Error al analizar user_info desde localStorage:", e);
            }
        }
    }, [fetchOptions]);

    const handleFormSubmit = async (miembroData) => {
        try {
            let result;
            
            if (editingMiembro) {
                result = await updateMiembro(editingMiembro.id, miembroData);
                alert(`Miembro ${result.nombre} ${result.apellido} actualizado con éxito.`);
            } else {
                result = await createMiembro(miembroData); 
                alert(`Miembro ${result.nombre} ${result.apellido} creado con éxito.`);
            }
            
            await fetchPersonal();
            setShowForm(false); 
            setEditingMiembro(null);
            
        } catch (error) {
            console.error(`Error al ${editingMiembro ? 'actualizar' : 'crear'} el miembro:`, error);
            alert('Error al registrar/actualizar el miembro. Revisa la consola para más detalles.');
        }
    };
    
    const handleToggleForm = () => {
        if (showForm) {
            setEditingMiembro(null);
        }
        setShowForm(!showForm);
    };

    const filteredPersonal = personal
        .filter(miembro => miembro.activo === activo)
        .filter(miembro => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesDni = miembro.dni ? miembro.dni.includes(lowerSearchTerm) : false;
            const matchesNombre = miembro.nombre ? miembro.nombre.toLowerCase().includes(lowerSearchTerm) : false;
            const matchesApellido = miembro.apellido ? miembro.apellido.toLowerCase().includes(lowerSearchTerm) : false;
            
            return matchesDni || matchesNombre || matchesApellido;
        });

    const handleBack = () => {
        setViewingDetail(null);
    }

    if (viewingDetail) {
        return <PersonalDetail miembro={viewingDetail} onBack={handleBack} />;
    }

    const handleToggleActivo = async (miembroId, miembroNombre, miembroApellido, isActivoActual) => {
        const nuevoEstado = !isActivoActual;
        const accionTexto = nuevoEstado ? 'activar' : 'desactivar';

        const confirmacion = window.confirm(`¿Estás seguro de que deseas ${accionTexto} al miembro ${miembroNombre} ${miembroApellido}?`);

        if (!confirmacion) {
            return;
        }

        try {
            const updateData = {
                activo: nuevoEstado
            };
            
            await updateMiembro(miembroId, updateData);
            alert(`Miembro ${miembroNombre} ${miembroApellido} ha sido ${accionTexto}do con éxito.`);
            
            await fetchPersonal(); 
            
        } catch (error) {
            console.error(`Error al ${accionTexto} el miembro:`, error);
            alert(`Error al ${accionTexto} el miembro. Revisa la consola para más detalles.`);
        }
    };

    return (
        <div>
            <div className={styles['encabezado']}>
                <h1 className={styles.title}>Lista de Personal</h1>
                <div className={styles['boton-conteiner']}>
                    <button 
                        className={styles['register-button']}
                        onClick={handleToggleForm} 
                    >
                        {showForm 
                            ? (editingMiembro ? 'Cancelar Edición' : 'Cancelar Registro') 
                            : 'Registrar Miembro'
                        }
                    </button>
                </div>
            </div>
            
            <div className={styles['search-conteiner']}>
                <input
                    type="text"
                    placeholder="Buscar por DNI, nombre o apellido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles['search-input']}
                />
            </div>

            {showForm && (
                <div className={styles['modal-overlay']} onClick={handleToggleForm}>
                    <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                        <button 
                            className={styles['modal-close-btn']}
                            onClick={handleToggleForm}
                        >
                            ×
                        </button>
                        <PersonalForm 
                            onSubmit={handleFormSubmit} 
                            puestos={puestos}
                            especialidades={especialidades}
                            initialData={editingMiembro}
                            isEditing={isEditing}
                            checkDniUniqueness={checkDniUniqueness}
                        />
                    </div>
                </div>
            )}
            
            <div className={styles["switch-container"]}>
                <button
                    className={`${styles['switch-button']} ${activo ? styles.Activos : styles.Inactivos}`}
                    onClick={toggleSwitch}
                    role="switch"
                    aria-checked={activo}
                >
                    <span className={styles["switch-toggle"]}></span>
                </button>
                <h2>{activo ? 'Personal activo' : 'Personal inactivo'}</h2>
            </div>

            <div>
                {filteredPersonal.map(miembro => (
                    <PersonalCard 
                        key={miembro.id} 
                        miembro={miembro} 
                        onEditStart={handleEditStart} 
                        onViewDetail={handleViewDetail}
                        onDelete={handleToggleActivo}
                    />
                ))}
            </div>
        </div>
    );
}