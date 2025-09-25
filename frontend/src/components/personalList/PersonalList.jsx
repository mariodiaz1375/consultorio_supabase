// import React, { useEffect, useState } from 'react'
// import PersonalCard from '../personalCard/PersonalCard'
// import { getPersonal } from '../../api/personal.api'
// import styles from './PersonalList.module.css'

// export default function PersonalList() {
//   const [personal, setPersonal] = useState([])

//   useEffect(() => {
//     const fetchPersonal = async () => {
//       const data = await getPersonal()
//       console.log(data)
//       setPersonal(data)
//     }
//     fetchPersonal()
//   }, [])

//   return (
//     <div>
//       <div className={styles['encabezado']}>
//         <h1 className={styles.title}>Lista de Personal</h1>
//         <div className={styles['boton-conteiner']}>
//           <button className={styles['register-button']}>Registrar Miembro</button>
//         </div>
//       </div>
//       <div>
//         {personal.map(miembro => (
//           <PersonalCard key={miembro.id} miembro={miembro}/>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import PersonalCard from '../personalCard/PersonalCard';
import PersonalForm from '../personalForm/PersonalForm'; // <-- Nuevo componente de formulario
import { getPersonal, createMiembro } from '../../api/personal.api'; // <-- Importar createMiembro
import styles from './PersonalList.module.css';

export default function PersonalList() {
    const [personal, setPersonal] = useState([]);
    const [showForm, setShowForm] = useState(false); // <-- Estado para mostrar/ocultar el formulario

    const fetchPersonal = async () => {
        try {
            const data = await getPersonal();
            setPersonal(data);
        } catch (error) {
            console.error('Error al cargar la lista de personal:', error);
        }
    };

    useEffect(() => {
        fetchPersonal();
    }, []);

    // Función para manejar el envío del formulario
    const handleFormSubmit = async (newMiembroData) => {
        try {
            const newMiembro = await createMiembro(newMiembroData);
            
            // 1. Actualiza la lista para mostrar el nuevo miembro
            //    (Podemos simplemente recargar la lista o agregar el objeto devuelto por el backend)
            await fetchPersonal(); 
            
            // 2. Ocultar el formulario
            setShowForm(false); 
            alert(`Miembro ${newMiembro.nombre} creado con éxito.`);
        } catch (error) {
            console.error('Error al crear el miembro del personal', error);
            // Manejo de errores más específico (por ejemplo, DNI o username duplicado)
            alert('Error al registrar el personal. Revisa la consola para más detalles.');
        }
    };

    return (
        <div>
            <div className={styles['encabezado']}>
                <h1 className={styles.title}>Lista de Personal</h1>
                <div className={styles['boton-conteiner']}>
                    <button 
                        className={styles['register-button']}
                        onClick={() => setShowForm(!showForm)} // <-- Toggle del formulario
                    >
                        {showForm ? 'Cancelar Registro' : 'Registrar Miembro'}
                    </button>
                </div>
            </div>

            {/* Renderizado condicional del formulario */}
            {showForm && (
                <div className={styles['form-container']}>
                    <PersonalForm onSubmit={handleFormSubmit} />
                </div>
            )}
            
            {/* Listado de Personal */}
            <div>
                {personal.map(miembro => (
                    <PersonalCard key={miembro.id} miembro={miembro}/>
                ))}
            </div>
        </div>
    );
}