import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('opus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on 401 if token expired
      if (localStorage.getItem('opus_token')) {
        localStorage.removeItem('opus_token');
        localStorage.removeItem('opus_user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Error en la solicitud';
    return Promise.reject(new Error(message));
  }
);

export default api;
