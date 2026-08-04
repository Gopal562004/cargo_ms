import api from './api';

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function register(userData) {
  return api.post('/auth/register', userData);
}

export function logout() {
  return api.post('/auth/logout');
}

export function getMe() {
  return api.get('/auth/me');
}

export function refreshToken() {
  return api.post('/auth/refresh');
}
