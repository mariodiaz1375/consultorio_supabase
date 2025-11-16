import axios from 'axios';

// 1. INSTANCIA DE AXIOS
const turnosApi = axios.create({
    baseURL: 'http://localhost:8000/api/turnos',
    headers: {
        'Content-Type': 'application/json'
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

export const createTurno = async (turnoData) => {
    try {
        const response = await turnosApi.post('/', turnoData);
        return response.data;
    } catch (error) {
        console.error('Error al registrar el turno:', error.response?.data || error);
        throw error;
    }
}

export const updateTurno = async (id, turnoData) => {
    try {
        const response = await turnosApi.patch(`/${id}/`, turnoData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el turno ${id}:`, error.response?.data || error);
        throw error;
    }
}

export const deleteTurno = async (id) => {
    try {
        await turnosApi.delete(`/${id}/`);
        return true;
    } catch (error) {
        console.error(`Error al eliminar el turno ${id}:`, error);
        throw error;
    }
}


// ===============================================
// B. LISTADOS DE OPCIONES (LOOKUP DATA)
// ===============================================

export const getHorariosFijos = async () => {
    try {
        const response = await turnosApi.get('/horarios/'); 
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Horarios Fijos:', error);
        throw error;
    }
}

export const createHorarioFijo = async (horarioData) => {
    try {
        const response = await turnosApi.post('/horarios/', horarioData);
        return response.data;
    } catch (error) {
        console.error('Error al crear Horario Fijo:', error);
        throw error;
    }
}

export const updateHorarioFijo = async (id, horarioData) => {
    try {
        const response = await turnosApi.put(`/horarios/${id}/`, horarioData);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar Horario Fijo ID ${id}:`, error);
        throw error;
    }
}

export const deleteHorarioFijo = async (id) => {
    try {
        const response = await turnosApi.delete(`/horarios/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar Horario Fijo ID ${id}:`, error);
        throw error;
    }
}

export const getEstadosTurno = async () => {
    try {
        const response = await turnosApi.get('/estados/'); 
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Estados de Turno:', error);
        throw error;
    }
}

export const getDiasSemana = async () => {
    try {
        const response = await turnosApi.get('/dias/'); 
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de Días de Semana:', error);
        throw error;
    }
}

// ===============================================
// C. AUDITORÍA DE TURNOS
// ===============================================

/**
 * Obtiene la lista de auditorías de turnos.
 * Puede filtrar por: turno_numero, paciente_dni, accion, fecha_desde, fecha_hasta, fecha_turno
 * Endpoint: GET /api/turnos/auditoria/
 */
export const getAuditoriasTurnos = async (filtros = {}) => {
    try {
        const response = await turnosApi.get('/auditoria/', {
            params: filtros
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener auditorías de turnos:', error);
        throw error;
    }
}

/**
 * Obtiene el detalle de una auditoría específica.
 * Endpoint: GET /api/turnos/auditoria/{id}/
 */
export const getAuditoriaTurnoDetail = async (id) => {
    try {
        const response = await turnosApi.get(`/auditoria/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener auditoría de turno ${id}:`, error);
        throw error;
    }
}