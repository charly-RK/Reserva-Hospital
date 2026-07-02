import api from './api';

const citasService = {
    agendar: async (datos: any) => {
        const response = await api.post('/citas', datos);
        return response.data;
    },
    obtenerTodas: async () => {
        const response = await api.get('/citas');
        return response.data;
    },
    obtenerPorPaciente: async (pacienteId: number) => {
        const response = await api.get(`/citas/paciente/${pacienteId}`);
        return response.data;
    },
    obtenerPorDoctor: async (doctorId: number) => {
        const response = await api.get(`/citas/doctor/${doctorId}`);
        return response.data;
    },
    obtenerPorDoctorYFecha: async (doctorId: number, fecha: string) => {
        const response = await api.get(`/citas/doctor/${doctorId}/fecha/${fecha}`);
        return response.data;
    },
    actualizarEstado: async (id: number, estado: string) => {
        const response = await api.put(`/citas/${id}/estado`, { estado });
        return response.data;
    },
    cancelar: async (id: number, motivo: string) => {
        const response = await api.put(`/citas/${id}/cancelar`, { motivo });
        return response.data;
    },
    solicitarCancelacion: async (id: number) => {
        const response = await api.post(`/citas/${id}/solicitar-cancelacion`);
        return response.data;
    },
    confirmarCancelacionOTP: async (id: number, codigo: string, motivo?: string) => {
        const response = await api.post(`/citas/${id}/confirmar-cancelacion`, { codigo, motivo });
        return response.data;
    },
    reagendar: async (id: number, fecha: string, hora: string) => {
        const response = await api.put(`/citas/${id}/reagendar`, { fecha_cita: fecha, hora_cita: hora });
        return response.data;
    },
    actualizar: async (id: number, datos: any) => {
        const response = await api.put(`/citas/${id}`, datos);
        return response.data;
    },
};

export default citasService;
