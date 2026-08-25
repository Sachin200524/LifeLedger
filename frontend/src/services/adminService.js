import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getAllUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  toggleUserStatus: async (userId, active) => {
    const res = await api.patch(`/admin/users/${userId}/status?active=${active}`);
    return res.data;
  },

  getAllEmergencyRequests: async () => {
    const res = await api.get('/admin/emergency-requests');
    return res.data;
  },

  getAllAuditLogs: async (page = 0, size = 30) => {
    const res = await api.get(`/admin/audit-logs?page=${page}&size=${size}`);
    return res.data;
  },
};
