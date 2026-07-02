import api from './api';

const especialidadesService = {
    obtenerTodas: async () => {
        const response = await api.get('/especialidades');
        return response.data;
    },
};

export default especialidadesService;
