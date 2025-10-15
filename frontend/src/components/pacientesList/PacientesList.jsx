

import React, { useEffect, useState } from 'react';
import { getPacientes, createPaciente, getGeneros, getAntecedentes, getAnalisisFuncional, getObrasSociales, updatePaciente } from '../../api/pacientes.api'; 
import styles from './PacientesList.module.css';
import PacientesForm from '../pacientesForm/PacientesForm';
import PacienteCard from '../pacienteCard/PacienteCard';
import PacienteDetail from '../pacienteDetail/PacienteDetail';

export default function PacientesList() {
  const [pacientes, setPacientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // ESTADOS para guardar las opciones de las Tablas Relacionadas
  const [generos, setGeneros] = useState([]);
  const [antecedentesOptions, setAntecedentesOptions] = useState([]);
  const [analisisFuncionalOptions, setAnalisisFuncionalOptions] = useState([]);
  const [obrasSocialesOptions, setObrasSocialesOptions] = useState([]);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isEditing = showForm && editingPaciente;
  const isCreating = showForm && !editingPaciente;
  const [viewingDetail, setViewingDetail] = useState(null);

  const fetchPacientes = async () => {
    try {
        const data = await getPacientes();
        setPacientes(data);
    } catch (error) {
        console.error('Error al cargar la lista de pacientes:', error);
    }
  }

  const handleEditStart = (paciente) => {
        // 1. Oculta la lista (si es necesario)
        // 2. Carga los datos del paciente en el estado de edición
        setEditingPaciente(paciente);
        // 3. Muestra el formulario
        setShowForm(true);
  };

  const handleViewDetail = (paciente) => {
    // Asegurarse de que el formulario esté cerrado
    setShowForm(false);
    setEditingPaciente(null); 
    // Establecer el paciente para la vista de detalle
    setViewingDetail(paciente); 
  };

  // cargar todas las opciones del formulario
  const fetchOptions = async () => {
    try {
        const [generosData, antecedentesData, analisisData, obrasSocialesData] = await Promise.all([
            getGeneros(), 
            getAntecedentes(), 
            getAnalisisFuncional(),
            getObrasSociales()
        ]);
        setGeneros(generosData);
        setAntecedentesOptions(antecedentesData);
        setAnalisisFuncionalOptions(analisisData);
        setObrasSocialesOptions(obrasSocialesData);
    } catch (error) {
        console.error('Error al cargar las opciones del formulario:', error);
    }
  }

  useEffect(() => {
    fetchPacientes();
    fetchOptions(); // Cargar opciones al montar el componente
  }, []);

  const handleFormSubmit = async (pacienteData) => {
      try {
          let result;
          
          // determina si es edicion (PUT) o creacion (POST)
          if (editingPaciente) {
              // editar: usa el ID del paciente que se esta editando
              result = await updatePaciente(editingPaciente.id, pacienteData);
              alert(`Paciente ${result.nombre} ${result.apellido} actualizado con éxito.`);
          } else {
              // crear
              result = await createPaciente(pacienteData); 
              alert(`Paciente ${result.nombre} ${result.apellido} creado con éxito.`);
          }
          
          await fetchPacientes(); // recarga la lista
          setShowForm(false); 
          setEditingPaciente(null); // limpiar el estado de edición
          
      } catch (error) {
          console.error(`Error al ${editingPaciente ? 'actualizar' : 'crear'} el paciente:`, error);
          alert('Error al registrar/actualizar el paciente. Revisa la consola para más detalles.');
      }
  };
    

  const handleToggleForm = () => {
      // limpia el estado de edicionn al cerrar o abrir para registrar uno nuevo
      if (showForm) {
          setEditingPaciente(null); // Cancelar la edicion al cerrar
      }
      setShowForm(!showForm);
  };

  const filteredPacientes = pacientes.filter(paciente => {
    // Convierte el término de búsqueda y los campos del paciente a minúsculas para una comparación sin distinción de mayúsculas/minúsculas
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Comprueba si el DNI o el nombre/apellido contienen el término de búsqueda
    const matchesDni = paciente.dni ? paciente.dni.includes(lowerSearchTerm) : false;
    const matchesNombre = paciente.nombre ? paciente.nombre.toLowerCase().includes(lowerSearchTerm) : false;
    const matchesApellido = paciente.apellido ? paciente.apellido.toLowerCase().includes(lowerSearchTerm) : false;
    
    // Filtra si coincide con DNI, Nombre o Apellido
    return matchesDni || matchesNombre || matchesApellido;
  });

  const handleBack = () => {
      setViewingDetail(null);
  }

  // RENDERIZADO CONDICIONAL
  if (viewingDetail) {
      return <PacienteDetail paciente={viewingDetail} onBack={handleBack} />;
  }

    const renderForm = (className) => (
      <div className={className}>
          <PacientesForm
              onSubmit={handleFormSubmit}
              generos={generos}
              antecedentes={antecedentesOptions}
              analisisFuncional={analisisFuncionalOptions}
              obrasSociales={obrasSocialesOptions}
              initialData={editingPaciente}
              isEditing={isEditing}
          />
      </div>
    );


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
            // Actualiza el estado del término de búsqueda con cada cambio
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles['search-input']}
        />
      </div>

      {/* renderizado del formulario en modo creacion con las opciones */}
      {isCreating && (
          renderForm(styles['form-conteiner'])
      )}

      {isEditing && (
        <div className={styles['floating-overlay']}>
            <div>
                <button 
                className={styles['cerrar']}
                onClick={handleToggleForm}>
                    X
                </button>
            </div>
            {renderForm(styles['sidebar-form-container'])}
        </div>  
      )}
      
      {/* Listado... */}
      <div>
        {filteredPacientes.map(paciente => (
          <PacienteCard 
          key={paciente.id} paciente={paciente} 
          onEditStart={handleEditStart} onViewDetail={handleViewDetail}/>
        ))}
      </div>
    </div>
  );
}
// initialData