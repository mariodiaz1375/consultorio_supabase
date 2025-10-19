import axios from 'axios'

const pacientesApi = axios.create({
    baseURL: 'http://localhost:8000/api/pacientes',
    headers: {
        'Content-Type': 'application/json'
    }
})

// const getToken = () => localStorage.getItem('access_token'); 

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
        const response = await pacientesApi.get(`/${id}/`);
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
        // con patch en lugar de put se puede hacer un cambio sin tener que recibir todos los campos
        const response = await pacientesApi.patch(`/${id}/`, paciente);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el paciente', error);
        throw error;
    }
}

export const deletePaciente = async (id) => {
    try {
        const response = await pacientesApi.put(`/${id}/`);
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


// METODOS PARA ANTECEDENTES

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

export const createAntecedente = async (data) => {
    try {
        // data debe ser { nombre_ant: 'Nuevo Nombre' }
        const response = await pacientesApi.post('/antecedentes/', data);
        return response.data;
    } catch (error) {
        console.error("Error al crear Antecedente:", error);
        throw error;
    }
};

export const updateAntecedente = async (id, data) => {
    try {
        const response = await pacientesApi.patch(`/antecedentes/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar Antecedente:", error);
        throw error;
    }
};

export const deleteAntecedente = async (id) => {
    try {
        await pacientesApi.delete(`/antecedentes/${id}/`);
        return true;
    } catch (error) {
        console.error("Error al eliminar Antecedente:", error);
        throw error;
    }
};


// METODOS PARA ANALISIS FUNCIONAL

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

export const createAnalisisFuncional = async (data) => {
    try {
        // data debe ser { nombre_analisis: 'Nuevo Nombre' }
        const response = await pacientesApi.post('/analisis-funcional/', data);
        return response.data;
    } catch (error) {
        console.error("Error al crear Análisis Funcional:", error);
        throw error;
    }
};

export const updateAnalisisFuncional = async (id, data) => {
    try {
        const response = await pacientesApi.patch(`/analisis-funcional/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar Análisis Funcional:", error);
        throw error;
    }
};

export const deleteAnalisisFuncional = async (id) => {
    try {
        await pacientesApi.delete(`/analisis-funcional/${id}/`);
        return true;
    } catch (error) {
        console.error("Error al eliminar Análisis Funcional:", error);
        throw error;
    }
};


// METODOS PARA OBRAS SOCIALES

export const getObrasSociales = async () => {
    try {
        // Se concatena a la baseURL: http://localhost:8000/api/personal + puestos/
        const response = await pacientesApi.get('obras-sociales/'); 
        return response.data;
    } catch (error) {
        console.error("Error al obtener la lista de obras sociales:", error);
        throw error;
    }
};

export const createObraSocial = async (data) => {
    try {
        // data debe ser { nombre_os: 'Nuevo Nombre' }
        const response = await pacientesApi.post('/obras-sociales/', data);
        return response.data; // Devuelve el nuevo objeto con su ID
    } catch (error) {
        console.error("Error al crear Obra Social:", error);
        throw error;
    }
};

export const updateObraSocial = async (id, data) => {
    try {
        // data debe ser { nombre_os: 'Nombre Editado' }
        const response = await pacientesApi.patch(`/obras-sociales/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar Obra Social:", error);
        throw error;
    }
};

export const deleteObraSocial = async (id) => {
    try {
        await pacientesApi.delete(`/obras-sociales/${id}/`);
        return true; // Éxito en la eliminación
    } catch (error) {
        console.error("Error al eliminar Obra Social:", error);
        throw error;
    }
};