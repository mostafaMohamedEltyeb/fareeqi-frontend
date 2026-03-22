import api from './axios';
export const login = (data: { username: string; password: string }) => api.post('/api/v1/auth/login', data);
export const register = (data: { username: string; email: string; password: string; userType: string }) => api.post('/api/v1/auth/register', data);
