import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

const login = async (credentials: any) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
    }
    return response.data;
};

const register = async (userData: any) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
};

const cambiarClave = async (datos: { email: string; nuevaPassword: string }) => {
    const response = await axios.post(`${API_URL}/cambiar-clave`, datos);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const authService = {
    login,
    register,
    cambiarClave,
    logout,
    getCurrentUser
};

export default authService;
