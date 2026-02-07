import axios from 'axios';

// Base URL بک‌اند Django
const BASE_URL = 'http://localhost:8000/api';

// ساخت instance از axios
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: اضافه کردن توکن به هدر
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: مدیریت خطاها و رفرش توکن
apiClient.interceptors.response.use(
  (response) => response.data, // فقط data را برمی‌گردانیم
  async (error) => {
    const originalRequest = error.config;

    // اگر خطای 401 بود و هنوز رفرش نکردیم
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // اگر رفرش توکن نداشتیم، به لاگین می‌بریم
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // درخواست رفرش توکن
        const response = await axios.post(`${BASE_URL}/accounts/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // تلاش مجدد با توکن جدید
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // اگر رفرش توکن هم ناموفق بود
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // برای خطاهای دیگر
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
