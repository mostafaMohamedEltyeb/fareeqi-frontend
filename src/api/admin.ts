import api from './axios';
export const getAdminDashboard = () => api.get('/api/v1/admin/dashboard');
export const getAllUsers = () => api.get('/api/v1/admin/users');
export const createUser = (data: object) => api.post('/api/v1/admin/users', data);
export const updateUser = (id: number, data: object) => api.put(`/api/v1/admin/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/api/v1/admin/users/${id}`);
