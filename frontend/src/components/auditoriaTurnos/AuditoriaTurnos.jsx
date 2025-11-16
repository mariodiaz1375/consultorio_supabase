import React, { useState, useEffect } from 'react';
import { getAuditoriasTurnos } from '../../api/turnos.api';
import styles from './AuditoriaTurnos.module.css';

export default function AuditoriaTurnos({ turnoNumero = null }) {
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros
    const [filtros, setFiltros] = useState({
        accion: '',
        fecha_desde: '',
        fecha_hasta: '',
        fecha_turno: '',
    });

    useEffect(() => {
        cargarAuditorias();
    }, [turnoNumero]);

    const cargarAuditorias = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            
            // Si hay un turno específico, filtrar por él
            if (turnoNumero) {
                params.turno_numero = turnoNumero;
            }
            
            // Agregar otros filtros si están activos
            if (filtros.accion) params.accion = filtros.accion;
            if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
            if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
            if (filtros.fecha_turno) params.fecha_turno = filtros.fecha_turno;
            
            const data = await getAuditoriasTurnos(params);
            setAuditorias(data);
        } catch (err) {
            console.error('Error al cargar auditorías:', err);
            setError('No se pudieron cargar los registros de auditoría.');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const aplicarFiltros = () => {
        cargarAuditorias();
    };

    const limpiarFiltros = () => {
        setFiltros({
            accion: '',
            fecha_desde: '',
            fecha_hasta: '',
            fecha_turno: '',
        });
        setTimeout(() => cargarAuditorias(), 100);
    };

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
            
            {/* Filtros */}
            {!turnoNumero && (
                <div className={styles.filtrosContainer}>
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
                        <label htmlFor="fecha_desde">Desde:</label>
                        <input 
                            type="date"
                            id="fecha_desde"
                            name="fecha_desde"
                            value={filtros.fecha_desde}
                            onChange={handleFiltroChange}
                        />
                    </div>

                    <div className={styles.filtroGroup}>
                        <label htmlFor="fecha_hasta">Hasta:</label>
                        <input 
                            type="date"
                            id="fecha_hasta"
                            name="fecha_hasta"
                            value={filtros.fecha_hasta}
                            onChange={handleFiltroChange}
                        />
                    </div>

                    <button onClick={aplicarFiltros} className={styles.btnFiltrar}>
                        Filtrar
                    </button>
                    <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
                        Limpiar
                    </button>
                </div>
            )}

            {/* Tabla de auditorías */}
            <div className={styles.tableContainer}>
                <table className={styles.auditoriaTable}>
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

            {/* Detalles de observaciones */}
            {auditorias.length > 0 && (
                <div className={styles.observacionesContainer}>
                    <h3>Detalles de Cambios</h3>
                    {auditorias.map(auditoria => (
                        auditoria.observaciones && (
                            <div key={auditoria.id} className={styles.observacionItem}>
                                <strong>#{auditoria.turno_numero} - {formatearFecha(auditoria.fecha_accion)}:</strong>
                                <p>{auditoria.observaciones}</p>
                            </div>
                        )
                    ))}
                </div>
            )}

            <div className={styles.totalRegistros}>
                Total de registros: <strong>{auditorias.length}</strong>
            </div>
        </div>
    );
}