import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // ✅ اینجا /api اضافه شد
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ❗ این interceptor را اضافه کن (اگر توکن استفاده می‌کنی):
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ❗ برای دیباگ، این را اضافه کن:
api.interceptors.response.use(
  (response) => {
    // console.log("✅ Response:", response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);
// api.ts - در انتهای فایل
// 🔧 حل‌کننده خودکار URLهای اشتباه
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 🔥 این بخش جدید: اصلاح خودکار URLهای اشتباه
  if (config.url && config.url.startsWith('/api/')) {
    // حذف /api/ اضافی
    const correctedUrl = config.url.substring(4); // حذف 4 کاراکتر اول (/api/)
    console.warn(`⚠️ اصلاح خودکار URL: ${config.url} → ${correctedUrl}`);
    config.url = correctedUrl;
  }
  
  console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

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