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