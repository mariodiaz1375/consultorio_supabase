// import React, { useEffect, useState } from 'react';
// import PacienteCard from '../pacienteCard/PacienteCard'; // Debes crear este componente
// import PacienteForm from '../pacienteForm/PacienteForm';
// import { getPacientes, createPaciente } from '../../api/pacientes.api'; // 👈 Importar las funciones API
// // import styles from './PacienteList.module.css'; // Asume tus estilos

// export default function PacienteList() {
//     const [pacientes, setPacientes] = useState([]);
//     const [showForm, setShowForm] = useState(false); 
//     const [loading, setLoading] = useState(true);

//     // Función para cargar la lista de pacientes
//     const fetchPacientes = async () => {
//         setLoading(true);
//         try {
//             const data = await getPacientes();
//             setPacientes(data);
//         } catch (error) {
//             console.error('Error al cargar la lista de pacientes:', error);
//             alert('No se pudo cargar la lista de pacientes.');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     // Función que se llama cuando el formulario envía datos
//     const handleFormSubmit = async (formData) => {
//         try {
//             // Llama a la API para crear el paciente
//             await createPaciente(formData); 
//             alert('Paciente registrado con éxito.');
            
//             // Ocultar el formulario y recargar la lista
//             setShowForm(false);
//             fetchPacientes(); 

//         } catch (error) {
//             console.error('Error al registrar paciente:', error);
//             alert('Fallo al registrar el paciente. Revisa la consola para más detalles.');
//         }
//     };

//     // Al montar el componente, cargar la lista
//     useEffect(() => {
//         fetchPacientes();
//     }, []);

//     if (loading) {
//         return <div>Cargando lista de pacientes...</div>;
//     }

//     return (
//         <div>
//             {/* Asume que tienes un encabezado con estilos */}
//             <div /*className={styles['encabezado']}*/>
//                 <h1 /*className={styles.title}*/>Lista de Pacientes</h1>
//                 <div /*className={styles['boton-conteiner']}*/>
//                     <button 
//                         /*className={styles['register-button']}*/
//                         onClick={() => setShowForm(!showForm)} 
//                     >
//                         {showForm ? 'Cancelar Registro' : 'Registrar Paciente'}
//                     </button>
//                 </div>
//             </div>

//             {/* Renderizado condicional del formulario */}
//             {showForm && (
//                 <div /*className={styles['form-container']}*/>
//                     <PacienteForm 
//                         onSubmit={handleFormSubmit} 
//                     />
//                 </div>
//             )}
            
//             {/* Listado de Pacientes */}
//             <div>
//                 {pacientes.map(paciente => (
//                     // 🚨 IMPORTANTE: Necesitas crear el componente PacienteCard
//                     <PacienteCard key={paciente.id} paciente={paciente}/> 
//                 ))}
//             </div>
//         </div>
//     );
// }

import React, { useEffect, useState } from 'react';
// 🚨 Nota: Asegúrate de que las funciones getX existan en tu archivo API
import { getPacientes, createPaciente, getGeneros, getAntecedentes, getAnalisisFuncional, getObrasSociales, updatePaciente } from '../../api/pacientes.api'; 
import styles from './PacientesList.module.css';
import PacientesForm from '../pacientesForm/PacientesForm';
import PacienteCard from '../pacienteCard/PacienteCard';

export default function PacientesList() {
  const [pacientes, setPacientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // 💥 NUEVOS ESTADOS para guardar las opciones de las Tablas Relacionadas
  const [generos, setGeneros] = useState([]);
  const [antecedentesOptions, setAntecedentesOptions] = useState([]);
  const [analisisFuncionalOptions, setAnalisisFuncionalOptions] = useState([]);
  const [obrasSocialesOptions, setObrasSocialesOptions] = useState([]);
  const [editingPaciente, setEditingPaciente] = useState(null);

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

  // 💥 NUEVA FUNCIÓN: Cargar todas las opciones del formulario
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
    fetchOptions(); // 👈 Cargar opciones al montar el componente
  }, []);

  const handleFormSubmit = async (pacienteData) => {
      try {
          let result;
          
          // 🚨 Determinar si es Edición (PUT) o Creación (POST)
          if (editingPaciente) {
              // Edición: usa el ID del paciente que se está editando
              result = await updatePaciente(editingPaciente.id, pacienteData);
              alert(`Paciente ${result.nombre} ${result.apellido} actualizado con éxito.`);
          } else {
              // Creación: Lógica existente
              result = await createPaciente(pacienteData); 
              alert(`Paciente ${result.nombre} ${result.apellido} creado con éxito.`);
          }
          
          await fetchPacientes(); // Recargar la lista
          setShowForm(false); 
          setEditingPaciente(null); // Limpiar el estado de edición
          
      } catch (error) {
          console.error(`Error al ${editingPaciente ? 'actualizar' : 'crear'} el paciente:`, error);
          alert('Error al registrar/actualizar el paciente. Revisa la consola para más detalles.');
      }
  };

  const handleToggleForm = () => {
      // Limpia el estado de edición al cerrar o abrir para registrar uno nuevo
      if (showForm) {
          setEditingPaciente(null); // Cancelar la edición al cerrar
      }
      setShowForm(!showForm);
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

      {/* 💥 Renderizado del formulario con las opciones */}
      {showForm && (
          <div className={styles['form-container']}>
              <PacientesForm 
                  onSubmit={handleFormSubmit} 
                  generos={generos}
                  antecedentes={antecedentesOptions}
                  analisisFuncional={analisisFuncionalOptions}
                  obrasSociales={obrasSocialesOptions}
                  initialData={editingPaciente}
              />
          </div>
      )}
      
      {/* Listado... */}
      <div>
        {pacientes.map(paciente => (
          <PacienteCard key={paciente.id} paciente={paciente} onEditStart={handleEditStart}/>
        ))}
      </div>
    </div>
  );
}
// initialData