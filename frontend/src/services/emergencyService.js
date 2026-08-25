import api from './api';

export const emergencyService = {
  submitRequest: async (formData) => {
    const res = await api.post('/emergency-requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getRequestsForOwner: async () => {
    const res = await api.get('/emergency-requests/owner');
    return res.data;
  },

  getRequestsForNominee: async () => {
    const res = await api.get('/emergency-requests/nominee');
    return res.data;
  },

  reviewRequest: async (id, data) => {
    const res = await api.put(`/emergency-requests/${id}/review`, data);
    return res.data;
  },

  cancelRequest: async (id) => {
    const res = await api.post(`/emergency-requests/${id}/cancel`);
    return res.data;
  },

  getAccessibleDocuments: async (id) => {
    const res = await api.get(`/emergency-requests/${id}/accessible-documents`);
    return res.data;
  },
};
