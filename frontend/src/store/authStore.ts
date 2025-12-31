import { create } from "zustand";
import { api } from "../utils/api";

/* ================= TYPES ================= */

export interface User {
  id: number;
  username: string;
  email: string;
  role: "student" | "teacher" | "admin";
  cognitive_level: number;
  has_taken_placement_test: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;

  loading: boolean;        // ✅ USED BY ROUTE GUARDS
  error: string | null;

  /* actions */
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role?: "student" | "teacher"
  ) => Promise<void>;
  logout: () => void;

  fetchMe: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

/* ================= STORE ================= */

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: null,

  loading: true,          // 🔑 start as true
  error: null,

  /* ================= HELPERS ================= */

  clearError: () => set({ error: null }),

  /* ================= INIT ================= */

  async initializeAuth() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      set({ loading: false });
      return;
    }

    try {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      await get().fetchMe();
      set({ loading: false });
      console.log("✅ auth initialized");
    } catch {
      get().logout();
      set({ loading: false });
    }
  },

  /* ================= LOGIN ================= */

  async login(username, password) {
    set({ loading: true, error: null });

    try {
      const res = await api.post("/api/accounts/token/", {
        username,
        password,
      });

      const { access, refresh } = res.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      api.defaults.headers.common.Authorization = `Bearer ${access}`;

      set({ accessToken: access, refreshToken: refresh });

      await get().fetchMe();

      set({ loading: false });
    } catch (err: any) {
      const message =
        err.response?.status === 401
          ? "نام کاربری یا رمز عبور اشتباه است"
          : "خطا در ورود";

      get().logout();
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  /* ================= REGISTER ================= */

  async register(username, email, password, role = "student") {
    set({ loading: true, error: null });

    try {
      const payload: any = { username, password, role };
      if (email) payload.email = email;

      await api.post("/api/accounts/register/", payload);

      // auto login
      await get().login(username, password);
    } catch (err: any) {
      const data = err.response?.data;

      let message = "خطا در ثبت‌نام";
      if (data?.username) message = data.username[0];
      else if (data?.email) message = data.email[0];
      else if (data?.password) message = data.password[0];

      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  /* ================= ME ================= */

  async fetchMe() {
    try {
      const res = await api.get("/api/accounts/me/");
      set({ user: res.data });
    } catch (err: any) {
      if (err.response?.status === 401) {
        const refreshed = await get().refreshAccessToken();
        if (refreshed) return get().fetchMe();
      }
      throw err;
    }
  },

  /* ================= REFRESH ================= */

  async refreshAccessToken() {
    try {
      const refresh = get().refreshToken || localStorage.getItem("refreshToken");
      if (!refresh) return false;

      const res = await api.post("/api/accounts/token/refresh/", {
        refresh,
      });

      const { access } = res.data;

      localStorage.setItem("accessToken", access);
      api.defaults.headers.common.Authorization = `Bearer ${access}`;

      set({ accessToken: access });
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  /* ================= LOGOUT ================= */

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    delete api.defaults.headers.common.Authorization;

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      error: null,
      loading: false,
    });
  },
}));
