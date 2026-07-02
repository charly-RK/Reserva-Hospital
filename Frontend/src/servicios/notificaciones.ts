import api from './api';

const notificacionesService = {
    obtenerTodas: async () => {
        const response = await api.get('/notificaciones');
        return response.data;
    },
    obtenerMisAlertas: async (params?: any) => {
        const response = await api.get('/notificaciones/mis-alertas', { params });
        return response.data;
    },
    crear: async (datos: any) => {
        const response = await api.post('/notificaciones', datos);
        return response.data;
    },
    marcarLeida: async (id: number) => {
        const response = await api.put(`/notificaciones/${id}/leido`);
        return response.data;
    },
    marcarTodasLeidas: async () => {
        const response = await api.put('/notificaciones/marcar-todas');
        return response.data;
    },
    archivar: async (id: number, archivado = true) => {
        const response = await api.put(`/notificaciones/${id}/archivar`, { archivado });
        return response.data;
    },
    importante: async (id: number, importante = true) => {
        const response = await api.put(`/notificaciones/${id}/importante`, { importante });
        return response.data;
    }
};

export default notificacionesService;
