import React, { useState, useEffect, useCallback } from 'react';
import ModalAdd from '../modalAdd/ModalAdd';
import { useAlert } from '../../hooks/useAlert';
import { useConfirm } from '../../hooks/useConfirm';
import { getPagos, getTiposPagos, createPago, patchPago } from '../../api/pagos.api'; 
import styles from './PagosModal.module.css'; 

export default function PagosModal({ historiaClinica, currentPersonalId, esOrtodoncia, onClose }) {
    const { showSuccess, showError } = useAlert();
    const { showConfirm } = useConfirm();
    
    const [pagosDisplay, setPagosDisplay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    // 🚨 LÓGICA DE FILTRADO MEJORADA
    const fetchDatosDePagos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [todosLosTiposDePago, todosLosPagos] = await Promise.all([
                getTiposPagos(),
                getPagos() 
            ]);

            // 🚨 FILTRAR TIPOS DE PAGO SEGÚN SI ES ORTODONCIA O NO
            // Función auxiliar para detectar "Pago único" por nombre
            const esPagoUnico = (nombreTipoPago) => {
                const nombre = nombreTipoPago.toLowerCase().trim();
                return nombre.includes('pago único') || 
                       nombre.includes('pago unico') ||
                       nombre === 'único' ||
                       nombre === 'unico';
            };

            let tiposDePagoFiltrados;
            
            if (esOrtodoncia) {
                // Si es ortodoncia: Mostrar TODO excepto "Pago único"
                tiposDePagoFiltrados = todosLosTiposDePago.filter(
                    tipo => !esPagoUnico(tipo.nombre_tipo_pago)
                );
            } else {
                // Si NO es ortodoncia: Mostrar SOLO "Pago único"
                tiposDePagoFiltrados = todosLosTiposDePago.filter(
                    tipo => esPagoUnico(tipo.nombre_tipo_pago)
                );
            }

            // Filtrar los pagos que pertenecen solo a esta Historia Clínica
            const pagosDeEstaHC = todosLosPagos.filter(
                pago => pago.hist_clin === historiaClinica.id
            );

            // Fusionar las listas (solo con los tipos filtrados)
            const listaFusionada = tiposDePagoFiltrados.map(tipoPago => {
                const pagoExistente = pagosDeEstaHC.find(
                    p => p.tipo_pago === tipoPago.id
                );

                if (pagoExistente) {
                    return {
                        tipoPagoId: tipoPago.id,
                        tipoPagoNombre: tipoPago.nombre_tipo_pago,
                        pagoId: pagoExistente.id,
                        pagado: pagoExistente.pagado,
                        fecha_pago: pagoExistente.fecha_pago,
                        // 🚨 USAR EL NOMBRE CORRECTO DEL SERIALIZER
                        registrado_por_nombre: pagoExistente.registrado_por_nombre || 'N/A',
                        existe: true
                    };
                } else {
                    return {
                        tipoPagoId: tipoPago.id,
                        tipoPagoNombre: tipoPago.nombre_tipo_pago,
                        pagoId: null,
                        pagado: false,
                        fecha_pago: null,
                        registrado_por_nombre: 'N/A',
                        existe: false
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
    }, [historiaClinica.id, esOrtodoncia]); // 🚨 Agregamos esOrtodoncia como dependencia

    useEffect(() => {
        fetchDatosDePagos();
    }, [fetchDatosDePagos]);

    const handleTogglePagado = async (itemPagoDisplay) => {
        if (saving) return;
        
        const nuevoEstado = !itemPagoDisplay.pagado;
        
        // 🚨 CONFIRMACIÓN ANTES DE CAMBIAR EL ESTADO
        const mensaje = nuevoEstado 
            ? `¿Está seguro de registrar el pago de "${itemPagoDisplay.tipoPagoNombre}"?`
            : `¿Está seguro de desmarcar el pago de "${itemPagoDisplay.tipoPagoNombre}"?\n\nEsto eliminará el registro de pago.`;
        
        const confirmado = await showConfirm(mensaje);
        
        if (!confirmado) {
            return; // Si el usuario cancela, no hacer nada
        }
        
        setSaving(true);

        // Actualización optimista (UI instantánea)
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
                // Lógica de actualización (PATCH)
                const payload = {
                    pagado: nuevoEstado,
                    // 🚨 SIEMPRE ENVIAR EL USUARIO ACTUAL (quien hace la acción)
                    registrado_por: currentPersonalId
                };
                pagoActualizadoServidor = await patchPago(itemPagoDisplay.pagoId, payload);
            
            } else if (nuevoEstado === true) { 
                // Lógica de creación (POST)
                const payload = {
                    pagado: true,
                    hist_clin: historiaClinica.id,
                    tipo_pago: itemPagoDisplay.tipoPagoId,
                    registrado_por: currentPersonalId
                };
                pagoActualizadoServidor = await createPago(payload);
            
            } else {
                setSaving(false);
                return; 
            }

            // Resincronizar estado con el servidor
            setPagosDisplay(prevPagos => 
                prevPagos.map(p => {
                    if (p.tipoPagoId === pagoActualizadoServidor.tipo_pago) {
                        return {
                            ...p,
                            pagoId: pagoActualizadoServidor.id,
                            pagado: pagoActualizadoServidor.pagado,
                            fecha_pago: pagoActualizadoServidor.fecha_pago,
                            registrado_por_nombre: pagoActualizadoServidor.registrado_por_nombre,
                            existe: true
                        };
                    }
                    return p;
                })
            );

        } catch (err) {
            console.error("Error al guardar el pago:", err);
            setError("Error al guardar el cambio. Refrescando...");
            fetchDatosDePagos();
        } finally {
            setSaving(false);
        }
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return 'Pendiente';
        return new Date(fechaISO).toLocaleDateString('es-ES');
    };

    const pacienteNombre = historiaClinica.paciente_nombre || `Paciente ID ${historiaClinica.paciente}`;

    return (
        <ModalAdd 
            isOpen={true} 
            onClose={onClose} 
            title={`Pagos de HC N° ${historiaClinica.id} - (${pacienteNombre})`}
        >
            <div className={styles.pagosContainer}>
                {loading && <p>Cargando pagos...</p>}
                {error && <p className={styles.error}>{error}</p>}
                
                {!loading && !error && (
                    <>
                        {/* <div className={styles.infoBox}>
                            {esOrtodoncia ? (
                                <p>📋 <strong>Tratamiento de Ortodoncia:</strong> Se muestran entregas y cuotas.</p>
                            ) : (
                                <p>💰 <strong>Tratamiento único:</strong> Solo pago único disponible.</p>
                            )}
                        </div> */}

                        <table className={styles.pagosTable}>
                            <thead>
                                <tr>
                                    <th>Concepto (Tipo de Pago)</th>
                                    <th>Registrado / Cancelado por</th>
                                    <th>Pagado</th>
                                    <th>Fecha de Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagosDisplay.length === 0 ? (
                                    <tr>
                                        <td colSpan="4">
                                            {esOrtodoncia 
                                                ? "No se encontraron tipos de pago configurados para ortodoncia."
                                                : "No se encontró configuración de pago único."}
                                        </td>
                                    </tr>
                                ) : (
                                    pagosDisplay.map(item => (
                                        <tr key={item.tipoPagoId} className={item.pagado ? styles.pagado : styles.pendiente}>
                                            <td>{item.tipoPagoNombre || 'N/A'}</td>
                                            <td>{item.registrado_por_nombre || 'N/A'}</td>
                                            
                                            <td className={styles.checkboxCell}>
                                                <input 
                                                    type="checkbox"
                                                    checked={item.pagado}
                                                    onChange={() => handleTogglePagado(item)}
                                                    disabled={saving}
                                                />
                                            </td>
                                            <td>{formatearFecha(item.fecha_pago)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </>
                )}

                <div className={styles.modalFooter}>
                    <button 
                        type="button" 
                        className={styles.cancelButton} 
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </ModalAdd>
    );
}