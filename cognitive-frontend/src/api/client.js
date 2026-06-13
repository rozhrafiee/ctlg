import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // برای آپلود فایل (FormData) نباید Content-Type ست شود تا مرورگر boundary را بگذارد
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) {
        return Promise.reject(error);
      }

      try {
        const refreshRes = await axios.post(`${baseURL}/accounts/token/refresh/`, { refresh });
        localStorage.setItem('access_token', refreshRes.data.access);
        originalRequest.headers.Authorization = `Bearer ${refreshRes.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
