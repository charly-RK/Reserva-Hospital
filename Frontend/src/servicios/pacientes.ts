import api from './api';

const pacientesService = {
    obtenerTodos: async (filtros?: { estado?: string; busqueda?: string }) => {
        const response = await api.get('/pacientes', { params: filtros });
        return response.data;
    },
    obtenerPorId: async (id: number) => {
        try {
            const response = await api.get(`/pacientes/id/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },
    buscarPorCedula: async (cedula: string) => {
        try {
            const response = await api.get(`/pacientes/cedula/${cedula}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },
    registrar: async (datos: any) => {
        const response = await api.post('/pacientes', datos);
        return response.data;
    },
    actualizar: async (id: number, datos: any) => {
        const response = await api.put(`/pacientes/${id}`, datos);
        return response.data;
    },
    eliminar: async (id: number) => {
        const response = await api.delete(`/pacientes/${id}`);
        return response.data;
    }
};

export default pacientesService;
