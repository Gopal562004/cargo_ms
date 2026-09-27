import axios from 'axios';

export function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.__ELECTRON_API_URL__) {
    return window.__ELECTRON_API_URL__;
  }
  let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  rawUrl = rawUrl.replace(/\/+$/, '');
  return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;
}

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ──────────────────

api.interceptors.request.use((config) => {
  const currentBase = getApiBaseUrl();
  if (currentBase && (!config.baseURL || config.baseURL.includes('localhost:5000'))) {
    config.baseURL = currentBase;
  }
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 + token refresh ─

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register') || originalRequest?.url?.includes('/auth/refresh');

    // If 401 and not already retrying, try refresh (except for login/register endpoints)
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshBase = getApiBaseUrl();
        const res = await axios.post(
          `${refreshBase}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        if (window.electronAPI || window.location.hash) {
          window.location.hash = '#/login';
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract error message
    let message = error.response?.data?.message || error.message || 'An error occurred';
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json?.message) message = json.message;
      } catch (_e) {
        // Not a JSON blob
      }
    }
    return Promise.reject(new Error(message));
  }
);

export { API_BASE_URL };
export default api;
