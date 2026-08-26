import api from './api';

export function login(identifierOrEmail, password, licenseKey) {
  let payload = {};
  if (typeof identifierOrEmail === 'object' && identifierOrEmail !== null) {
    payload = identifierOrEmail;
  } else if (licenseKey) {
    payload = { licenseKey: licenseKey.trim().toUpperCase() };
  } else if (identifierOrEmail && identifierOrEmail.trim().toUpperCase().startsWith('CRGO-')) {
    payload = { licenseKey: identifierOrEmail.trim().toUpperCase() };
  } else {
    payload = { email: identifierOrEmail, identifier: identifierOrEmail, password };
  }
  return api.post('/auth/login', payload);
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
