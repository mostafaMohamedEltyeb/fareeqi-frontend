import api from './axios';
export const getMyFeatures = () => api.get('/api/v1/player-features/me');
export const getPlayerFeatures = (playerId: number) => api.get(`/api/v1/player-features/player/${playerId}`);
export const addFeature = (data: object) => api.post('/api/v1/player-features', data);
export const updateFeature = (id: number, data: object) => api.put(`/api/v1/player-features/${id}`, data);
export const deleteFeature = (id: number) => api.delete(`/api/v1/player-features/${id}`);
