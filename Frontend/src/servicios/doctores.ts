import api from './api';

const doctoresService = {
    obtenerTodos: async () => {
        const response = await api.get('/doctores');
        return response.data;
    },
    obtenerPorEspecialidad: async (especialidadId: number) => {
        const response = await api.get(`/doctores?especialidad_id=${especialidadId}`);
        return response.data;
    },
    crear: async (datos: any) => {
        const response = await api.post('/doctores', datos);
        return response.data;
    },
    actualizar: async (id: number, datos: any) => {
        const response = await api.put(`/doctores/${id}`, datos);
        return response.data;
    }
};

export default doctoresService;
