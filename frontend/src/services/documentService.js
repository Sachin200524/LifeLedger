import api from './api';

export const documentService = {
  getDocuments: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },

  getDocumentById: async (id) => {
    const res = await api.get(`/documents/${id}`);
    return res.data;
  },

  uploadDocument: async (formData) => {
    const res = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  bulkUpload: async (formData) => {
    const res = await api.post('/documents/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  uploadVersion: async (id, formData) => {
    const res = await api.post(`/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getVersions: async (id) => {
    const res = await api.get(`/documents/${id}/versions`);
    return res.data;
  },

  updateDocument: async (id, data) => {
    const res = await api.put(`/documents/${id}`, data);
    return res.data;
  },

  toggleFavorite: async (id) => {
    const res = await api.patch(`/documents/${id}/favorite`);
    return res.data;
  },

  softDelete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  restore: async (id) => {
    const res = await api.patch(`/documents/${id}/restore`);
    return res.data;
  },

  permanentDelete: async (id) => {
    const res = await api.delete(`/documents/${id}/permanent`);
    return res.data;
  },

  downloadDocument: async (id, filename) => {
    const res = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `document_${id}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  previewDocumentBlob: async (id) => {
    const res = await api.get(`/documents/${id}/preview`, {
      responseType: 'blob',
    });
    return {
      blobUrl: window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] })),
      mimeType: res.headers['content-type'],
    };
  },

  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },

  getFolders: async () => {
    const res = await api.get('/folders');
    return res.data;
  },

  createFolder: async (data) => {
    const res = await api.post('/folders', data);
    return res.data;
  },

  deleteFolder: async (id) => {
    const res = await api.delete(`/folders/${id}`);
    return res.data;
  },

  getTags: async () => {
    const res = await api.get('/tags');
    return res.data;
  },
};
