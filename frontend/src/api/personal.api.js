import axios from 'axios'

// La baseURL ya apunta a 'http://localhost:8000/api/personal'
const personalApi = axios.create({
    baseURL: 'http://localhost:8000/api/personal',
    headers: {
        'Content-Type': 'application/json'
    }
})

// ==========================================================
// 1. FUNCIONES PRINCIPALES DE PERSONAL
// ==========================================================

// Esta función está bien. Llama a: /
export const getPersonal = async () => {
    try {
        const response = await personalApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los miembros del personal', error);
        throw error;
    }
}

// CORRECCIÓN 1: Usar backticks (`/${id}/`) para template literals
// Llama a: /{id}/
export const getMiembro = async (id) => {
    try {
        const response = await personalApi.get(`/${id}/`); 
        return response.data;
    } catch (error) {
        console.error('Error al obtener el miembro del personal', error);
        throw error;
    }
}

// Llama a: /
export const createMiembro = async (miembro) => {
    try {
        // Envía el cuerpo del miembro (incluyendo puesto_id y especialidades_ids)
        const response = await personalApi.post('/', miembro);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el miembro del personal', error);
        throw error;
    }
}

// CORRECCIÓN 2: Usar backticks (`/${id}/`) para template literals
// Llama a: /{id}/
export const updateMiembro = async (id, miembro) => {
    try {
        const response = await personalApi.put(`/${id}/`, miembro); 
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el miembro del personal', error);
        throw error;
    }
}

// CORRECCIÓN 3: Usar `.delete()` y backticks (`/${id}/`)
// Llama a: /{id}/
export const deleteMiembro = async (id) => {
    try {
        const response = await personalApi.delete(`/${id}/`); 
        return response.data; 
    } catch (error) {
        console.error('Error al eliminar el miembro del personal', error);
        throw error;
    }
}


// ==========================================================
// 2. NUEVAS FUNCIONES PARA SELECTORES (PUESTOS Y ESPECIALIDADES)
// ==========================================================

/**
 * Obtiene la lista completa de Puestos.
 * Llama a: /puestos/
 */
export const getPuestos = async () => {
    try {
        // Se concatena a la baseURL: http://localhost:8000/api/personal + puestos/
        const response = await personalApi.get('puestos/'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de puestos:", error);
        throw error;
    }
};

/**
 * Obtiene la lista completa de Especialidades.
 * Llama a: /especialidades/
 */
export const getEspecialidades = async () => {
    try {
        // Se concatena a la baseURL: http://localhost:8000/api/personal + especialidades/
        const response = await personalApi.get('especialidades/'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de especialidades:", error);
        throw error;
    }
};