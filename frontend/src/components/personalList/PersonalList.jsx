import React, { useEffect, useState, useCallback } from 'react';
import PersonalCard from '../personalCard/PersonalCard';
import PersonalForm from '../personalForm/PersonalForm';
import PersonalDetail from '../personalDetail/PersonalDetail';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';
import { 
    getPersonal, 
    createMiembro, 
    updateMiembro,
    getPuestos, 
    getEspecialidades 
} from '../../api/personal.api'; 
import styles from './PersonalList.module.css';

export default function PersonalList() {
    const { showSuccess, showError } = useAlert();
    const { showConfirm } = useConfirm();
    const [userInfo, setUserInfo] = useState(null);
    const [personal, setPersonal] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [puestos, setPuestos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [editingMiembro, setEditingMiembro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isEditing = showForm && editingMiembro;
    const [viewingDetail, setViewingDetail] = useState(null);
    const [activo, setActivo] = useState(true);
    
    // 🆕 ESTADOS DE PAGINACIÓN
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
        setCurrentPage(1); // 🆕 Resetear a página 1
    };

    const handleEditStart = (miembro) => {
        setEditingMiembro(miembro);
        setShowForm(true);
        setHasUnsavedChanges(false);
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

    const checkEmailUniqueness = async (email) => {
        const emailString = String(email); 

        const exists = personal.some(miembro => 
            String(miembro.email) === emailString &&
            (editingMiembro ? miembro.id !== editingMiembro.id : true) 
        );
        
        console.log(`Verificando email: ${emailString}. Resultado: ${exists ? 'Duplicado' : 'Único'}`);

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
                showSuccess(`✅ Miembro actualizado: ${result.nombre} ${result.apellido}`);
            } else {
                result = await createMiembro(miembroData); 
                showSuccess(`✅ Miembro creado: ${result.nombre} ${result.apellido}`);
            }
            
            await fetchPersonal();
            setShowForm(false); 
            setEditingMiembro(null);
            setHasUnsavedChanges(false);
            
        } catch (error) {
            console.error(`Error al ${editingMiembro ? 'actualizar' : 'crear'} el miembro:`, error);
            showError('Error al registrar/actualizar el miembro. Revisa la consola para más detalles.');
        }
    };
    
    const handleToggleForm = async () => {
        if (showForm && hasUnsavedChanges) {
            const confirmed = await showConfirm(
                '¿Estás seguro de que deseas cerrar? Se perderán los cambios no guardados.',
                'Confirmar cierre'
            );
            
            if (!confirmed) {
                return;
            }
        }
        
        if (showForm) {
            setEditingMiembro(null);
            setHasUnsavedChanges(false);
        }
        setShowForm(!showForm);
    };

    const handleFormChange = useCallback(() => {
        setHasUnsavedChanges(true);
    }, []);

    // 🆕 Filtrar personal y aplicar paginación
    const filteredPersonal = personal
        .filter(miembro => miembro.activo === activo)
        .filter(miembro => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesDni = miembro.dni ? miembro.dni.includes(lowerSearchTerm) : false;
            const matchesNombre = miembro.nombre ? miembro.nombre.toLowerCase().includes(lowerSearchTerm) : false;
            const matchesApellido = miembro.apellido ? miembro.apellido.toLowerCase().includes(lowerSearchTerm) : false;
            
            return matchesDni || matchesNombre || matchesApellido;
        });

    // 🆕 Calcular paginación
    const totalPages = Math.ceil(filteredPersonal.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPersonal = filteredPersonal.slice(indexOfFirstItem, indexOfLastItem);

    // 🆕 Resetear a página 1 cuando cambia el término de búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // 🆕 Función para cambiar de página
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 🆕 Generar números de página con elipsis
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                pageNumbers.push(currentPage - 1);
                pageNumbers.push(currentPage);
                pageNumbers.push(currentPage + 1);
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };

    const handleBack = () => {
        setViewingDetail(null);
    }

    if (viewingDetail) {
        return <PersonalDetail miembro={viewingDetail} onBack={handleBack} />;
    }

    const handleToggleActivo = async (miembroId, miembroNombre, miembroApellido, isActivoActual) => {
        const nuevoEstado = !isActivoActual;
        const accionTexto = nuevoEstado ? 'activar' : 'desactivar';

        const confirmacion = await showConfirm(`¿Estás seguro de que deseas ${accionTexto} al miembro ${miembroNombre} ${miembroApellido}?`);

        if (!confirmacion) {
            return;
        }

        try {
            const updateData = {
                activo: nuevoEstado
            };
            
            await updateMiembro(miembroId, updateData);
            showSuccess(`Miembro ${miembroNombre} ${miembroApellido} ha sido ${accionTexto}do con éxito.`);
            
            await fetchPersonal(); 
            
        } catch (error) {
            console.error(`Error al ${accionTexto} el miembro:`, error);
            showError(`Error al ${accionTexto} el miembro. Revisa la consola para más detalles.`);
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
                <div className={styles['modal-overlay']}>
                    <div 
                        className={styles['modal-content']} 
                        onClick={(e) => e.stopPropagation()}
                    >
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
                            checkEmailUniqueness={checkEmailUniqueness}
                            onFormChange={handleFormChange}
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

            {/* 🆕 Lista de personal paginada */}
            <div className={styles['list-conteiner']}>
                {currentPersonal.length > 0 ? (
                    currentPersonal.map(miembro => (
                        <PersonalCard 
                            key={miembro.id} 
                            miembro={miembro} 
                            onEditStart={handleEditStart} 
                            onViewDetail={handleViewDetail}
                            onDelete={handleToggleActivo}
                        />
                    ))
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#6b7280',
                        fontSize: '1.1rem'
                    }}>
                        No se encontraron miembros del personal {activo ? 'activos' : 'inactivos'} 
                        {searchTerm && ` que coincidan con "${searchTerm}"`}
                    </div>
                )}
            </div>

            {/* 🆕 Controles de paginación */}
            {filteredPersonal.length > 0 && (
                <div className={styles['pagination-container']}>
                    <button
                        className={styles['pagination-button']}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>

                    <div className={styles['page-numbers']}>
                        {getPageNumbers().map((pageNum, index) => (
                            pageNum === '...' ? (
                                <span key={`ellipsis-${index}`} className={`${styles['page-number']} ${styles['ellipsis']}`}>
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={pageNum}
                                    className={`${styles['page-number']} ${currentPage === pageNum ? styles['active'] : ''}`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            )
                        ))}
                    </div>

                    <button
                        className={styles['pagination-button']}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </button>

                    <div className={styles['pagination-info']}>
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPersonal.length)} de {filteredPersonal.length}
                    </div>
                </div>
            )}
        </div>
    );
}