import api from './api';

export interface Usuario {
    id: number;
    nombre: string;
    email: string;
    rol: 'ADMIN' | 'DOCTOR' | 'PACIENTE' | 'RECEPCIONISTA';
    doctor_id?: number | null;
    fecha_creacion?: string;
    doctor_nombre?: string;
    doctor_apellido?: string;
}

const obtenerTodos = async () => {
    const response = await api.get('/usuarios');
    return response.data;
};

const obtenerPorId = async (id: number) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
};

const crear = async (datos: Partial<Usuario> & { password?: string }) => {
    const response = await api.post('/usuarios', datos);
    return response.data;
};

const actualizar = async (id: number, datos: Partial<Usuario>) => {
    const response = await api.put(`/usuarios/${id}`, datos);
    return response.data;
};

const eliminar = async (id: number) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
};

const usuariosService = {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
};

export default usuariosService;
