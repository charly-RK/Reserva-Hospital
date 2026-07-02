import api from './api';

const historialService = {
    obtenerPorPaciente: async (pacienteId: number) => {
        const response = await api.get(`/historial/paciente/${pacienteId}`);
        return response.data;
    },
    crearEvolucion: async (datos: any) => {
        const response = await api.post('/historial', datos);
        return response.data;
    },
    actualizar: async (id: number, datos: any) => {
        const response = await api.put(`/historial/${id}`, datos);
        return response.data;
    },
    eliminar: async (id: number) => {
        const response = await api.delete(`/historial/${id}`);
        return response.data;
    }
};

export default historialService;
