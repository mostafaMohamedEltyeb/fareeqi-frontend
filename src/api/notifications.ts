import api from './axios';
export const getMyNotifications = () => api.get('/api/v1/notifications');
export const markNotificationRead = (id: number) => api.put(`/api/v1/notifications/${id}/read`);
