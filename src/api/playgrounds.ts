import api from './axios';
export const getPlaygrounds = (params?: object) => api.get('/api/v1/playgrounds', { params });
export const getMyPlaygrounds = () => api.get('/api/v1/playgrounds/my');
export const getPlaygroundById = (id: number) => api.get(`/api/v1/playgrounds/${id}`);
export const createPlayground = (data: object) => api.post('/api/v1/playgrounds', data);
export const updatePlayground = (id: number, data: object) => api.put(`/api/v1/playgrounds/${id}`, data);
export const deletePlayground = (id: number) => api.delete(`/api/v1/playgrounds/${id}`);
export const ratePlayground = (id: number, rating: number) => api.post(`/api/v1/playgrounds/${id}/rate`, { rating });
export const getSlots = (playgroundId: number) => api.get(`/api/v1/playgrounds/${playgroundId}/slots`);
export const createSlot = (playgroundId: number, data: object) => api.post(`/api/v1/playgrounds/${playgroundId}/slots`, data);
export const updateSlot = (playgroundId: number, slotId: number, data: object) => api.put(`/api/v1/playgrounds/${playgroundId}/slots/${slotId}`, data);
export const deleteSlot = (playgroundId: number, slotId: number) => api.delete(`/api/v1/playgrounds/${playgroundId}/slots/${slotId}`);
export const uploadPlaygroundImage = (id: number, file: File) => {
  const form = new FormData(); form.append('file', file);
  return api.post(`/api/v1/playgrounds/${id}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const removePlaygroundImage = (id: number, imageUrl: string) =>
  api.delete(`/api/v1/playgrounds/${id}/images`, { params: { imageUrl } });
