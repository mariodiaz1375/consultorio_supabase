import React, { useState, useEffect } from 'react';
import styles from './PacienteDetail.module.css';
import HistoriaClinicaList from '../historiaClinicaList/HistoriaClinicaList';
import { getCurrentUser } from '../../api/personal.api';
import Odontogram from '../odontograma/Odontograma';
import { calcularEstadoOdontograma } from '../../utils/odontogramaMapper';
import { getHistoriasClinicas } from '../../api/historias.api';
// Función auxiliar para manejar la impresión de listas de info
const renderArrayInfo = (array, keyName) => {
    if (!array || array.length === 0) {
        return 'Ninguno';
    }
    // Mapea la lista y toma el campo de nombre correcto
    return array.map(item => item[keyName]).join(', ');
};

export default function PacienteDetail({ paciente, onBack }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [errorUser, setErrorUser] = useState(null);
    const [viewingOdontograma, setViewingOdontograma] = useState(false);
    const [odontogramaState, setOdontogramaState] = useState({});

    // Cargar historias para el odontograma
    useEffect(() => {
        const cargarDatosOdontograma = async () => {
            try {
                // Obtener TODAS las historias del paciente (quizás necesites un endpoint específico para esto si son muchas)
                const response = await getHistoriasClinicas(); 
                // Filtrar por pacienteId si la API devuelve todo (idealmente la API filtra)
                const historiasDelPaciente = response.filter(h => h.paciente === paciente.id);
                
                const estadoCalculado = calcularEstadoOdontograma(historiasDelPaciente);
                setOdontogramaState(estadoCalculado);
            } catch (e) {
                console.error("Error calculando odontograma", e);
            }
        };
        
        if (paciente) {
            cargarDatosOdontograma();
        }
    }, [paciente, odontogramaState]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Llama a la API para obtener los datos del usuario autenticado
                const user = await getCurrentUser();
                setCurrentUser(user);
            } catch (err) {
                console.error("Error al cargar el usuario logueado:", err);
                setErrorUser("No se pudo cargar la información de su usuario.");
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, []);

    if (!paciente) {
        return (
            <div className={styles.container}>
                <p>Cargando detalles del paciente o paciente no encontrado.</p>
                <button onClick={onBack}>Volver a la Lista</button>
            </div>
        );
    }

    if (loadingUser) {
        return (
            <div className={styles.container}>
                <p>Cargando información del paciente y el odontólogo...</p>
                <button onClick={onBack}>Volver a la Lista</button>
            </div>
        );
    }

    const odontologoId = currentUser ? currentUser.id : null;
    const userRole = currentUser ? currentUser.puesto_info.nombre_puesto : null;
    
    // ⭐ Extracción de datos para simplificar la lectura
    // Se usa el operador `?` (optional chaining) para evitar errores si el objeto es nulo
    const nombreGenero = paciente.genero_info?.nombre_ge || 'N/A';
    const obraSocialInfo = paciente.os_pacientes_info;
    
    
    // Conversión de arrays de información clínica a strings
    const antecedentesStr = renderArrayInfo(paciente.antecedentes_info, 'nombre_ant');
    const analisisFuncionalStr = renderArrayInfo(paciente.analisis_funcional_info, 'nombre_analisis');

    const osForm = (obraSocialInfo) => {
        if (obraSocialInfo && obraSocialInfo.length > 0) {
            return obraSocialInfo.map((os, id) => (
                <li key={id}>{os.os_info.nombre_os} - N° Afiliado: {os.num_afiliado}</li>
            ))
        } else {
            return <li>El paciente no cuenta con obra social</li>
        }
    }
    const capitalizeName = (fullName) => {
        if (!fullName) return '';
        
        // 1. Convertir la cadena completa a minúsculas y luego dividirla en palabras por el espacio
        const words = fullName.toLowerCase().split(' ');
        
        // 2. Mapear cada palabra y capitalizar solo la primera letra
        const capitalizedWords = words.map(word => {
            if (word.length === 0) return '';
            // Capitaliza la primera letra y concatena con el resto de la palabra
            return word.charAt(0).toUpperCase() + word.slice(1);
        });
        
        // 3. Unir las palabras de nuevo en una sola cadena con espacio
    return capitalizedWords.join(' ');
    };

    const handleOpenOdontograma = () => {
        setViewingOdontograma(!viewingOdontograma)
    }

    const nombreCompletoPaciente = `${capitalizeName(paciente.nombre)} ${capitalizeName(paciente.apellido)}`;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={onBack}>
                    ← Volver a la Lista
                </button>
                <h1 className={styles.title}>
                    Detalles del Paciente: { capitalizeName(paciente.nombre)} { capitalizeName(paciente.apellido)}
                </h1>
            </div>

            <div className={styles.infoGrid}>
                {/* Primera Columna: Información General */}
                <div className={styles.card}>
                    <h2>Información Personal</h2>
                    <p><strong>DNI:</strong> {paciente.dni}</p>
                    {/* Se usa fecha_nacimiento que es el campo correcto de la API */}
                    <p><strong>Edad:</strong> {paciente.edad}</p> 
                    {/* Se usa nombreGenero que ya tiene la lógica de seguridad */}
                    <p><strong>Género:</strong> {nombreGenero}</p>
                    <p><strong>Teléfono:</strong> {paciente.telefono}</p>
                    <p><strong>Email:</strong> {paciente.email}</p>
                    <p><strong>Domicilio:</strong> {paciente.domicilio}</p>
                </div>

                {/* Segunda Columna: Datos Clínicos y Obras Sociales */}
                <div className={styles.card}>
                    <h2>Datos Administrativos/Clínicos</h2>
                    {/* Se usa nombreObraSocial y numAfiliado */}
                    <p><strong>Obras Sociales:</strong></p>
                    <ul>
                        {osForm(obraSocialInfo)}
                    </ul>
                    
                    {/* Muestra las listas de información clínica como strings */}
                    <p><strong>Análisis Funcional:</strong> {analisisFuncionalStr}</p>
                    <p><strong>Antecedentes:</strong> {antecedentesStr}</p>
                    
                    <p><strong>Activo:</strong> {paciente.activo ? 'Sí' : 'No'}</p>
                </div>
            </div>

            {/* Sección de Historias Clínicas */}
            <div className={styles.dashboard}>
                <h2>Historias Clínicas</h2>
                {/* Llamada al nuevo componente, pasándole los datos necesarios */}
                <HistoriaClinicaList 
                    pacienteId={paciente.id} 
                    nombrePaciente={nombreCompletoPaciente}
                    odontologoId={odontologoId}
                    userRole={userRole}
                />
            </div>

            {/* Sección para futuros botones de Historia Clínica, Odontograma, etc. */}
            <div className={styles.dashboard}>
                <h2>Odontograma</h2>
                <button 
                    className={styles.actionButton}
                    onClick={handleOpenOdontograma}
                >
                    {viewingOdontograma ? 'Cerrar odontograma' : 'Ver odontograma'}
                </button>
                <div className={styles.odontograma}>
                    {viewingOdontograma &&
                        <Odontogram patientHistoryState={odontogramaState}/>}
                </div>
            </div>
            
        </div>
    );
}