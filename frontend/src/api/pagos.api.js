import axios from 'axios';

// 1. INSTANCIA DE AXIOS CON CONFIGURACIÓN BASE
const pagosApi = axios.create({
    baseURL: 'http://localhost:8000/api/pagos',
    headers: {
        'Content-Type': 'application/json'
    }
});

// 🚨 INTERCEPTOR: Agregar el token a cada petición
pagosApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🚨 INTERCEPTOR DE RESPUESTA: Manejar errores de autenticación
pagosApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        }
        return Promise.reject(error);
    }
);

// ===============================================
// A. CRUD PRINCIPAL (PAGOS)
// ===============================================

export const getPagos = async () => {
    try {
        const response = await pagosApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de pagos:', error);
        throw error;
    }
}

export const getPago = async (id) => {
    try {
        const response = await pagosApi.get(`/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el pago ${id}:`, error);
        throw error;
    }
}

export const createPago = async (pagoData) => {
    try {
        const response = await pagosApi.post('/', pagoData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el pago:', error.response?.data || error);
        throw error;
    }
}

export const updatePago = async (id, pagoData) => {
    try {
        const response = await pagosApi.put(`/${id}/`, pagoData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el pago ${id} (PUT):`, error.response?.data || error);
        throw error;
    }
}

export const patchPago = async (id, partialData) => {
    try {
        const response = await pagosApi.patch(`/${id}/`, partialData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el pago ${id} (PATCH):`, error.response?.data || error);
        throw error;
    }
}

export const deletePago = async (id) => {
    try {
        const response = await pagosApi.delete(`/${id}/`);
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
 * 🚨 RUTA CORREGIDA: /tipos-pagos/
 */
export const getTiposPagos = async () => {
    try {
        const response = await pagosApi.get('/tipos-pagos/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Tipos de Pagos:', error);
        throw error;
    }
}

// ===============================================
// C. AUDITORÍA DE PAGOS
// ===============================================

export const getAuditorias = async (filtros = {}) => {
    try {
        const response = await pagosApi.get('/auditoria/', {
            params: filtros
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener auditorías:', error);
        throw error;
    }
}

export const getAuditoriaDetail = async (id) => {
    try {
        const response = await pagosApi.get(`/auditoria/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener auditoría ${id}:`, error);
        throw error;
    }
}