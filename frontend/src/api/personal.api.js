// import axios from 'axios'

// const personalApi = axios.create({
//     baseURL: 'http://localhost:8000/api/personal',
//     headers: {
//         'Content-Type': 'application/json'
//     }
// })

// export const getPersonal = async () => {
//     try {
//         const response = await personalApi.get('/');
//         return response.data;
//     } catch (error) {
//         console.error('Error al obtener los miembros del personal', error);
//         throw error;
//     }
// }

// export const getMiembro = async (id) => {
//     try {
//         const response = await personalApi.get('/${id}/');
//         return response.data;
//     } catch (error) {
//         console.error('Error al obtener el miembro del personal', error);
//         throw error;
//     }
// }

// export const createMiembro = async (miembro) => {
//     try {
//         const response = await personalApi.post('/', miembro);
//         return response.data;
//     } catch (error) {
//         console.error('Error al registrar el miembro del personal', error);
//         throw error;
//     }
// }

// export const updateMiembro = async (id, miembro) => {
//     try {
//         const response = await personalApi.put('/${id}/', miembro);
//         return response.data;
//     } catch (error) {
//         console.error('Error al registrar el miembro del personal', error);
//         throw error;
//     }
// }

// export const deleteMiembro = async (id) => {
//     try {
//         const response = await personalApi.put('/${id}/');
//         return response.data;
//     } catch (error) {
//         console.error('Error al eliminar el miembro del personal', error);
//         throw error;
//     }
// }

import axios from 'axios'

const personalApi = axios.create({
    baseURL: 'http://localhost:8000/api/personal',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Esta función está bien
export const getPersonal = async () => {
    try {
        const response = await personalApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los miembros del personal', error);
        throw error;
    }
}

// CORRECCIÓN 1: Usar backticks (`` ` ``) para template literals
export const getMiembro = async (id) => {
    try {
        const response = await personalApi.get(`/${id}/`); // Cambiado de '/${id}/' a `/${id}/`
        return response.data;
    } catch (error) {
        console.error('Error al obtener el miembro del personal', error);
        throw error;
    }
}

// Esta función está bien. Es la que recibirá los campos username y password.
export const createMiembro = async (miembro) => {
    try {
        // 'miembro' debe incluir {..., username: '...', password: '...'}
        const response = await personalApi.post('/', miembro);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el miembro del personal', error);
        throw error;
    }
}

// CORRECCIÓN 2: Usar backticks (`` ` ``) para template literals
export const updateMiembro = async (id, miembro) => {
    try {
        const response = await personalApi.put(`/${id}/`, miembro); // Cambiado de '/${id}/' a `/${id}/`
        return response.data;
    } catch (error) {
        console.error('Error al registrar el miembro del personal', error);
        throw error;
    }
}

// CORRECCIÓN 3: Aquí estabas usando .put() en lugar de .delete()
export const deleteMiembro = async (id) => {
    try {
        // CORRECCIÓN 3.1: Usar .delete() y backticks
        const response = await personalApi.delete(`/${id}/`); // Cambiado de personalApi.put a .delete y de '/${id}/' a `/${id}/`
        // Para DELETE, DRF a menudo devuelve un 204 No Content, por lo que la respuesta.data puede estar vacía.
        return response.data; 
    } catch (error) {
        console.error('Error al eliminar el miembro del personal', error);
        throw error;
    }
}