import React, { useEffect, useState } from 'react';
import PersonalCard from '../personalCard/PersonalCard';
import PersonalForm from '../personalForm/PersonalForm';
// CAMBIO 1: Importar las nuevas funciones de API
import { getPersonal, createMiembro, getPuestos, getEspecialidades } from '../../api/personal.api'; 
import styles from './PersonalList.module.css';

export default function PersonalList() {
    const [personal, setPersonal] = useState([]);
    const [showForm, setShowForm] = useState(false); 
    // CAMBIO 2: Nuevos estados para guardar las opciones
    const [puestos, setPuestos] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);

    const fetchPersonal = async () => {
        try {
            const data = await getPersonal();
            setPersonal(data);
        } catch (error) {
            console.error('Error al cargar la lista de personal:', error);
        }
    };
    
    // CAMBIO 3: Nueva función para cargar las opciones
    const fetchOptions = async () => {
        try {
            const [puestosData, especialidadesData] = await Promise.all([
                getPuestos(), // Llama a http://localhost:8000/api/personal/puestos/
                getEspecialidades() // Llama a http://localhost:8000/api/personal/especialidades/
            ]);
            setPuestos(puestosData);
            setEspecialidades(especialidadesData);
        } catch (error) {
            console.error('Error al cargar puestos o especialidades:', error);
            // Puedes añadir un manejo de error visible al usuario si esto falla
        }
    };

    useEffect(() => {
        fetchPersonal();
        fetchOptions(); // CAMBIO 4: Cargar las opciones al montar el componente
    }, []);

    // Función para manejar el envío del formulario
    const handleFormSubmit = async (newMiembroData) => {
        try {
            const newMiembro = await createMiembro(newMiembroData);
            await fetchPersonal(); 
            setShowForm(false); 
            alert(`Miembro ${newMiembro.nombre} creado con éxito.`);
        } catch (error) {
            console.error('Error al crear el miembro del personal', error);
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
                        onClick={() => setShowForm(!showForm)} 
                    >
                        {showForm ? 'Cancelar Registro' : 'Registrar Miembro'}
                    </button>
                </div>
            </div>

            {/* Renderizado condicional del formulario */}
            {showForm && (
                <div className={styles['form-container']}>
                    {/* CAMBIO 5: Pasar las listas de opciones como props al formulario */}
                    <PersonalForm 
                        onSubmit={handleFormSubmit} 
                        puestos={puestos}
                        especialidades={especialidades}
                    />
                </div>
            )}
            
            {/* Listado de Personal */}
            <div>
                {personal.map(miembro => (
                    // Asumiendo que PersonalCard usa 'miembro.puesto.nombre_puesto' y mapea 'miembro.especialidades'
                    <PersonalCard key={miembro.id} miembro={miembro}/>
                ))}
            </div>
        </div>
    );
}