import axios from 'axios'

const pacientesApi = axios.create({
    baseURL: 'http://localhost:8000/api/pacientes',
    headers: {
        'Content-Type': 'application/json'
    }
})

export const getPacientes = async () => {
    try {
        const response = await pacientesApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los pacientes', error);
        throw error;
    }
}

export const getPaciente = async (id) => {
    try {
        const response = await pacientesApi.get('/${id}/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener el paciente', error);
        throw error;
    }
}

export const createPaciente = async (paciente) => {
    try {
        const response = await pacientesApi.post('/', paciente);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el paciente', error);
        throw error;
    }
}

export const updatePaciente = async (id, paciente) => {
    try {
        const response = await pacientesApi.put('/${id}/', paciente);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el paciente', error);
        throw error;
    }
}

export const deletePaciente = async (id) => {
    try {
        const response = await pacientesApi.put('/${id}/');
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el paciente', error);
        throw error;
    }
}
