import api from './axios';
export const getAllMatches = () => api.get('/api/v1/matches');
export const createMatch = (data: object) => api.post('/api/v1/matches', data);
export const updateMatch = (id: number, data: object) => api.put(`/api/v1/matches/${id}`, data);
export const deleteMatch = (id: number) => api.delete(`/api/v1/matches/${id}`);
