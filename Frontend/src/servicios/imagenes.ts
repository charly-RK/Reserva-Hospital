import api from './api';

const imagenesService = {
    obtenerPorPaciente: async (pacienteId: number) => {
        const response = await api.get(`/imagenes/paciente/${pacienteId}`);
        return response.data;
    },
    subirImagen: async (datos: any) => {
        const response = await api.post('/imagenes', datos);
        return response.data;
    },
    actualizar: async (id: number, datos: any) => {
        const response = await api.put(`/imagenes/${id}`, datos);
        return response.data;
    },
    eliminar: async (id: number) => {
        const response = await api.delete(`/imagenes/${id}`);
        return response.data;
    }
};

export default imagenesService;
