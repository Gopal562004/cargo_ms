import api from './api';

/**
 * Storage Service — Client API for Local Document Archive
 */

export async function getLocalDocuments(params = {}) {
  const query = new URLSearchParams();
  if (params.year) query.append('year', params.year);
  if (params.category) query.append('category', params.category);
  if (params.documentType) query.append('documentType', params.documentType);
  if (params.search) query.append('search', params.search);

  const res = await api.get(`/storage/documents?${query.toString()}`);
  return res.data || res;
}

export async function getStorageStats() {
  const res = await api.get('/storage/stats');
  return res.data || res;
}

export async function getStorageConfig() {
  const res = await api.get('/storage/config');
  return res.data || res;
}

export async function updateStorageConfig(storagePath) {
  const res = await api.put('/storage/config', { storagePath });
  return res.data || res;
}

export async function syncStorageArchive() {
  const res = await api.post('/storage/sync');
  return res.data || res;
}

export async function deleteLocalDocument({ documentNumber, pdfPath, id }) {
  const res = await api.delete('/storage/documents', {
    data: { documentNumber, pdfPath, id },
  });
  return res.data || res;
}


