import api from './api';

export const nomineeService = {
  getNominees: async () => {
    const res = await api.get('/nominees');
    return res.data;
  },

  getNomineeById: async (id) => {
    const res = await api.get(`/nominees/${id}`);
    return res.data;
  },

  addNominee: async (data) => {
    const res = await api.post('/nominees', data);
    return res.data;
  },

  updateNominee: async (id, data) => {
    const res = await api.put(`/nominees/${id}`, data);
    return res.data;
  },

  deleteNominee: async (id) => {
    const res = await api.delete(`/nominees/${id}`);
    return res.data;
  },

  resendInvite: async (id) => {
    const res = await api.post(`/nominees/${id}/resend-invite`);
    return res.data;
  },

  acceptInvite: async (token) => {
    const res = await api.post(`/nominees/invite/accept?token=${token}`);
    return res.data;
  },

  getMyDesignations: async () => {
    const res = await api.get('/nominees/me/designations');
    return res.data;
  },
};
