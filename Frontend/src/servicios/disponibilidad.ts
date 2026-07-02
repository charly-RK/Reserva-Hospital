import api from './api';

const disponibilidadService = {
    obtenerPorDoctor: async (doctorId: number) => {
        const response = await api.get(`/disponibilidad/doctor/${doctorId}`);
        return response.data;
    },
    guardarHorario: async (doctorId: number, datos: { horarios: any[], duracion_cita_minutos: number }) => {
        const response = await api.put(`/disponibilidad/doctor/${doctorId}`, datos);
        return response.data;
    }
};

export default disponibilidadService;
