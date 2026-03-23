import api from './axios';

export const getAdminFinance = (params: { period?: string; from?: string; to?: string }) =>
  api.get('/api/v1/finance/admin', { params });

export const getOwnerFinance = (params: { period?: string; from?: string; to?: string }) =>
  api.get('/api/v1/finance/owner', { params });

export const getPlayerFinance = () => api.get('/api/v1/finance/player');

export const exportAdminCsv = (params: { from?: string; to?: string }) =>
  api.get('/api/v1/finance/admin/export', { params, responseType: 'blob' });

export const exportOwnerCsv = (params: { from?: string; to?: string }) =>
  api.get('/api/v1/finance/owner/export', { params, responseType: 'blob' });
