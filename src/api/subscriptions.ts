import api from './axios';

export const getMySubscriptions = () => api.get('/api/v1/subscriptions/my');
export const getAllSubscriptions = () => api.get('/api/v1/subscriptions');
export const subscribePlayground = (playgroundId: number, months: number) =>
  api.post('/api/v1/subscriptions', { playgroundId, months });
export const cancelSubscription = (playgroundId: number) =>
  api.delete(`/api/v1/subscriptions/${playgroundId}`);
export const getPlaygroundSubscription = (playgroundId: number) =>
  api.get(`/api/v1/subscriptions/playground/${playgroundId}`);
