import React, { useState, useEffect } from 'react';
import styles from './PersonalDetail.module.css';
import { getCurrentUser } from '../../api/personal.api';

export default function PersonalDetail({ miembro, onBack }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [errorUser, setErrorUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
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

    if (!miembro) {
        return (
            <div className={styles.container}>
                <p>Cargando detalles del miembro o miembro no encontrado.</p>
                <button onClick={onBack}>Volver a la Lista</button>
            </div>
        );
    }

    if (loadingUser) {
        return (
            <div className={styles.container}>
                <p>Cargando información del miembro...</p>
                <button onClick={onBack}>Volver a la Lista</button>
            </div>
        );
    }

    const userRole = currentUser ? currentUser.puesto_info.nombre_puesto : null;
    
    // Función para capitalizar nombres
    const capitalizeName = (fullName) => {
        if (!fullName) return '';
        const words = fullName.toLowerCase().split(' ');
        const capitalizedWords = words.map(word => {
            if (word.length === 0) return '';
            return word.charAt(0).toUpperCase() + word.slice(1);
        });
        return capitalizedWords.join(' ');
    };

    // 🆕 Función para formatear fecha correctamente (evitar problema de zona horaria)
    const formatFechaAlta = (fecha) => {
        if (!fecha) return 'N/A';
        // Agregar 'T00:00:00' para que se interprete como fecha local, no UTC
        const fechaStr = fecha.includes('T') ? fecha : fecha + 'T00:00:00';
        const date = new Date(fechaStr);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Renderizar especialidades
    const renderEspecialidades = () => {
        if (!miembro.especialidades_info || miembro.especialidades_info.length === 0) {
            return <li>Sin especialidades asignadas</li>;
        }
        return miembro.especialidades_info.map((esp, index) => (
            <li key={index}>{esp.nombre_esp}</li>
        ));
    };

    const nombreCompletoMiembro = `${capitalizeName(miembro.nombre)} ${capitalizeName(miembro.apellido)}`;
    const nombrePuesto = miembro.puesto_info?.nombre_puesto || 'N/A';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={onBack}>
                    ← Volver a la Lista
                </button>
                <h1 className={styles.title}>
                    Detalles del Miembro: {capitalizeName(miembro.nombre)} {capitalizeName(miembro.apellido)}
                </h1>
            </div>

            <div className={styles.infoGrid}>
                {/* Primera Columna: Información Personal */}
                <div className={styles.card}>
                    <h2>Información Personal</h2>
                    <p><strong>DNI:</strong> {miembro.dni}</p>
                    <p><strong>Fecha de alta:</strong> {formatFechaAlta(miembro.fecha_alta)}</p>
                    <p><strong>Teléfono:</strong> {miembro.telefono}</p>
                    <p><strong>Email:</strong> {miembro.email}</p>
                    <p><strong>Domicilio:</strong> {miembro.domicilio}</p>
                </div>

                {/* Segunda Columna: Datos Profesionales */}
                <div className={styles.card}>
                    <h2>Datos Profesionales</h2>
                    <p><strong>Puesto:</strong> {nombrePuesto}</p>
                    <p><strong>Matrícula:</strong> {miembro.matricula || 'N/A'}</p>
                    <p><strong>Especialidades:</strong></p>
                    <ul>
                        {renderEspecialidades()}
                    </ul>
                    <p><strong>Activo:</strong> {miembro.activo ? 'Sí' : 'No'}</p>
                </div>
            </div>
        </div>
    );
}