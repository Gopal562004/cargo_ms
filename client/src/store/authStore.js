import { create } from 'zustand';
import * as authService from '../services/authService';

let initialCachedUser = null;
try {
  const rawUser = localStorage.getItem('cached_user');
  if (rawUser) initialCachedUser = JSON.parse(rawUser);
} catch {}

const hasExistingToken = Boolean(localStorage.getItem('accessToken'));

export const useAuthStore = create((set, get) => ({
  user: initialCachedUser,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: Boolean(hasExistingToken && initialCachedUser),
  isLoading: true,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (user) {
      try {
        localStorage.setItem('cached_user', JSON.stringify(user));
      } catch {}
    }
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
    localStorage.removeItem('cached_user');
    authService.logout().catch(() => {});
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  syncWithCloud: async () => {
    try {
      const res = await authService.syncSubscription();
      const updatedUser = res?.data?.data?.user || res?.data?.user;
      if (updatedUser) {
        localStorage.setItem('cached_user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
      return res?.data || res;
    } catch (err) {
      console.warn('Subscription sync failed:', err.message);
      throw err;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      // 3-second safety timeout so offline/lag never freezes app
      const authPromise = authService.getMe();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth request timed out')), 3000)
      );

      const { data } = await Promise.race([authPromise, timeoutPromise]);
      if (data?.user) {
        localStorage.setItem('cached_user', JSON.stringify(data.user));
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (err) {
      console.log('[Auth] CheckAuth network/server error or timeout:', err.message);

      // If we have a cached user and a token, allow offline access!
      const cached = localStorage.getItem('cached_user');
      if (cached) {
        try {
          const userObj = JSON.parse(cached);
          set({ user: userObj, isAuthenticated: true, isLoading: false });
          return;
        } catch {}
      }

      // If no cached user, attempt token refresh
      try {
        const { data } = await authService.refreshToken();
        if (data?.user) {
          get().setAuth(data.user, data.accessToken);
          return;
        }
      } catch {
        get().logout();
      }
    } finally {
      // Always guarantee loading state finishes
      set({ isLoading: false });
    }
  },
}));
