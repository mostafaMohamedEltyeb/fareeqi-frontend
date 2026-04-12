import api from './axios';
import type { AnnouncementTarget, BadgeColor } from '../types';

export const getActiveAnnouncements = () => api.get('/api/v1/announcements');

export const getAllAnnouncements = () => api.get('/api/v1/announcements/admin/all');

export const createAnnouncement = (data: {
  title: string;
  message: string;
  voucherCode?: string;
  badgeColor: BadgeColor;
  targetAudience: AnnouncementTarget;
  startDate?: string;
  endDate?: string;
}) => api.post('/api/v1/announcements', data);

export const updateAnnouncement = (
  id: number,
  data: Partial<{
    title: string;
    message: string;
    voucherCode: string;
    badgeColor: BadgeColor;
    targetAudience: AnnouncementTarget;
    startDate: string;
    endDate: string;
    active: boolean;
  }>
) => api.put(`/api/v1/announcements/${id}`, data);

export const deleteAnnouncement = (id: number) => api.delete(`/api/v1/announcements/${id}`);
