import api from './api';

export const scoreService = {
  getReadinessScore: async () => {
    const res = await api.get('/readiness');
    return res.data;
  },

  getRiskScore: async () => {
    const res = await api.get('/risk');
    return res.data;
  },

  getAuditLogs: async (page = 0, size = 20) => {
    const res = await api.get(`/activity-logs?page=${page}&size=${size}`);
    return res.data;
  },

  getRecentLogs: async () => {
    const res = await api.get('/activity-logs/recent');
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  getUnreadNotificationCount: async () => {
    const res = await api.get('/notifications/unread-count');
    return res.data;
  },

  markNotificationRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  clearAllNotifications: async () => {
    const res = await api.delete('/notifications/clear-all');
    return res.data;
  },
};
