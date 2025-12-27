import { create } from "zustand";
import { api } from "../utils/api";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  cognitive_level: number;
  has_taken_placement_test: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  refreshAccessToken: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  async initializeAuth() {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        await get().fetchMe();
        console.log("✅ احراز هویت اولیه موفق");
      } catch (error) {
        console.warn("⚠️ توکن منقضی شده، در حال تلاش برای رفرش...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ accessToken: null, refreshToken: null, user: null });
      }
    }
  },

  async login(username, password) {
    try {
      set({ isLoading: true, error: null });
      
      console.log("🔑 درخواست لاگین به:", "/accounts/token/");
      
      const res = await api.post("/accounts/token/", { username, password });
      const { access, refresh } = res.data;
      
      // ذخیره توکن‌ها
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      api.defaults.headers.common.Authorization = `Bearer ${access}`;
      
      set({ 
        accessToken: access, 
        refreshToken: refresh,
        isLoading: false 
      });
      
      await get().fetchMe();
      
      console.log("✅ لاگین موفق برای کاربر:", username);
      
    } catch (error: any) {
      console.error("❌ خطای لاگین:", error.response?.data || error.message);
      
      let errorMessage = "خطا در ورود به سیستم";
      if (error.response?.status === 401) {
        errorMessage = "نام کاربری یا رمز عبور اشتباه است";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.detail || "اطلاعات ورود نامعتبر است";
      }
      
      set({ 
        error: errorMessage,
        isLoading: false,
        accessToken: null,
        refreshToken: null,
        user: null 
      });
      
      // پاک کردن توکن‌های قدیمی
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete api.defaults.headers.common.Authorization;
      
      throw new Error(errorMessage);
    }
  },

  async register(username, email, password, role = "student") {
    try {
      set({ isLoading: true, error: null });
      
      console.log("📝 درخواست ثبت‌نام به:", "/accounts/register/");
      
      const registerData: any = { username, password, role };
      if (email) registerData.email = email;
      
      await api.post("/accounts/register/", registerData);
      
      console.log("✅ ثبت‌نام موفق، در حال لاگین...");
      
      // لاگین خودکار بعد از ثبت‌نام
      await get().login(username, password);
      
      set({ isLoading: false });
      
    } catch (error: any) {
      console.error("❌ خطای ثبت‌نام:", error.response?.data || error.message);
      
      let errorMessage = "خطا در ثبت‌نام";
      if (error.response?.status === 400) {
        const data = error.response.data;
        if (data.username) errorMessage = `نام کاربری: ${data.username[0]}`;
        else if (data.email) errorMessage = `ایمیل: ${data.email[0]}`;
        else if (data.password) errorMessage = `رمز عبور: ${data.password[0]}`;
        else if (data.detail) errorMessage = data.detail;
      }
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      
      throw new Error(errorMessage);
    }
  },

  async fetchMe() {
    try {
      console.log("👤 درخواست اطلاعات کاربر به:", "/accounts/me/");
      
      const res = await api.get("/accounts/me/");
      const userData = res.data;
      
      console.log("✅ اطلاعات کاربر دریافت شد:", userData.username);
      
      set({ user: userData });
      
      // ذخیره در localStorage برای persistence
      localStorage.setItem("user", JSON.stringify(userData));
      
    } catch (error: any) {
      console.error("❌ خطا در دریافت اطلاعات کاربر:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.log("توکن منقضی شده، در حال تلاش برای رفرش...");
        const refreshed = await get().refreshAccessToken();
        if (refreshed) {
          return get().fetchMe();
        }
      }
      
      set({ user: null });
      throw error;
    }
  },

  async refreshAccessToken() {
    try {
      const refreshToken = get().refreshToken || localStorage.getItem("refreshToken");
      
      if (!refreshToken) {
        console.warn("⚠️ توکن رفرش وجود ندارد");
        return false;
      }
      
      console.log("🔄 درخواست رفرش توکن...");
      
      const res = await api.post("/accounts/token/refresh/", { refresh: refreshToken });
      const { access } = res.data;
      
      localStorage.setItem("accessToken", access);
      api.defaults.headers.common.Authorization = `Bearer ${access}`;
      
      set({ accessToken: access });
      
      console.log("✅ توکن با موفقیت رفرش شد");
      return true;
      
    } catch (error) {
      console.error("❌ خطا در رفرش توکن:", error);
      
      // پاک کردن اطلاعات احراز هویت
      get().logout();
      return false;
    }
  },

  logout() {
    console.log("🚪 در حال خروج از سیستم...");
    
    // پاک کردن localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    // پاک کردن headers
    delete api.defaults.headers.common.Authorization;
    
    // ریست کردن state
    set({ 
      accessToken: null, 
      refreshToken: null, 
      user: null,
      error: null,
      isLoading: false 
    });
    
    console.log("✅ خروج موفق");
  }
}));