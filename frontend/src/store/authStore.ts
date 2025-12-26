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
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  async login(username, password) {
    const res = await api.post("/api/accounts/token/", { username, password });
    const { access, refresh } = res.data;
    api.defaults.headers.common.Authorization = `Bearer ${access}`;
    set({ accessToken: access, refreshToken: refresh });
    await get().fetchMe();
  },

  async register(username, email, password, role = "student") {
    await api.post("/api/accounts/register/", { username, email, password, role });
    await get().login(username, password);
  },

  async fetchMe() {
    const res = await api.get("/api/accounts/me/");
    set({ user: res.data });
  },

  logout() {
    set({ accessToken: null, refreshToken: null, user: null });
    delete api.defaults.headers.common.Authorization;
  }
}));


