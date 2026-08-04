import { create } from 'zustand';
import * as docService from '../services/documentService';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  currentDocument: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  filters: {},
  isLoading: false,
  error: null,

  fetchDocuments: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = { ...get().filters, ...params };
      const { data } = await docService.getAllDocuments(query);
      set({
        documents: data.documents,
        pagination: data.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await docService.getDocumentById(id);
      set({ currentDocument: data.document, isLoading: false });
      return data.document;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createDocument: async (documentData) => {
    const { data } = await docService.createDocument(documentData);
    return data.document;
  },

  updateDocument: async (id, documentData) => {
    const { data } = await docService.updateDocument(id, documentData);
    set({ currentDocument: data.document });
    return data.document;
  },

  deleteDocument: async (id) => {
    await docService.deleteDocument(id);
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
  },

  duplicateDocument: async (id) => {
    const { data } = await docService.duplicateDocument(id);
    return data.document;
  },

  updateStatus: async (id, status, note) => {
    const { data } = await docService.updateStatus(id, { status, note });
    set({ currentDocument: data.document });
    return data.document;
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchDocuments({ page: 1 });
  },

  clearCurrent: () => set({ currentDocument: null }),
}));
