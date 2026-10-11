import { create } from 'zustand';
import * as authService from '../services/authService';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

let initialCachedUser = null;
let initialToken = null;
try {
  const rawUser = localStorage.getItem('cached_user');
  const token = localStorage.getItem('accessToken');
  const loginTs = Number(localStorage.getItem('login_timestamp') || '0');
  const isExpired = loginTs > 0 && (Date.now() - loginTs > THIRTY_DAYS_MS);

  if (isExpired) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('cached_user');
    localStorage.removeItem('login_timestamp');
  } else if (rawUser && token) {
    initialCachedUser = JSON.parse(rawUser);
    initialToken = token;
  }
} catch {}

export const useAuthStore = create((set, get) => ({
  user: initialCachedUser,
  accessToken: initialToken,
  isAuthenticated: Boolean(initialToken && initialCachedUser),
  isLoading: true,

  setAuth: (user, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('login_timestamp', String(Date.now()));
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
    localStorage.removeItem('login_timestamp');
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
    const cached = localStorage.getItem('cached_user');
    const loginTs = Number(localStorage.getItem('login_timestamp') || '0');
    const isExpired = loginTs > 0 && (Date.now() - loginTs > THIRTY_DAYS_MS);

    if (!token || isExpired) {
      get().logout();
      return;
    }

    // Immediately restore cached credentials for seamless 0ms offline startup
    if (cached) {
      try {
        const userObj = JSON.parse(cached);
        set({ user: userObj, isAuthenticated: true, isLoading: false });
      } catch {}
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
        localStorage.setItem('login_timestamp', String(Date.now())); // Sliding 30 days on active use
        set({ user: data.user, isAuthenticated: true, isLoading: false });
        return;
      }
    } catch (err) {
      console.log('[Auth] CheckAuth network/server error or timeout:', err.message);

      // If offline or network unavailable, KEEP existing offline session active!
      if (cached) {
        try {
          const userObj = JSON.parse(cached);
          set({ user: userObj, isAuthenticated: true, isLoading: false });
          return;
        } catch {}
      }

      // Only if this was an active 401 unauthorized rejection, attempt refresh
      if (err.response?.status === 401) {
        try {
          const { data } = await authService.refreshToken();
          if (data?.user) {
            get().setAuth(data.user, data.accessToken);
            return;
          }
        } catch {
          get().logout();
        }
      }
    } finally {
      // Always guarantee loading state finishes
      set({ isLoading: false });
    }
  },
}));
