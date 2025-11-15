import React, { useState, useEffect } from 'react';
import { getAuditorias } from '../../api/pagos.api';
import styles from './AuditoriaPagos.module.css';

export default function AuditoriaPagos({ historiaClinicaId = null }) {
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros
    const [filtros, setFiltros] = useState({
        accion: '',
        fecha_desde: '',
        fecha_hasta: '',
    });

    useEffect(() => {
        cargarAuditorias();
    }, [historiaClinicaId]);

    const cargarAuditorias = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            
            // Si hay una HC específica, filtrar por ella
            if (historiaClinicaId) {
                params.hist_clin_id = historiaClinicaId;
            }
            
            // Agregar otros filtros si están activos
            if (filtros.accion) params.accion = filtros.accion;
            if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
            if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
            
            const data = await getAuditorias(params);
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
        });
        // Recargar sin filtros después de limpiar
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

    if (loading) {
        return <div className={styles.loading}>Cargando auditorías...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.auditoriaContainer}>
            <h2>Auditoría de Pagos</h2>
            
            {/* Filtros */}
            {!historiaClinicaId && (
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
                            <option value="REGISTRO">Pago Registrado</option>
                            <option value="CANCELACION">Pago Cancelado</option>
                        </select>
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
                            <th>Fecha/Hora</th>
                            <th>Acción</th>
                            <th>Tipo de Pago</th>
                            <th>Paciente</th>
                            <th>HC</th>
                            <th>Usuario</th>
                            {/* <th>Estado</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {auditorias.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    No hay registros de auditoría.
                                </td>
                            </tr>
                        ) : (
                            auditorias.map(auditoria => (
                                <tr 
                                    key={auditoria.id}
                                    className={auditoria.accion === 'REGISTRO' ? styles.registro : styles.cancelacion}
                                >
                                    <td>{formatearFecha(auditoria.fecha_accion)}</td>
                                    <td>
                                        <span className={styles.badge}>
                                            {auditoria.accion === 'REGISTRO' ? '✓ Registrado' : '✗ Cancelado'}
                                        </span>
                                    </td>
                                    <td>{auditoria.tipo_pago_nombre}</td>
                                    <td>
                                        {auditoria.paciente_nombre}
                                        <br />
                                        <small>DNI: {auditoria.paciente_dni}</small>
                                    </td>
                                    <td>HC #{auditoria.hist_clin_numero}</td>
                                    <td>{auditoria.usuario_nombre}</td>
                                    {/* <td>
                                        {auditoria.estado_pagado ? (
                                            <span className={styles.estadoPagado}>Pagado</span>
                                        ) : (
                                            <span className={styles.estadoPendiente}>Pendiente</span>
                                        )}
                                    </td> */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.totalRegistros}>
                Total de registros: <strong>{auditorias.length}</strong>
            </div>
        </div>
    );
}