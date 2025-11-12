import React, { useState, useEffect, useCallback } from 'react';
import ModalAdd from '../modalAdd/ModalAdd'; // Reutilizamos el modal genérico
// 🚨 IMPORTAMOS LAS FUNCIONES NECESARIAS
import { getPagos, getTiposPagos, createPago, patchPago } from '../../api/pagos.api'; 
import styles from './PagosModal.module.css'; 

export default function PagosModal({ historiaClinica, currentPersonalId, onClose }) {
    
    // 🚨 ESTADO NUEVO:
    // Este estado contendrá la "lista maestra" fusionada.
    // Incluirá todos los Tipos de Pago, con datos de pago si existen.
    const [pagosDisplay, setPagosDisplay] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false); // Para deshabilitar checkboxes mientras se guarda

    // 🚨 LÓGICA DE CARGA MEJORADA:
    // Carga TODOS los Tipos de Pago y TODOS los Pagos,
    // luego los fusiona para esta HC.
    const fetchDatosDePagos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Hacemos ambas llamadas a la API en paralelo
            const [todosLosTiposDePago, todosLosPagos] = await Promise.all([
                getTiposPagos(),
                getPagos() 
            ]);

            // 2. Filtramos los pagos que pertenecen solo a esta Historia Clínica
            const pagosDeEstaHC = todosLosPagos.filter(
                pago => pago.hist_clin === historiaClinica.id
            );

            // 3. Fusionamos las listas (LA LÓGICA CLAVE)
            const listaFusionada = todosLosTiposDePago.map(tipoPago => {
                // Buscamos si existe un pago para este tipo y esta HC
                const pagoExistente = pagosDeEstaHC.find(
                    p => p.tipo_pago === tipoPago.id
                );

                if (pagoExistente) {
                    // Si existe, devolvemos los datos del pago
                    return {
                        tipoPagoId: tipoPago.id,
                        tipoPagoNombre: tipoPago.nombre_tipo_pago,
                        pagoId: pagoExistente.id, // ID del registro de Pago
                        pagado: pagoExistente.pagado,
                        fecha_pago: pagoExistente.fecha_pago,
                        registrado_por_nombre: pagoExistente.registrado_por_nombre,
                        existe: true // Bandera para saber si actualizamos (PATCH)
                    };
                } else {
                    // Si NO existe, devolvemos un placeholder
                    return {
                        tipoPagoId: tipoPago.id,
                        tipoPagoNombre: tipoPago.nombre_tipo_pago,
                        pagoId: null, // No hay registro de Pago
                        pagado: false,
                        fecha_pago: null,
                        registrado_por_nombre: 'N/A',
                        existe: false // Bandera para saber si creamos (POST)
                    };
                }
            });

            setPagosDisplay(listaFusionada);

        } catch (err) {
            console.error("Error al cargar datos de pagos:", err);
            setError("No se pudieron cargar los datos de pagos.");
        } finally {
            setLoading(false);
        }
    }, [historiaClinica.id]); // Dependencia: solo el ID de la HC

    useEffect(() => {
        fetchDatosDePagos();
    }, [fetchDatosDePagos]);

    /**
     * 🚨 LÓGICA DE ACTUALIZACIÓN/CREACIÓN MEJORADA
     * Maneja el clic en un checkbox.
     * Decide si debe CREAR (POST) o ACTUALIZAR (PATCH) un pago.
     */
    const handleTogglePagado = async (itemPagoDisplay) => {
        if (saving) return; // Evitar clics múltiples
        
        setSaving(true);
        const nuevoEstado = !itemPagoDisplay.pagado;

        // 1. Actualización optimista (UI instantánea)
        setPagosDisplay(prevPagos => 
            prevPagos.map(p => 
                p.tipoPagoId === itemPagoDisplay.tipoPagoId 
                    ? { ...p, pagado: nuevoEstado } 
                    : p
            )
        );

        try {
            let pagoActualizadoServidor;

            if (itemPagoDisplay.existe) {
                // --- LÓGICA DE ACTUALIZACIÓN (PATCH) ---
                const payload = {
                    pagado: nuevoEstado,
                    // Si se desmarca, quitamos quien lo registró
                    registrado_por: nuevoEstado ? currentPersonalId : null
                };
                pagoActualizadoServidor = await patchPago(itemPagoDisplay.pagoId, payload);
            
            } else if (nuevoEstado === true) { 
                // --- LÓGICA DE CREACIÓN (POST) ---
                // Solo creamos si se marca como pagado (nuevoEstado es true)
                const payload = {
                    pagado: true,
                    hist_clin: historiaClinica.id,
                    tipo_pago: itemPagoDisplay.tipoPagoId,
                    registrado_por: currentPersonalId
                };
                pagoActualizadoServidor = await createPago(payload);
            
            } else {
                // Si el item no existía y se "desmarcó" (de false a false), no hacemos nada
                setSaving(false);
                return; 
            }

            // 3. Resincronizar estado con el servidor (para obtener ID, fecha_pago, etc.)
            setPagosDisplay(prevPagos => 
                prevPagos.map(p => {
                    if (p.tipoPagoId === pagoActualizadoServidor.tipo_pago) {
                        // Actualizamos el item con los datos del servidor
                        return {
                            ...p, // Mantiene tipoPagoId y tipoPagoNombre
                            pagoId: pagoActualizadoServidor.id,
                            pagado: pagoActualizadoServidor.pagado,
                            fecha_pago: pagoActualizadoServidor.fecha_pago,
                            registrado_por_nombre: pagoActualizadoServidor.registrado_por_nombre,
                            existe: true // Ahora SÍ existe
                        };
                    }
                    return p; // Devolvemos los demás items sin cambios
                })
            );

        } catch (err) {
            console.error("Error al guardar el pago:", err);
            setError("Error al guardar el cambio. Refrescando...");
            // 4. Revertir en caso de error (volviendo a cargar todo)
            fetchDatosDePagos();
        } finally {
            setSaving(false);
        }
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Pendiente';
        // Formato: DD/MM/AAAA
        return new Date(fechaISO).toLocaleDateString('es-ES');
    };

    // Asumimos que historiaClinica.paciente_nombre existe gracias al serializer
    const pacienteNombre = historiaClinica.paciente_nombre || `Paciente ID ${historiaClinica.paciente}`;

    return (
        <ModalAdd 
            isOpen={true} 
            onClose={onClose} 
            title={`Pagos de HC N° ${historiaClinica.id} (${pacienteNombre})`}
        >
            <div className={styles.pagosContainer}>
                {loading && <p>Cargando pagos...</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                {!loading && !error && (
                    <table className={styles.pagosTable}>
                        <thead>
                            <tr>
                                <th>Concepto (Tipo de Pago)</th>
                                <th>Registrado Por</th>
                                <th>Pagado</th>
                                <th>Fecha de Pago</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagosDisplay.length === 0 ? (
                                <tr>
                                    <td colSpan="4">No se encontraron Tipos de Pago configurados.</td>
                                </tr>
                            ) : (
                                // 🚨 Iteramos sobre la lista fusionada
                                pagosDisplay.map(item => (
                                    <tr key={item.tipoPagoId} className={item.pagado ? styles.pagado : styles.pendiente}>
                                        
                                        <td>{item.tipoPagoNombre || 'N/A'}</td>
                                        <td>{item.registrado_por_nombre || 'N/A'}</td>
                                        
                                        <td className={styles.checkboxCell}>
                                            <input 
                                                type="checkbox"
                                                checked={item.pagado}
                                                // 🚨 Usamos la nueva lógica de handleToggle
                                                onChange={() => handleTogglePagado(item)}
                                                disabled={saving} // Deshabilitar mientras guarda
                                            />
                                        </td>
                                        <td>{formatearFecha(item.fecha_pago)}</td>
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
                        disabled={saving} // Deshabilitar si se está guardando algo
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </ModalAdd>
    );
}