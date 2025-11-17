import React, { useState, useEffect, useCallback } from 'react'; // 👈 Importar useCallback
import { getAuditorias } from '../../api/pagos.api';
import styles from './AuditoriaPagos.module.css';

// Variable para la paginación
const REGISTROS_POR_PAGINA = 10;

export default function AuditoriaPagos({ historiaClinicaId = null }) {
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADO DE PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalRegistros, setTotalRegistros] = useState(0);
    // ----------------------------
    
    // Filtros
    const [filtros, setFiltros] = useState({
        accion: '',
        fecha_desde: '',
        fecha_hasta: '',
    });

    // 👇 1. Envolver cargarAuditorias en useCallback
    const cargarAuditorias = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: paginaActual // 👈 AÑADIR PÁGINA ACTUAL
            };
            
            if (historiaClinicaId) {
                params.hist_clin_id = historiaClinicaId;
            }
            
            if (filtros.accion) params.accion = filtros.accion;
            if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
            if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
            
            // 👇 LA RESPUESTA DE LA API AHORA SERÁ UN OBJETO PAGINADO
            const data = await getAuditorias(params);
            
            setAuditorias(data.results); // 👈 Los datos están en 'results'
            setTotalRegistros(data.count); // 👈 El total está en 'count'

        } catch (err) {
            console.error('Error al cargar auditorías:', err);
            setError('No se pudieron cargar los registros de auditoría.');
        } finally {
            setLoading(false);
        }
    }, [filtros, historiaClinicaId, paginaActual]); // 👈 Dependencias de useCallback

    // 👇 2. useEffect "escucha" a cargarAuditorias
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

    const aplicarFiltros = () => {
        setPaginaActual(1); // Resetear a página 1 al filtrar manualmente
        cargarAuditorias(); // Cargar con los filtros actuales
    };

    // 👇 3. Corregir limpiarFiltros
    const limpiarFiltros = () => {
        setFiltros({
            accion: '',
            fecha_desde: '',
            fecha_hasta: '',
        });
        setPaginaActual(1); // 👈 RESETEAR A PÁGINA 1 AL LIMPIAR
        // Ya no se necesita setTimeout, el useEffect se encargará
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
            
            {!historiaClinicaId && (
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

                    {/* <button onClick={aplicarFiltros} className={styles.btnFiltrar}>
                        Filtrar
                    </button> */}
                    <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
                        Limpiar filtros
                    </button>
                </div>
            )}

            {/* (Tabla no cambia) ... */}
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