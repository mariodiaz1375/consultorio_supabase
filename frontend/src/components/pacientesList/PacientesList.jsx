

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
  const [activo, setActivo] = useState(true);

  const toggleSwitch = () => {
    // Usamos el valor previo para invertirlo
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

  const filteredPacientes = pacientes
    // 1. PRIMER FILTRO: Por estado activo/inactivo (determinado por el switch)
    .filter(paciente => paciente.activo === activo)
    // 2. SEGUNDO FILTRO: Por término de búsqueda
    .filter(paciente => {
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

    // Dentro de PacientesList.jsx, antes del return:

// ... (código existente, justo después de handleFormSubmit)

  const handleToggleActivo = async (pacienteId, pacienteNombre, pacienteApellido, isActivoActual) => {
      // 1. Determinar el nuevo estado objetivo
      const nuevoEstado = !isActivoActual;
      const accionTexto = nuevoEstado ? 'activar' : 'desactivar';

      // 2. Confirmación
      const confirmacion = window.confirm(`¿Estás seguro de que deseas ${accionTexto} al paciente ${pacienteNombre} ${pacienteApellido}?`);

      if (!confirmacion) {
        return;
      }

      try {
          // 3. Payload con el nuevo estado
          const updateData = {
              activo: nuevoEstado // Usa la variable booleana calculada
          };
          
          await updatePaciente(pacienteId, updateData);
          alert(`Paciente ${pacienteNombre} ${pacienteApellido} ha sido ${accionTexto}do con éxito.`);
          
          // Recargar la lista
          await fetchPacientes(); 
          
      } catch (error) {
          console.error(`Error al ${accionTexto} el paciente:`, error);
          alert(`Error al ${accionTexto} el paciente. Revisa la consola para más detalles.`);
      }
  };


// ... (código restante de PacientesList, antes del return)


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
      
      <div className={styles["switch-container"]}>
        {/* 3. La clase CSS se aplica condicionalmente según el estado 'isOn' */}
          <button
            // Si 'isOn' es true, la clase es 'on'; si es false, es 'off'
            className={`${styles['switch-button']} ${activo ? styles.Activos : styles.Inactivos}`}
            // className={`{switch-button} ${activo ? 'Activos' : 'Inactivos'}`}
            onClick={toggleSwitch}
            role="switch" // Rol de accesibilidad
            aria-checked={activo} // Estado de accesibilidad
          >
            <span className={styles["switch-toggle"]}></span>
          </button>
          {/* Muestra el estado actual */}
          <h2>{activo ? 'Pacientes activos' : 'Pacientes inactivos'}</h2>
      </div>


      {/* Listado... */}
      <div>
        {filteredPacientes.map(paciente => (
            <PacienteCard 
            key={paciente.id} paciente={paciente} 
            onEditStart={handleEditStart} onViewDetail={handleViewDetail}
            onDelete={handleToggleActivo}
            />
        ))}
      </div>
    </div>
  );
}
// initialData