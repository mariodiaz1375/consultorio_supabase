import React, { useState, useEffect, useCallback } from 'react';
import ModalAdd from '../modalAdd/ModalAdd'; // Reutilizamos el modal genérico
import { getPagos, updatePago } from '../../api/pagos.api';
import styles from './PagosModal.module.css'; // Crearemos este archivo de estilos

export default function PagosModal({ historiaClinica, onClose }) {
    
    // Estado local para manejar los pagos (incluyendo cambios en checkboxes)
    const [pagos, setPagos] = useState([]);
    // Estado original para comparar cambios (si quisiéramos un botón "Guardar" general)
    const [originalPagos, setOriginalPagos] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false); // Para deshabilitar checkboxes mientras se guarda

    // Cargar los pagos asociados a la HC
    const fetchPagos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPagos(historiaClinica.id);
            setPagos(response.data);
            setOriginalPagos(response.data); // Guarda la copia original
        } catch (err) {
            console.error("Error al cargar pagos:", err);
            setError("No se pudieron cargar los pagos.");
        } finally {
            setLoading(false);
        }
    }, [historiaClinica.id]);

    useEffect(() => {
        fetchPagos();
    }, [fetchPagos]);

    /**
     * Maneja el clic en un checkbox de pago.
     * Realiza una actualización optimista y llama a la API inmediatamente.
     */
    const handleTogglePagado = async (pagoAActualizar) => {
        if (saving) return; // Evitar clics múltiples si ya se está guardando
        
        setSaving(true);
        const pagoId = pagoAActualizar.id;
        const nuevoEstado = !pagoAActualizar.pagado;

        // 1. Actualización optimista (UI instantánea)
        setPagos(prevPagos => 
            prevPagos.map(p => 
                p.id === pagoId ? { ...p, pagado: nuevoEstado } : p
            )
        );

        try {
            // 2. Llamada a la API
            const response = await updatePago(pagoId, { pagado: nuevoEstado });
            const pagoActualizadoServidor = response.data;

            // 3. Resincronizar estado con el servidor (para obtener fecha_pago)
            // (El backend actualiza fecha_pago automáticamente)
            setPagos(prevPagos => 
                prevPagos.map(p => 
                    p.id === pagoId ? pagoActualizadoServidor : p
                )
            );
            // Actualizar también el original para el botón "Guardar" (si se usara)
            setOriginalPagos(prevPagos =>
                prevPagos.map(p => 
                    p.id === pagoId ? pagoActualizadoServidor : p
                )
            );

        } catch (err) {
            console.error("Error al actualizar el pago:", err);
            setError("Error al guardar el cambio. Revirtiendo.");
            // 4. Revertir en caso de error
            setPagos(originalPagos);
        } finally {
            setSaving(false);
        }
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Pendiente';
        return new Date(fechaISO).toLocaleDateString();
    };

    return (
        <ModalAdd 
            isOpen={true} 
            onClose={onClose} 
            title={`Pagos de HC N° ${historiaClinica.id} (${historiaClinica.paciente.__str__})`}
        >
            <div className={styles.pagosContainer}>
                {loading && <p>Cargando pagos...</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                {!loading && !error && (
                    <table className={styles.pagosTable}>
                        <thead>
                            <tr>
                                <th>Entrega</th>
                                <th>Cuota</th>
                                <th>Pagado</th>
                                <th>Fecha de Pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.length === 0 ? (
                                <tr>
                                    <td colSpan="4">No hay pagos registrados para esta HC.</td>
                                </tr>
                            ) : (
                                pagos.map(pago => (
                                    <tr key={pago.id} className={pago.pagado ? styles.pagado : styles.pendiente}>
                                        <td>{pago.entrega_info?.nombre_ent || 'N/A'}</td>
                                        <td>{pago.cuota_info?.nombre_cuota || 'N/A'}</td>
                                        <td className={styles.checkboxCell}>
                                            <input 
                                                type="checkbox"
                                                checked={pago.pagado}
                                                onChange={() => handleTogglePagado(pago)}
                                                disabled={saving} // Deshabilitar mientras guarda
                                            />
                                        </td>
                                        <td>{formatearFecha(pago.fecha_pago)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                <div className={styles.modalFooter}>
                    <button 
                        type="button" 
                        className={styles.cancelButton} 
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    {/* NOTA: El guardado es automático al hacer clic en el checkbox.
                      Si prefieres un botón "Guardar" general, la lógica de handleSave 
                      debería comparar 'pagos' con 'originalPagos' y enviar múltiples
                      requests a la API.
                    */}
                </div>
            </div>
        </ModalAdd>
    );
}