import React, { useEffect, useState, useCallback } from 'react';
import { getPacientes, createPaciente, getGeneros, getAntecedentes, getAnalisisFuncional, getObrasSociales, updatePaciente } from '../../api/pacientes.api'; 
import styles from './PacientesList.module.css';
import PacientesForm from '../pacientesForm/PacientesForm';
import PacienteCard from '../pacienteCard/PacienteCard';
import PacienteDetail from '../pacienteDetail/PacienteDetail';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';

export default function PacientesList() {
  const { showSuccess, showError } = useAlert();
  const { showConfirm } = useConfirm();
  const [userInfo, setUserInfo] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // 🆕
  
  // ESTADOS para guardar las opciones de las Tablas Relacionadas
  const [generos, setGeneros] = useState([]);
  const [antecedentesOptions, setAntecedentesOptions] = useState([]);
  const [analisisFuncionalOptions, setAnalisisFuncionalOptions] = useState([]);
  const [obrasSocialesOptions, setObrasSocialesOptions] = useState([]);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isEditing = showForm && editingPaciente;
  const [viewingDetail, setViewingDetail] = useState(null);
  const [activo, setActivo] = useState(true);
  
  const loadMasterOptions = useCallback(async () => {
        try {
            const [
                generosData, 
                antecedentesData, 
                analisisFuncionalData, 
                obrasSocialesData
            ] = await Promise.all([
                getGeneros(),
                getAntecedentes(),
                getAnalisisFuncional(),
                getObrasSociales(),
            ]);

            setGeneros(generosData);
            setAntecedentesOptions(antecedentesData);
            setAnalisisFuncionalOptions(analisisFuncionalData);
            setObrasSocialesOptions(obrasSocialesData);
            
        } catch (error) {
            console.error("Error al cargar las opciones maestras:", error);
        }
    }, []);

  const toggleSwitch = () => {
    setActivo(prevActivo => !prevActivo);
  };

  const fetchPacientes = async () => {
    try {
        const data = await getPacientes();
        setPacientes(data);
    } catch (error) {
        console.error('Error al cargar la lista de pacientes:', error);
    }
  }

  const handleEditStart = (paciente) => {
        setEditingPaciente(paciente);
        setShowForm(true);
        setHasUnsavedChanges(false); // 🆕 Reset al abrir
  };

  const checkDniUniqueness = async (dni) => {
    const dniString = String(dni); 

    const exists = pacientes.some(paciente => 
        String(paciente.dni) === dniString &&
        (editingPaciente ? paciente.id !== editingPaciente.id : true) 
    );
    
    console.log(`Verificando DNI: ${dniString}. Resultado: ${exists ? 'Duplicado' : 'Único'}`);

    return exists;
  };

  const handleViewDetail = (paciente) => {
    setShowForm(false);
    setEditingPaciente(null); 
    setViewingDetail(paciente); 
  };

  useEffect(() => {
    fetchPacientes();
    loadMasterOptions();
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
        try {
            setUserInfo(JSON.parse(storedUserInfo));
        } catch (e) {
            console.error("Error al analizar user_info desde localStorage:", e);
        }
    }
  }, [loadMasterOptions]);

  const handleFormSubmit = async (pacienteData) => {
      try {
          let result;
          
          if (editingPaciente) {
              result = await updatePaciente(editingPaciente.id, pacienteData);
              showSuccess(`Paciente ${result.nombre} ${result.apellido} actualizado con éxito.`);
          } else {
              result = await createPaciente(pacienteData); 
              showSuccess(`Paciente ${result.nombre} ${result.apellido} creado con éxito.`);
          }
          
          await fetchPacientes();
          setShowForm(false); 
          setEditingPaciente(null);
          setHasUnsavedChanges(false); // 🆕 Reset después de guardar
          
      } catch (error) {
          console.error(`Error al ${editingPaciente ? 'actualizar' : 'crear'} el paciente:`, error);
          showError('Error al registrar/actualizar el paciente. Revisa la consola para más detalles.');
      }
  };
    
  // 🆕 Función mejorada con confirmación
  const handleToggleForm = async () => {
      if (showForm && hasUnsavedChanges) {
          const confirmed = await showConfirm(
              '¿Estás seguro de que deseas cerrar? Se perderán los cambios no guardados.',
              'Confirmar cierre'
          );
          
          if (!confirmed) {
              return; // No cerrar si el usuario cancela
          }
      }
      
      if (showForm) {
          setEditingPaciente(null);
          setHasUnsavedChanges(false);
      }
      setShowForm(!showForm);
  };

  // 🆕 Función que recibe notificaciones del formulario cuando hay cambios
  const handleFormChange = useCallback(() => {
      setHasUnsavedChanges(true);
  }, []);

  const filteredPacientes = pacientes
    .filter(paciente => paciente.activo === activo)
    .filter(paciente => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesDni = paciente.dni ? paciente.dni.includes(lowerSearchTerm) : false;
        const matchesNombre = paciente.nombre ? paciente.nombre.toLowerCase().includes(lowerSearchTerm) : false;
        const matchesApellido = paciente.apellido ? paciente.apellido.toLowerCase().includes(lowerSearchTerm) : false;
        
        return matchesDni || matchesNombre || matchesApellido;
    });

  const handleBack = () => {
      setViewingDetail(null);
  }

  if (viewingDetail) {
      return <PacienteDetail paciente={viewingDetail} onBack={handleBack} />;
  }

  const userRole = userInfo?.puesto_info?.nombre_puesto;

  const handleToggleActivo = async (pacienteId, pacienteNombre, pacienteApellido, isActivoActual) => {
      const nuevoEstado = !isActivoActual;
      const accionTexto = nuevoEstado ? 'activar' : 'desactivar';

      const confirmacion = await showConfirm(`¿Estás seguro de que deseas ${accionTexto} al paciente ${pacienteNombre} ${pacienteApellido}?`);

      if (!confirmacion) {
        return;
      }

      try {
          const updateData = {
              activo: nuevoEstado
          };
          
          await updatePaciente(pacienteId, updateData);
          showSuccess(`Paciente ${pacienteNombre} ${pacienteApellido} ha sido ${accionTexto}do con éxito.`);
          
          await fetchPacientes(); 
          
      } catch (error) {
          console.error(`Error al ${accionTexto} el paciente:`, error);
          showError(`Error al ${accionTexto} el paciente. Revisa la consola para más detalles.`);
      }
  };

  return (
    <div>
      <div className={styles['encabezado']}>
        <h1 className={styles.title}>Lista de Pacientes</h1>
        <div className={styles['boton-conteiner']}>
            <button 
                className={styles['register-button']}
                onClick={handleToggleForm} 
            >
                {showForm 
                    ? (editingPaciente ? 'Cancelar Edición' : 'Cancelar Registro') 
                    : 'Registrar Paciente'
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

      {/* MODAL ÚNICO PARA CREAR Y EDITAR - 🆕 SIN onClick en overlay */}
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
                <PacientesForm
                    onSubmit={handleFormSubmit}
                    generos={generos}
                    antecedentes={antecedentesOptions}
                    analisisFuncional={analisisFuncionalOptions}
                    obrasSociales={obrasSocialesOptions}
                    initialData={editingPaciente}
                    isEditing={isEditing}
                    checkDniUniqueness={checkDniUniqueness}
                    userRole={userRole}
                    onMasterListChange={loadMasterOptions}
                    onFormChange={handleFormChange} // 🆕 Pasar callback
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
          <h2>{activo ? 'Pacientes activos' : 'Pacientes inactivos'}</h2>
      </div>

      <div className={styles['list-conteiner']}>
        {filteredPacientes.map(paciente => (
            <PacienteCard 
                key={paciente.id} 
                paciente={paciente} 
                onEditStart={handleEditStart} 
                onViewDetail={handleViewDetail}
                onDelete={handleToggleActivo}
            />
        ))}
      </div>
    </div>
  );
}