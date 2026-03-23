import api from './axios';

export const getVouchers = () => api.get('/api/v1/vouchers');
export const createVoucher = (data: object) => api.post('/api/v1/vouchers', data);
export const deleteVoucher = (id: number) => api.delete(`/api/v1/vouchers/${id}`);
export const toggleVoucher = (id: number) => api.patch(`/api/v1/vouchers/${id}/toggle`);
export const validateVoucher = (code: string, baseAmount: number) =>
  api.get('/api/v1/vouchers/validate', { params: { code, baseAmount } });
