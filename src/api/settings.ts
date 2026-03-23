import api from './axios';

export const getSettings = () => api.get('/api/v1/settings');
export const updateSettings = (data: object) => api.put('/api/v1/settings', data);
