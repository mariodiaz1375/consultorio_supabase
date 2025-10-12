import axios from 'axios'

const pacientesApi = axios.create({
    baseURL: 'http://localhost:8000/api/pacientes',
    headers: {
        'Content-Type': 'application/json'
    }
})

const getToken = () => localStorage.getItem('access_token'); 

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
// URL para Generos
// export const getGeneros = async () => {
//     // Aquí se llama a la función getToken() definida arriba
//     const token = getToken(); 
//     const response = await fetch('http://localhost:8000/api/generos/', {
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     if (!response.ok) throw new Error('Error al cargar géneros');
//     return response.json();
// };

export const getGeneros = async () => {
    try {
        // Se concatena a la baseURL: http://localhost:8000/api/personal + puestos/
        const response = await pacientesApi.get('generos/'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de generos:", error);
        throw error;
    }
};

// URL para Antecedentes
// export const getAntecedentes = async () => {
//     // Aquí se llama a la función getToken()
//     const token = getToken(); 
//     const response = await fetch('http://localhost:8000/api/antecedentes/', {
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     if (!response.ok) throw new Error('Error al cargar antecedentes');
//     return response.json();
// };

export const getAntecedentes = async () => {
    try {
        // Se concatena a la baseURL: http://localhost:8000/api/personal + puestos/
        const response = await pacientesApi.get('antecedentes/'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de antecedentes:", error);
        throw error;
    }
};

// URL para Análisis Funcional
// export const getAnalisisFuncional = async () => {
//     // Aquí se llama a la función getToken()
//     const token = getToken();
//     const response = await fetch('http://localhost:8000/api/analisis-funcional/', {
//         headers: { 'Authorization': `Bearer ${token}` }
//     });
//     if (!response.ok) throw new Error('Error al cargar análisis funcional');
//     return response.json();
// };

export const getAnalisisFuncional = async () => {
    try {
        // Se concatena a la baseURL: http://localhost:8000/api/personal + puestos/
        const response = await pacientesApi.get('analisis-funcional/'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de antecedentes:", error);
        throw error;
    }
};