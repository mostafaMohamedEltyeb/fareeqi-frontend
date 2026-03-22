import api from './axios';
export const initiatePayment = (bookingId: number) => api.post(`/api/v1/payments/initiate/${bookingId}`);
export const confirmPayment = (paymentId: number) => api.post(`/api/v1/payments/confirm/${paymentId}`);
export const cancelPaymentApi = (paymentId: number) => api.post(`/api/v1/payments/cancel/${paymentId}`);
export const getPaymentById = (id: number) => api.get(`/api/v1/payments/${id}`);
export const getMyPayments = () => api.get('/api/v1/payments/my');
