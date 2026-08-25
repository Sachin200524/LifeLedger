import api from './api';

export const policyService = {
  getPolicies: async () => {
    const res = await api.get('/policies');
    return res.data;
  },

  getPolicyById: async (id) => {
    const res = await api.get(`/policies/${id}`);
    return res.data;
  },

  createPolicy: async (data) => {
    const res = await api.post('/policies', data);
    return res.data;
  },

  updatePolicy: async (id, data) => {
    const res = await api.put(`/policies/${id}`, data);
    return res.data;
  },

  deletePolicy: async (id) => {
    const res = await api.delete(`/policies/${id}`);
    return res.data;
  },

  toggleActive: async (id) => {
    const res = await api.patch(`/policies/${id}/toggle-active`);
    return res.data;
  },

  getAvailableForNominee: async () => {
    const res = await api.get('/policies/nominee/available');
    return res.data;
  },
};
