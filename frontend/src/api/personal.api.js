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
        // Si viene username, lo transformamos a username_input para el backend
        const dataToSend = { ...miembro };
        if (dataToSend.username !== undefined) {
            dataToSend.username_input = dataToSend.username;
            delete dataToSend.username;
        }
        
        // Envía el cuerpo del miembro (incluyendo puesto_id y especialidades_ids)
        const response = await personalApi.post('/', dataToSend);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el miembro del personal', error);
        throw error;
    }
}

// 🆕 ACTUALIZADO: Transforma username a username_input antes de enviar
// Llama a: /{id}/
export const updateMiembro = async (id, miembro) => {
    try {
        // Si viene username, lo transformamos a username_input para el backend
        const dataToSend = { ...miembro };
        if (dataToSend.username !== undefined) {
            dataToSend.username_input = dataToSend.username;
            delete dataToSend.username;
        }
        
        const response = await personalApi.patch(`/${id}/`, dataToSend); 
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

// src/api/personal.api.js (Función getCurrentUser)

export const getCurrentUser = async () => {
    // 🚨 CORRECCIÓN: Usar 'access_token' para que coincida con Login.jsx
    const token = localStorage.getItem('access_token'); 
    
    // Si no hay token, fallar antes de la llamada
    if (!token) {
        throw new Error('Usuario no autenticado, falta el token.');
    }

    const response = await fetch('http://localhost:8000/api/personal/me/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Enviar el token en el header 'Authorization' con el esquema 'Bearer'
            'Authorization': `Bearer ${token}` 
        },
    }); 
    
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            // Un 401 aquí probablemente significa que el token expiró o es inválido
            throw new Error('Sesión expirada o no autorizada. Por favor, vuelva a iniciar sesión.');
        }
        throw new Error('No se pudo obtener la información del usuario.');
    }
    
    return response.json();
};