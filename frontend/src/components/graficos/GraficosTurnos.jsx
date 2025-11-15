import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTurnos, getEstadosTurno } from '../../api/turnos.api'; 
import { Bar } from 'react-chartjs-2'; 
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend 
} from 'chart.js';

// 🚨 CAMBIO CLAVE: Importación como Módulo CSS
import styles from './GraficosTurnos.module.css'; 

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend
);

// ... (Resto de la función getStartDate) ...
/**
 * Retorna la fecha de inicio para el rango de filtro seleccionado.
 * @param {string} filter 'last_week', 'last_month', 'last_year', 'all'
 * @returns {Date | null} La fecha de inicio del período.
 */
const getStartDate = (filter) => {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    switch (filter) {
        case 'last_week':
            date.setDate(date.getDate() - 7);
            return date;
        case 'last_month':
            date.setMonth(date.getMonth() - 1);
            return date;
        case 'last_year':
            date.setFullYear(date.getFullYear() - 1);
            return date;
        case 'all':
        default:
            return null; 
    }
};


// ===================================================
// 2. COMPONENTE PRINCIPAL
// ===================================================

export default function GraficosTurnos() {
    const [turnos, setTurnos] = useState([]);
    const [estadosTurno, setEstadosTurno] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros
    const [filterPeriod, setFilterPeriod] = useState('last_month');
    const [filterStatus, setFilterStatus] = useState(''); 
    
    // Opciones de filtro
    const periodOptions = [
        { value: 'last_week', label: 'Última Semana' },
        { value: 'last_month', label: 'Último Mes' },
        { value: 'last_year', label: 'Último Año' },
        { value: 'all', label: 'Todos los Tiempos' },
    ];

    // ... (Lógica de Carga de Datos y Procesamiento - sin cambios) ...

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [turnosData, estadosData] = await Promise.all([
                getTurnos(), 
                getEstadosTurno()
            ]);
            setTurnos(turnosData);
            setEstadosTurno(estadosData);
        } catch (err) {
            console.error("Error al cargar datos para gráficos:", err);
            setError("Error al cargar los datos estadísticos. Intente recargar.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const { processedData, estadoNames } = useMemo(() => {
        const startDate = getStartDate(filterPeriod);
        
        // 1. FILTRAR POR PERÍODO DE TIEMPO
        const filteredByDate = turnos.filter(turno => {
            if (!startDate) return true;
            return new Date(turno.fecha_turno) >= startDate;
        });

        // 2. FILTRAR POR ESTADO (si se seleccionó uno)
        const filteredTurnos = filteredByDate.filter(turno => {
            if (!filterStatus) return true;
            return String(turno.estado_turno) === filterStatus;
        });

        // 3. PROCESAR DATOS PARA EL GRÁFICO: Contar por estado
        const countsByState = {};
        const stateNameMap = {};

        estadosTurno.forEach(estado => {
            stateNameMap[estado.id] = estado.nombre_est_tur;
        });

        filteredTurnos.forEach(turno => {
            const estadoId = turno.estado_turno; 
            countsByState[estadoId] = (countsByState[estadoId] || 0) + 1;
        });

        // Preparar datos para Chart.js
        let labels = [];
        let dataCounts = [];
        
        if (filterStatus) {
             const stateId = filterStatus;
             labels = [stateNameMap[stateId] || `Estado ID ${stateId}`];
             dataCounts = [countsByState[stateId] || 0];
        } else {
            estadosTurno.forEach(estado => {
                labels.push(estado.nombre_est_tur);
                dataCounts.push(countsByState[estado.id] || 0);
            });
        }

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: `Turnos (${periodOptions.find(p => p.value === filterPeriod)?.label})`,
                    data: dataCounts,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)', 
                        'rgba(54, 162, 235, 0.6)', 
                        'rgba(255, 206, 86, 0.6)', 
                        'rgba(75, 192, 192, 0.6)', 
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
        
        return { 
            processedData: chartData, 
            estadoNames: stateNameMap 
        };

    }, [turnos, estadosTurno, filterPeriod, filterStatus]);


    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Estadísticas de Turnos por Estado y Período',
            },
        },
    };

    // 🚨 USO DE CLASES CON CSS MODULES
    if (loading) return <div className={styles.graficosContainer}>Cargando gráficos...</div>;
    // Uso de múltiples clases
    if (error) return <div className={`${styles.graficosContainer} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.graficosContainer}>
            <h2 className={styles.graficosTitle}>📊 Estadísticas de Turnos</h2>
            
            <div className={styles.graficosControls}>
                
                {/* Filtro de Período */}
                <div className={styles.filterGroup}>
                    <label htmlFor="period-filter">Período:</label>
                    <select
                        id="period-filter"
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                        className={styles.filterSelect}
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Filtro de Estado */}
                <div className={styles.filterGroup}>
                    <label htmlFor="status-filter">Estado:</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Todos los Estados</option>
                        {estadosTurno.map(estado => (
                            <option key={estado.id} value={estado.id}>
                                {estado.nombre_est_tur}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.graficoWrapper}>
                {/* Componente de Gráfico de Barras */}
                <Bar options={chartOptions} data={processedData} />
            </div>

            <div className={styles.dataSummary}>
                <p>Total de turnos en el período seleccionado: **{processedData.datasets[0].data.reduce((sum, count) => sum + count, 0)}**</p>
            </div>
        </div>
    );
}