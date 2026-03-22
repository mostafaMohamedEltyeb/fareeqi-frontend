import api from './axios';
export const getProfile = () => api.get('/api/v1/profile');
export const uploadProfileImage = (file: File) => {
  const form = new FormData(); form.append('file', file);
  return api.post('/api/v1/profile/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteProfileImage = () => api.delete('/api/v1/profile/image');
