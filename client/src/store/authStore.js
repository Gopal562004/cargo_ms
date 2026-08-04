import { create } from 'zustand';
import * as authService from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  login: async (email, password) => {
    const { data } = await authService.login(email, password);
    get().setAuth(data.user, data.accessToken);
    return data;
  },

  register: async (userData) => {
    const { data } = await authService.register(userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    authService.logout().catch(() => {});
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await authService.getMe();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      // Try refresh
      try {
        const { data } = await authService.refreshToken();
        get().setAuth(data.user, data.accessToken);
      } catch {
        get().logout();
      }
    }
  },
}));
