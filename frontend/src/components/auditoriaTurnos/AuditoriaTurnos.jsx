import React, { useState, useEffect, useCallback } from 'react';
import { getAuditoriasTurnos } from '../../api/turnos.api';
import styles from './AuditoriaTurnos.module.css';

// Variable para la paginación
const REGISTROS_POR_PAGINA = 10;

export default function AuditoriaTurnos({ turnoNumero = null }) {
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- ESTADO DE PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    // ----------------------------

    const [filtros, setFiltros] = useState({
        accion: '',
        fecha_accion: '',
        fecha_turno: '',
    });

    const cargarAuditorias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: paginaActual // 👈 AÑADIR PÁGINA ACTUAL A LOS PARÁMETROS
            };
            
            if (turnoNumero) {
                params.turno_numero = turnoNumero;
            }
            
            // Agregar otros filtros si están activos
            if (filtros.accion) params.accion = filtros.accion;
            if (filtros.fecha_accion) params.fecha_accion = filtros.fecha_accion;
            if (filtros.fecha_turno) params.fecha_turno = filtros.fecha_turno;
            
            // 👇 LA RESPUESTA DE LA API AHORA SERÁ UN OBJETO PAGINADO
            const data = await getAuditoriasTurnos(params); 
            
            setAuditorias(data.results); // 👈 Los datos están en 'results'
            setTotalRegistros(data.count); // 👈 El total está en 'count'

        } catch (err) {
            console.error('Error al cargar auditorías:', err);
            setError('No se pudieron cargar los registros de auditoría.');
        } finally {
            setLoading(false);
        }
    }, [filtros, turnoNumero, paginaActual]); // 👈 AÑADIR 'paginaActual' a las dependencias

    // Este useEffect se mantiene igual, se ejecutará si 'cargarAuditorias' cambia
    useEffect(() => {
        cargarAuditorias();
    }, [cargarAuditorias]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
        setPaginaActual(1); // 👈 RESETEAR A PÁGINA 1 AL CAMBIAR FILTRO
    };

    const limpiarFiltros = () => {
        setFiltros({
            accion: '',
            fecha_accion: '',
            fecha_turno: '',
        });
        setPaginaActual(1); // 👈 RESETEAR A PÁGINA 1 AL LIMPIAR
    };

    // --- LÓGICA DE PAGINACIÓN ---
    const totalPaginas = Math.ceil(totalRegistros / REGISTROS_POR_PAGINA);

    const irPaginaSiguiente = () => {
        setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
    };

    const irPaginaAnterior = () => {
        setPaginaActual(prev => Math.max(prev - 1, 1));
    };
    // ----------------------------

    // (Funciones auxiliares como formatearFecha, getBadgeClass, etc. no cambian)
    // ...
    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearFechaTurno = (fechaISO) => {
        if (!fechaISO) return 'N/A';
        const fecha = new Date(fechaISO + 'T00:00:00');
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getBadgeClass = (accion) => {
        switch (accion) {
            case 'CREACION':
                return styles.badgeCreacion;
            case 'MODIFICACION':
                return styles.badgeModificacion;
            case 'CAMBIO_ESTADO':
                return styles.badgeCambioEstado;
            case 'ELIMINACION':
                return styles.badgeEliminacion;
            default:
                return '';
        }
    };

    const getAccionTexto = (accion) => {
        switch (accion) {
            case 'CREACION':
                return '✓ Turno Agendado';
            case 'MODIFICACION':
                return '📝 Reprogramado';
            case 'CAMBIO_ESTADO':
                return '🔄 Cambio de Estado';
            case 'ELIMINACION':
                return '✗ Eliminado';
            default:
                return accion;
        }
    };


    if (loading) {
        return <div className={styles.loading}>Cargando auditorías...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.auditoriaContainer}>
            <h2>Auditoría de Turnos</h2>
            
            {!turnoNumero && (
                <div className={styles.filtrosContainer}>
                    {/* ... (Filtros no cambian) ... */}
                    <div className={styles.filtroGroup}>
                        <label htmlFor="accion">Acción:</label>
                        <select 
                            id="accion"
                            name="accion" 
                            value={filtros.accion} 
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todas</option>
                            <option value="CREACION">Turno Agendado</option>
                            <option value="MODIFICACION">Reprogramado</option>
                            <option value="CAMBIO_ESTADO">Cambio de Estado</option>
                            <option value="ELIMINACION">Eliminado</option>
                        </select>
                    </div>

                    <div className={styles.filtroGroup}>
                        <label htmlFor="fecha_turno">Fecha del Turno:</label>
                        <input 
                            type="date"
                            id="fecha_turno"
                            name="fecha_turno"
                            value={filtros.fecha_turno}
                            onChange={handleFiltroChange}
                        />
                    </div>

                    <div className={styles.filtroGroup}>
                        <label htmlFor="fecha_accion">Fecha de Acción:</label>
                        <input 
                            type="date"
                            id="fecha_accion"
                            name="fecha_accion"
                            value={filtros.fecha_accion}
                            onChange={handleFiltroChange}
                        />
                    </div>
                    
                    <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
                        Limpiar filtros
                    </button>
                </div>
            )}

            {/* (La tabla no cambia) ... */}
            <div className={styles.tableContainer}>
                <table className={styles.auditoriaTable}>
                    {/* ... (thead) ... */}
                    <thead>
                        <tr>
                            <th>Fecha/Hora Acción</th>
                            <th>Acción</th>
                            <th>Turno #</th>
                            <th>Paciente</th>
                            <th>Odontólogo</th>
                            <th>Fecha Turno</th>
                            <th>Horario</th>
                            <th>Estado</th>
                            <th>Usuario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditorias.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center' }}>
                                    No hay registros de auditoría.
                                </td>
                            </tr>
                        ) : (
                            auditorias.map(auditoria => (
                                <tr 
                                    key={auditoria.id}
                                    className={styles[`row${auditoria.accion}`]}
                                >
                                    <td>{formatearFecha(auditoria.fecha_accion)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${getBadgeClass(auditoria.accion)}`}>
                                            {getAccionTexto(auditoria.accion)}
                                        </span>
                                    </td>
                                    <td>#{auditoria.turno_numero}</td>
                                    <td>
                                        {auditoria.paciente_nombre}
                                        <br />
                                        <small>DNI: {auditoria.paciente_dni}</small>
                                    </td>
                                    <td>{auditoria.odontologo_nombre}</td>
                                    <td>{formatearFechaTurno(auditoria.fecha_turno)}</td>
                                    <td>{auditoria.horario_display || 'N/A'}</td>
                                    <td>
                                        {auditoria.estado_anterior && auditoria.estado_anterior !== auditoria.estado_nuevo ? (
                                            <>
                                                <span className={styles.estadoAnterior}>
                                                    {auditoria.estado_anterior}
                                                </span>
                                                {' → '}
                                                <span className={styles.estadoNuevo}>
                                                    {auditoria.estado_nuevo}
                                                </span>
                                            </>
                                        ) : (
                                            <span className={styles.estadoNuevo}>
                                                {auditoria.estado_nuevo}
                                            </span>
                                        )}
                                    </td>
                                    <td>{auditoria.usuario_nombre}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 👇 --- CONTROLES DE PAGINACIÓN --- 👇 */}
            {totalRegistros > 0 && (
                <div className={styles.paginacionContainer}>
                    <button 
                        onClick={irPaginaAnterior} 
                        disabled={paginaActual === 1}
                        className={styles.btnPaginacion}
                    >
                        ‹ Anterior
                    </button>
                    <span className={styles.paginacionInfo}>
                        Página {paginaActual} de {totalPaginas}
                    </span>
                    <button 
                        onClick={irPaginaSiguiente} 
                        disabled={paginaActual >= totalPaginas}
                        className={styles.btnPaginacion}
                    >
                        Siguiente ›
                    </button>
                </div>
            )}
            {/* --------------------------------- */}

            <div className={styles.totalRegistros}>
                {/* 👇 ACTUALIZAR EL TOTAL PARA USAR 'totalRegistros' */}
                Total de registros: <strong>{totalRegistros}</strong>
            </div>
        </div>
    );
}