import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success && res.data.data.token) {
      localStorage.setItem('lifeledger_token', res.data.data.token);
      localStorage.setItem('lifeledger_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.data.token) {
      localStorage.setItem('lifeledger_token', res.data.data.token);
      localStorage.setItem('lifeledger_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('lifeledger_token');
    localStorage.removeItem('lifeledger_user');
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.post('/auth/change-password', data);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },
};
