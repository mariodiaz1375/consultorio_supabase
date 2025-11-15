import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getHistoriasClinicas } from '../../api/historias.api'; // Necesitamos esta función
import { Bar } from 'react-chartjs-2'; 
// Reutilizamos el mismo CSS Module para mantener los estilos consistentes
import styles from './GraficosTurnos.module.css'; 

// Las registraciones de ChartJS (CategoryScale, BarElement, etc.) 
// se asumen ya realizadas en GraficosTurnos.jsx o en un archivo de configuración central.

// ===================================================
// 1. HELPERS DE FECHAS (REUTILIZADO)
// ===================================================

/**
 * Retorna la fecha de inicio para el rango de filtro seleccionado.
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

// ===================================================
// 2. COMPONENTE PRINCIPAL
// ===================================================

export default function GraficosTratamientos() {
    const [historias, setHistorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtro de Período
    const [filterPeriod, setFilterPeriod] = useState('last_month'); 
    
    // ===================================================
    // 3. CARGA DE DATOS
    // ===================================================

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

    // ===================================================
    // 4. LÓGICA DE FILTRADO Y PROCESAMIENTO
    // ===================================================

    const processedData = useMemo(() => {
        const startDate = getStartDate(filterPeriod);
        const treatmentCounts = {};

        // 1. ITERAR Y FILTRAR POR FECHA Y ESTADO
        historias.forEach(hc => {
            if (startDate) {
                // Parseamos la fecha_fin (viene en formato ISO con zona horaria)
                const initialDate = new Date(hc.fecha_inicio); 
                if (initialDate < startDate) return;
            }

            // 2. CONTAR TRATAMIENTOS
            if (hc.detalles && hc.detalles.length > 0) {
                const treatmentName = hc.detalles[0].tratamiento_nombre
                treatmentCounts[treatmentName] = (treatmentCounts[treatmentName] || 0) + 1;
            }
        });

        // 3. CONVERTIR A ARRAY, ORDENAR Y TOMAR EL TOP 5
        const top5Treatments = Object.entries(treatmentCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count) // Ordenar descendente
            .slice(0, 5); // Tomar solo los primeros 5

        // 4. PREPARAR DATOS PARA Chart.js
        const labels = top5Treatments.map(t => t.name);
        const dataCounts = top5Treatments.map(t => t.count);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: `Top 5 Tratamientos (${periodOptions.find(p => p.value === filterPeriod)?.label})`,
                    data: dataCounts,
                    // Colores de ejemplo
                    backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'], 
                    borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                },
            ],
        };
        
        return chartData;

    }, [historias, filterPeriod]);

    // Opciones del gráfico (Chart.js)
    const chartOptions = {
        indexAxis: 'y', // Hace el gráfico de barras horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Top 5 Tratamientos Aplicados',
            },
        },
        scales: {
            x: {
                beginAtZero: true
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
                
                {/* Filtro de Período */}
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
                {/* Componente de Gráfico de Barras (horizontal) */}
                <Bar options={chartOptions} data={processedData} />
            </div>

            <div className={styles.dataSummary}>
                <p>
                    Total de tratamientos aplicados (Top 5): **{processedData.datasets[0].data.reduce((sum, count) => sum + count, 0)}**
                </p>
            </div>
        </div>
    );
}