import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getHistoriasClinicas } from '../../api/historias.api';
import { Bar } from 'react-chartjs-2'; 
import styles from './GraficosTurnos.module.css'; 

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
        default:
            return null; 
    }
};

const periodOptions = [
    { value: 'last_week', label: 'Última Semana' },
    { value: 'last_month', label: 'Último Mes' },
    { value: 'last_year', label: 'Último Año' },
    { value: 'all_time', label: 'Todos los Tiempos' },
];

export default function GraficosTratamientos() {
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [filterPeriod, setFilterPeriod] = useState('last_month'); 

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getHistoriasClinicas(); 
            setHistorias(data);
        } catch (err) {
            console.error("Error al cargar Historias Clínicas para gráficos:", err);
            setError("Error al cargar los datos de tratamientos. Intente recargar.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const processedData = useMemo(() => {
        const startDate = getStartDate(filterPeriod);
        const treatmentCounts = {};

        historias.forEach(hc => {
            if (startDate) {
                const initialDate = new Date(hc.fecha_inicio); 
                if (initialDate < startDate) return;
            }

            if (hc.detalles && hc.detalles.length > 0) {
                const treatmentName = hc.detalles[0].tratamiento_nombre
                treatmentCounts[treatmentName] = (treatmentCounts[treatmentName] || 0) + 1;
            }
        });

        const top5Treatments = Object.entries(treatmentCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const labels = top5Treatments.map(t => t.name);
        const dataCounts = top5Treatments.map(t => t.count);

        // Colores actualizados con degradados elegantes
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: `Top 5 Tratamientos (${periodOptions.find(p => p.value === filterPeriod)?.label})`,
                    data: dataCounts,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',  // Azul principal
                        'rgba(139, 92, 246, 0.8)',   // Púrpura
                        'rgba(236, 72, 153, 0.8)',   // Rosa
                        'rgba(59, 130, 246, 0.8)',   // Azul claro
                        'rgba(167, 139, 250, 0.8)',  // Púrpura claro
                    ], 
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(167, 139, 250, 1)',
                    ],
                    borderWidth: 2,
                },
            ],
        };
        
        return chartData;

    }, [historias, filterPeriod]);

    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'rgba(255, 255, 255, 0.9)',
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    padding: 15
                }
            },
            title: {
                display: true,
                text: 'Top 5 Tratamientos Aplicados',
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
                beginAtZero: true,
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

    if (loading) return <div className={styles.graficosContainer}>Cargando top tratamientos...</div>;
    if (error) return <div className={`${styles.graficosContainer} ${styles.error}`}>{error}</div>;
    
    if (processedData.labels.length === 0) {
        return (
             <div className={styles.graficosContainer}>
                 <h2 className={styles.graficosTitle}>🧪 Top 5 Tratamientos Aplicados</h2>
                 <p className={styles.dataSummary}>No hay tratamientos finalizados en el período seleccionado.</p>
            </div>
        );
    }

    return (
        <div className={styles.graficosContainer}>
            <h2 className={styles.graficosTitle}>🧪 Top 5 Tratamientos Aplicados</h2>
            
            <div className={styles.graficosControls}>
                
                <div className={styles.filterGroup}>
                    <label htmlFor="period-filter-trat">Período:</label>
                    <select
                        id="period-filter-trat"
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
            </div>

            <div className={styles.graficoWrapper}>
                <Bar options={chartOptions} data={processedData} />
            </div>

            <div className={styles.dataSummary}>
                <p>
                    Total de tratamientos aplicados (Top 5): <strong>{processedData.datasets[0].data.reduce((sum, count) => sum + count, 0)}</strong>
                </p>
            </div>
        </div>
    );
}