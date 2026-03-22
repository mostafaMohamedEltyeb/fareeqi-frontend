import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.messageAr || error.response?.data?.message || 'حدث خطأ غير متوقع';
    return Promise.reject({ ...error, displayMessage: msg });
  }
);

export default api;
