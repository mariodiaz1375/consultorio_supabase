import axios from 'axios';

// 1. INSTANCIA DE AXIOS
// Creamos una instancia con la URL base de tu ViewSet de Historias Clínicas
const historiasApi = axios.create({
    baseURL: 'http://localhost:8000/api/historias_clinicas', // Base URL: /api/historias_clinicas/
    headers: {
        'Content-Type': 'application/json'
        // NOTA: La autenticación (Bearer Token) debe ser manejada por un interceptor 
        // global de Axios, como se sugiere en tus otros archivos.
    }
});

// ===============================================
// A. CRUD PRINCIPAL (HISTORIAS CLÍNICAS)
// ===============================================

/**
 * Obtiene la lista completa de todas las historias clínicas.
 * @returns {Promise<Array>} Lista de historias con detalles y seguimientos anidados.
 */
export const getHistoriasClinicas = async () => {
    try {
        // GET a /api/historias_clinicas/
        const response = await historiasApi.get('/historias/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de historias clínicas:', error.response?.data || error);
        throw error;
    }
};

/**
 * Obtiene una única historia clínica por su ID.
 * @param {number} id - ID de la Historia Clínica.
 */
export const getHistoriaClinicaById = async (id) => {
    try {
        // GET a /api/historias_clinicas/ID/
        const response = await historiasApi.get(`/historias/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener la historia clínica ${id}:`, error.response?.data || error);
        throw error;
    }
};

export const getHistoriasClinicasPaginadas = async (page = 1, pageSize = 10) => {
    try {
        const response = await historiasApi.get(`/?page=${page}&page_size=${pageSize}`);
        return response.data; // Devuelve { count, next, previous, results }
    } catch (error) {
        console.error('Error al obtener las historias clínicas', error);
        throw error;
    }
};

/**
 * Crea una nueva historia clínica, incluyendo la capacidad de crear
 * los DetallesHC anidados en el array 'detalles'.
 * * @param {object} historiaData - Datos de la HC. Debe incluir:
 * { 
 * paciente: <ID>, 
 * odontologo: <ID>, 
 * descripcion: '...',
 * detalles: [ {tratamiento: <ID>, pieza_dental: <ID>, cara_dental: <ID>}, ... ]
 * }
 */
export const createHistoriaClinica = async (historiaData) => {
    try {
        // POST a /api/historias_clinicas/
        const response = await historiasApi.post('/historias/', historiaData);
        return response.data; // Retorna la nueva historia creada
    } catch (error) {
        console.error('Error al crear la historia clínica:', error.response?.data || error);
        throw error;
    }
};

/**
 * Actualiza parcialmente una historia clínica (ej: marcar como finalizada).
 * @param {number} id - ID de la Historia Clínica a actualizar.
 * @param {object} updatedFields - Campos a modificar (ej: { finalizado: true }).
 */
export const updateHistoriaClinica = async (id, updatedFields) => {
    try {
        // PATCH a /api/historias_clinicas/ID/
        const response = await historiasApi.patch(`/historias/${id}/`, updatedFields);
        return response.data; // Devuelve la historia actualizada
    } catch (error) {
        console.error(`Error al actualizar la historia clínica ${id}:`, error.response?.data || error);
        throw error;
    }
};

/**
 * Elimina una historia clínica por su ID.
 * (Si tienes CASCADE configurado en Django, eliminará detalles y seguimientos).
 */
export const deleteHistoriaClinica = async (id) => {
    try {
        // DELETE a /api/historias_clinicas/ID/
        await historiasApi.delete(`/${id}/`);
        return true; // Éxito en la eliminación (código 204 No Content)
    } catch (error) {
        console.error(`Error al eliminar la historia clínica ${id}:`, error.response?.data || error);
        throw error;
    }
};

// ===============================================
// B. GESTIÓN DE SEGUIMIENTO (POST/DELETE)
// ===============================================

// NOTA: Como SeguimientoHC no debe ser editable a través del serializer anidado 
// (es read_only=True), generalmente se maneja a través de un endpoint dedicado.
// Asumo que crearás un action custom en tu ViewSet o un ViewSet secundario 
// para manejar el seguimiento. Usaremos el patrón de anidamiento de URL 
// (ej: /historias/1/seguimientos/)

/**
 * Crea un nuevo registro de Seguimiento para una historia clínica específica.
 * @param {number} historiaId - ID de la Historia Clínica a la que pertenece el seguimiento.
 * @param {object} seguimientoData - Datos del seguimiento (ej: { descripcion: '...' }).
 */
export const createSeguimiento = async (historiaId, seguimientoData) => {
    try {
        // POST a /api/historias_clinicas/ID/seguimientos/
        // Esto requiere un ViewSet de Seguimiento anidado o un @action custom
        const response = await historiasApi.post(`/historias/${historiaId}/seguimientos/`, seguimientoData); 
        return response.data;
    } catch (error) {
        console.error(`Error al crear seguimiento para HC ${historiaId}:`, error.response?.data || error);
        throw error;
    }
};

/**
 * ✅ Actualiza un seguimiento existente.
 * Al editar, actualiza el odontólogo al que está editando.
 * @param {number} historiaId - ID de la Historia Clínica
 * @param {number} seguimientoId - ID del Seguimiento a editar
 * @param {object} seguimientoData - Debe incluir:
 * {
 *   descripcion: '...',
 *   odontologo: <ID> // El nuevo odontólogo que está editando
 * }
 */
export const updateSeguimiento = async (historiaId, seguimientoId, seguimientoData) => {
    try {
        const response = await historiasApi.patch(
            `/historias/${historiaId}/seguimientos/${seguimientoId}/`, 
            seguimientoData
        );
        console.log(`✅ Seguimiento ${seguimientoId} actualizado:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar seguimiento ${seguimientoId}:`, error.response?.data || error);
        throw error;
    }
};

// ... (Puedes añadir funciones para editar o eliminar seguimientos,

/**
 * Obtiene la lista de todos los tratamientos dentales.
 */
export const getTratamientos = async () => {
    try {
        // GET a /api/historias_clinicas/tratamientos/
        const response = await historiasApi.get('/tratamientos/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de tratamientos:', error.response?.data || error);
        throw error;
    }
};
export const createTratamiento = async (data) => {
    try {
        // data debe ser { nombre_ant: 'Nuevo Nombre' }
        const response = await historiasApi.post('/tratamientos/', data);
        return response.data;
    } catch (error) {
        console.error("Error al crear Tratamiento:", error);
        throw error;
    }
};

export const updateTratamientos = async (id, data) => {
    try {
        const response = await historiasApi.patch(`/tratamientos/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error("Error al editar Tratamiento:", error);
        throw error;
    }
};

export const deleteTratamientos = async (id) => {
    try {
        await historiasApi.delete(`/tratamientos/${id}/`);
        return true;
    } catch (error) {
        console.error("Error al eliminar Tratamiento:", error);
        throw error;
    }
};


/**
 * Obtiene la lista de todas las piezas dentales.
 */
export const getPiezasDentales = async () => {
    try {
        // GET a /api/historias_clinicas/piezas/
        const response = await historiasApi.get('/piezas/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de piezas dentales:', error.response?.data || error);
        throw error;
    }
};

/**
 * Obtiene la lista de todas las caras dentales.
 */
export const getCarasDentales = async () => {
    try {
        // GET a /api/historias_clinicas/caras/
        const response = await historiasApi.get('/caras/');
        return response.data;
    } catch (error) {
        console.error('Error al obtener la lista de caras dentales:', error.response?.data || error);
        throw error;
    }
};