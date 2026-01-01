import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // ✅ اینجا /api اضافه شد
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ❗ اصلاح درخواست‌ها برای توکن JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // یا localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // تغییر به Bearer
  }

  // 🔥 اصلاح خودکار URLهای اشتباه
  if (config.url && config.url.startsWith('/api/')) {
    const correctedUrl = config.url.substring(4); // حذف 4 کاراکتر اول (/api/)
    console.warn(`⚠️ اصلاح خودکار URL: ${config.url} → ${correctedUrl}`);
    config.url = correctedUrl;
  }

  console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

// ❗ لاگ کردن پاسخ‌ها و خطاها
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'NO RESPONSE'} ${error.config?.url}`);
    console.error('پیام:', error.response?.data?.detail || error.message);
    return Promise.reject(error);
  }
);
