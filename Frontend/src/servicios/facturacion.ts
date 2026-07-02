import api from './api';

const facturacionService = {
    obtenerTodas: async () => {
        const response = await api.get('/facturacion');
        return response.data;
    },
    obtenerPorPaciente: async (pacienteId: number) => {
        const response = await api.get(`/facturacion/paciente/${pacienteId}`);
        return response.data;
    },
    crear: async (datos: any) => {
        const response = await api.post('/facturacion', datos);
        return response.data;
    },
    actualizarEstado: async (id: number, estado: string) => {
        const response = await api.put(`/facturacion/${id}/estado`, { estado });
        return response.data;
    }
};

export default facturacionService;
