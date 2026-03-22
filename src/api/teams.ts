import api from './axios';
export const getAllTeams = () => api.get('/api/v1/teams');
export const getTeamById = (id: number) => api.get(`/api/v1/teams/${id}`);
export const createTeam = (data: object) => api.post('/api/v1/teams', data);
export const updateTeam = (id: number, data: object) => api.put(`/api/v1/teams/${id}`, data);
export const deleteTeam = (id: number) => api.delete(`/api/v1/teams/${id}`);
export const uploadTeamImage = (id: number, file: File) => {
  const form = new FormData(); form.append('file', file);
  return api.post(`/api/v1/teams/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteTeamImage = (id: number) => api.delete(`/api/v1/teams/${id}/image`);
