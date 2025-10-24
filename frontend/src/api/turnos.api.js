import axios from 'axios';

// 1. INSTANCIA DE AXIOS
// Creamos una instancia con la URL base de tu app 'turnos'
const turnosApi = axios.create({
    baseURL: 'http://localhost:8000/api/turnos', // Asumiendo tu URL de Django
    headers: {
        'Content-Type': 'application/json'
        // NOTA: Si usas autenticación, el interceptor de Axios debe manejar el 'Authorization' Bearer Token
    }
});

// ===============================================
// A. CRUD PRINCIPAL (TURNOS)
// ===============================================

export const getTurnos = async () => {
    try {
        const response = await turnosApi.get('/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de turnos:', error);
        throw error;
    }
}

export const getTurno = async (id) => {
    try {
        const response = await turnosApi.get(`/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener el turno ${id}:`, error);
        throw error;
    }
}

/**
 * Crea un nuevo turno. Los datos esperados son:
 * { paciente_id, horario_turno_id, fecha_turno, motivo }
 */
export const createTurno = async (turnoData) => {
    try {
        // Enviar POST a /api/turnos/
        const response = await turnosApi.post('/', turnoData);
        return response.data; // Devuelve el turno creado
    } catch (error) {
        console.error('Error al registrar el turno:', error.response?.data || error);
        throw error;
    }
}

/**
 * Actualiza un turno existente.
 */
export const updateTurno = async (id, turnoData) => {
    try {
        // Usamos PATCH a /api/turnos/ID/ para actualizar solo los campos enviados
        const response = await turnosApi.patch(`/${id}/`, turnoData);
        return response.data; // Devuelve el turno actualizado
    } catch (error) {
        console.error(`Error al actualizar el turno ${id}:`, error.response?.data || error);
        throw error;
    }
}

export const deleteTurno = async (id) => {
    try {
        // Enviar DELETE a /api/turnos/ID/
        await turnosApi.delete(`/${id}/`);
        return true;
    } catch (error) {
        console.error(`Error al eliminar el turno ${id}:`, error);
        throw error;
    }
}


// ===============================================
// B. LISTADOS DE OPCIONES (LOOKUP DATA)
// Estos listados son necesarios para los <select> del TurnosForm
// NOTA: Asumo que creaste las vistas necesarias en Django
// ===============================================

export const getHorariosFijos = async () => {
    try {
        // Asumiendo un endpoint: /api/turnos/horarios-fijos/
        const response = await turnosApi.get('/horarios-fijos/'); 
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Horarios Fijos:', error);
        throw error;
    }
}

export const getEstadosTurno = async () => {
    try {
        // Asumiendo un endpoint: /api/turnos/estados-turno/
        const response = await turnosApi.get('/estados-turno/'); 
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Estados de Turno:', error);
        throw error;
    }
}

// ----------------------------------------------------------------------------------
// Opcional: Si el componente TurnosForm.jsx y su padre necesitan la lista de pacientes, 
// puedes re-exportar o crear una función aquí. 
// La lista de pacientes debe cargarse desde el API de pacientes (pacientes.api.js)
// ----------------------------------------------------------------------------------