import axios from 'axios';

// 1. INSTANCIA DE AXIOS
// Creamos una instancia con la URL base de tu app 'pagos'
const pagosApi = axios.create({
    baseURL: 'http://localhost:8000/api/pagos', // Asumiendo que esta es la ruta raíz configurada en tu proyecto principal
    headers: {
        'Content-Type': 'application/json'
        // NOTA: La autenticación con Bearer Token debe ser manejada
        // por un interceptor global de Axios si se usa en todos los módulos.
    }
});

// ===============================================
// A. CRUD PRINCIPAL (PAGOS)
// ===============================================

/**
 * Obtiene la lista completa de pagos registrados.
 * Endpoint: GET /api/pagos/
 */
export const getPagos = async () => {
    try {
        const response = await pagosApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de pagos:', error);
        throw error;
    }
}

/**
 * Obtiene el detalle de un pago específico.
 * Endpoint: GET /api/pagos/{id}/
 */
export const getPago = async (id) => {
    try {
        const response = await pagosApi.get(`/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el pago ${id}:`, error);
        throw error;
    }
}

/**
 * Registra un nuevo pago pendiente/pagado.
 * Los datos esperados son: { tipo_pago, hist_clin, registrado_por, descripcion, pagado (opcional) }
 * Endpoint: POST /api/pagos/
 */
export const createPago = async (pagoData) => {
    try {
        const response = await pagosApi.post('/', pagoData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el pago:', error.response?.data || error);
        throw error;
    }
}

/**
 * Actualiza completamente un pago existente (PUT).
 * Endpoint: PUT /api/pagos/{id}/
 */
export const updatePago = async (id, pagoData) => {
    try {
        const response = await pagosApi.put(`/${id}/`, pagoData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el pago ${id} (PUT):`, error.response?.data || error);
        throw error;
    }
}

/**
 * Actualiza parcialmente un pago existente, ideal para cambiar solo el estado 'pagado' (PATCH).
 * Endpoint: PATCH /api/pagos/{id}/
 */
export const patchPago = async (id, partialData) => {
    try {
        const response = await pagosApi.patch(`/${id}/`, partialData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el pago ${id} (PATCH):`, error.response?.data || error);
        throw error;
    }
}

/**
 * Elimina un pago.
 * Endpoint: DELETE /api/pagos/{id}/
 */
export const deletePago = async (id) => {
    try {
        const response = await pagosApi.delete(`/${id}/`);
        // Normalmente regresa 204 No Content
        return response.data; 
    } catch (error) {
        console.error(`Error al eliminar el pago ${id}:`, error);
        throw error;
    }
}

// ===============================================
// B. LISTAS MAESTRAS (TIPOS DE PAGOS)
// ===============================================

/**
 * Obtiene la lista de opciones para el campo 'tipo_pago'.
 * Endpoint: GET /api/pagos/tipos/
 */
export const getTiposPagos = async () => {
    try {
        const response = await pagosApi.get('/tipos/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Tipos de Pagos:', error);
        throw error;
    }
}