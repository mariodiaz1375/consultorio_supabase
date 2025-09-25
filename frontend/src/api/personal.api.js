import axios from 'axios'

const personalApi = axios.create({
    baseURL: 'http://localhost:8000/api/personal',
    headers: {
        'Content-Type': 'application/json'
    }
})

export const getPersonal = async () => {
    try {
        const response = await personalApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los miembros del personal', error);
        throw error;
    }
}

export const getMiembro = async (id) => {
    try {
        const response = await personalApi.get('/${id}/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el miembro del personal', error);
        throw error;
    }
}

export const createMiembro = async (miembro) => {
    try {
        const response = await personalApi.post('/', miembro);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el miembro del personal', error);
        throw error;
    }
}

export const updateMiembro = async (id, miembro) => {
    try {
        const response = await personalApi.put('/${id}/', miembro);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el miembro del personal', error);
        throw error;
    }
}

export const deleteMiembro = async (id) => {
    try {
        const response = await personalApi.put('/${id}/');
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el miembro del personal', error);
        throw error;
    }
}
