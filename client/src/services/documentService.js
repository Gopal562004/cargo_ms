import api from './api';

export function getAllDocuments(params = {}) {
  return api.get('/documents', { params });
}

export function getDocumentById(id) {
  return api.get(`/documents/${id}`);
}

export function createDocument(data) {
  return api.post('/documents', data);
}

export function updateDocument(id, data) {
  return api.put(`/documents/${id}`, data);
}

export function deleteDocument(id) {
  return api.delete(`/documents/${id}`);
}

export function duplicateDocument(id) {
  return api.post(`/documents/${id}/duplicate`);
}

export function updateStatus(id, data) {
  return api.patch(`/documents/${id}/status`, data);
}

export function getDocumentHistory(id) {
  return api.get(`/documents/${id}/history`);
}

export function getDocumentBarcode(id) {
  return api.get(`/documents/${id}/barcode`);
}

export function getDocumentTypes() {
  return api.get('/documents/types');
}

export async function downloadDocumentPDF(id, filename = 'document.pdf') {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`http://localhost:5000/api/documents/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to generate PDF');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

