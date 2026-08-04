import axiosInstance from '../api/axios';

const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  getUnreadNotifications: async () => {
    const response = await axiosInstance.get('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  getNotificationById: async (notificationId) => {
    const response = await axiosInstance.get(`/notifications/${notificationId}`);
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (params = {}) => {
    const response = await axiosInstance.patch('/notifications/read-all', null, { params });
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  deleteReadNotifications: async () => {
    const response = await axiosInstance.delete('/notifications/read');
    return response.data;
  },
};

export default notificationService;
