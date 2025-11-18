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

export default function GraficosTurnos() {
    const [turnos, setTurnos] = useState([]);
    const [estadosTurno, setEstadosTurno] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filterPeriod, setFilterPeriod] = useState('last_month');
    const [filterStatus, setFilterStatus] = useState(''); 
    
    const periodOptions = [
        { value: 'last_week', label: 'Última Semana' },
        { value: 'last_month', label: 'Último Mes' },
        { value: 'last_year', label: 'Último Año' },
        { value: 'all', label: 'Todos los Tiempos' },
    ];

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
        
        const filteredByDate = turnos.filter(turno => {
            if (!startDate) return true;
            return new Date(turno.fecha_turno) >= startDate;
        });

        const filteredTurnos = filteredByDate.filter(turno => {
            if (!filterStatus) return true;
            return String(turno.estado_turno) === filterStatus;
        });

        const countsByState = {};
        const stateNameMap = {};

        estadosTurno.forEach(estado => {
            stateNameMap[estado.id] = estado.nombre_est_tur;
        });

        filteredTurnos.forEach(turno => {
            const estadoId = turno.estado_turno; 
            countsByState[estadoId] = (countsByState[estadoId] || 0) + 1;
        });

        let labels = [];
        let dataCounts = [];
        let backgroundColors = [];
        let borderColors = [];
        
        // Función para asignar color según el nombre del estado
        const getColorForState = (stateName) => {
            const nameLower = stateName.toLowerCase();
            
            if (nameLower.includes('atendido') || nameLower.includes('completado') || nameLower.includes('finalizado')) {
                return {
                    bg: 'rgba(34, 197, 94, 0.8)',  // Verde
                    border: 'rgba(34, 197, 94, 1)'
                };
            } else if (nameLower.includes('cancelado') || nameLower.includes('rechazado') || nameLower.includes('anulado')) {
                return {
                    bg: 'rgba(239, 68, 68, 0.8)',  // Rojo
                    border: 'rgba(239, 68, 68, 1)'
                };
            } else if (nameLower.includes('agendado') || nameLower.includes('pendiente') || nameLower.includes('programado')) {
                return {
                    bg: 'rgba(59, 130, 246, 0.8)',  // Azul
                    border: 'rgba(59, 130, 246, 1)'
                };
            } else {
                // Color por defecto (púrpura) para otros estados
                return {
                    bg: 'rgba(139, 92, 246, 0.8)',
                    border: 'rgba(139, 92, 246, 1)'
                };
            }
        };
        
        if (filterStatus) {
             const stateId = filterStatus;
             const stateName = stateNameMap[stateId] || `Estado ID ${stateId}`;
             labels = [stateName];
             dataCounts = [countsByState[stateId] || 0];
             
             const colors = getColorForState(stateName);
             backgroundColors = [colors.bg];
             borderColors = [colors.border];
        } else {
            estadosTurno.forEach(estado => {
                labels.push(estado.nombre_est_tur);
                dataCounts.push(countsByState[estado.id] || 0);
                
                const colors = getColorForState(estado.nombre_est_tur);
                backgroundColors.push(colors.bg);
                borderColors.push(colors.border);
            });
        }

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: `Turnos (${periodOptions.find(p => p.value === filterPeriod)?.label})`,
                    data: dataCounts,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
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
                display: false, // Ocultar la leyenda ya que el color indica el estado
            },
            title: {
                display: true,
                text: 'Estadísticas de Turnos por Estado y Período',
                color: 'white',
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                }
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(102, 126, 234, 0.1)',
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: 'rgba(102, 126, 234, 0.1)',
                    drawBorder: false
                }
            }
        }
    };

    if (loading) return <div className={styles.graficosContainer}>Cargando gráficos...</div>;
    if (error) return <div className={`${styles.graficosContainer} ${styles.error}`}>{error}</div>;

    return (
        <div className={styles.graficosContainer}>
            <h2 className={styles.graficosTitle}>📊 Estadísticas de Turnos</h2>
            
            <div className={styles.graficosControls}>
                
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
                <Bar options={chartOptions} data={processedData} />
            </div>

            <div className={styles.dataSummary}>
                <p>Total de turnos en el período seleccionado: <strong>{processedData.datasets[0].data.reduce((sum, count) => sum + count, 0)}</strong></p>
            </div>
        </div>
    );
}