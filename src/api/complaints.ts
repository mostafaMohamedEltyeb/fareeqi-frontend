import api from './axios';
import type { ComplaintStatus } from '../types';

export const createComplaint = (data: {
  subject: string;
  description: string;
  targetUserId?: number;
  targetPlaygroundId?: number;
}) => api.post('/api/v1/complaints', data);

export const getMyComplaints = () => api.get('/api/v1/complaints/my');

export const getAllComplaints = () => api.get('/api/v1/complaints/admin/all');

export const getComplaintById = (id: number) => api.get(`/api/v1/complaints/admin/${id}`);

export const updateComplaint = (id: number, data: { status: ComplaintStatus; adminComment?: string }) =>
  api.put(`/api/v1/complaints/admin/${id}`, data);
