import api from './api';

/**
 * License Service — Client API for Enterprise Licensing & Device Activation
 */

export async function getLicenseStatus() {
  const res = await api.get('/license/status');
  return res.data || res;
}

export async function activateLicense(licenseKey, machineName) {
  const res = await api.post('/license/activate', { licenseKey, machineName });
  return res.data || res;
}

export async function deactivateLicense() {
  const res = await api.post('/license/deactivate');
  return res.data || res;
}
