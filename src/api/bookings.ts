import api from './axios';
import type { BookingFilters } from '../types';

const buildParams = (filters: Omit<BookingFilters, 'playerName'> & { playerName?: string }, page: number, size: number) => {
  const params: Record<string, string | number> = { page, size };
  if (filters.playerName) params.playerName = filters.playerName;
  if (filters.playgroundName) params.playgroundName = filters.playgroundName;
  if (filters.status) params.status = filters.status;
  if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  return params;
};

export const createBooking = (data: { slotId: number; playgroundId: number; teamId?: number }) => api.post('/api/v1/bookings', data);
export const getMyBookings = (filters: BookingFilters = {}, page = 0, size = 10) =>
  api.get('/api/v1/bookings', { params: buildParams(filters, page, size) });
export const getOwnerBookings = (filters: BookingFilters = {}, page = 0, size = 10) =>
  api.get('/api/v1/bookings/owner', { params: buildParams(filters, page, size) });
export const getAllBookings = (filters: BookingFilters = {}, page = 0, size = 10) =>
  api.get('/api/v1/bookings/admin/all', { params: buildParams(filters, page, size) });
export const getBookingById = (id: number) => api.get(`/api/v1/bookings/${id}`);
export const updateBooking = (id: number, data: object) => api.put(`/api/v1/bookings/${id}`, data);
export const approveBooking = (id: number) => api.put(`/api/v1/bookings/${id}/approve`);
export const rejectBooking = (id: number) => api.put(`/api/v1/bookings/${id}/reject`);
export const cancelBooking = (id: number) => api.delete(`/api/v1/bookings/${id}/cancel`);
export const updatePaymentStatus = (id: number, data: { paymentStatus: string }) => api.put(`/api/v1/bookings/${id}/payment`, data);
export const getPlayerDashboard = () => api.get('/api/v1/bookings/dashboard');
export const getOwnerDashboard = () => api.get('/api/v1/bookings/dashboard/owner');
export const verifyQrCode = (qrCode: string) => api.post(`/api/v1/bookings/verify/${qrCode}`);
