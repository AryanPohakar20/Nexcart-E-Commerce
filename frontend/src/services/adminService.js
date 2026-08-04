import axiosInstance from '../api/axios';

const adminService = {
  // ─── Dashboard ──────────────────────────────────────────────────────────
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },
  getRecentUsers: async (limit = 5) => {
    const response = await axiosInstance.get(`/admin/dashboard/recent-users?limit=${limit}`);
    return response.data;
  },
  getRecentSellers: async (limit = 5) => {
    const response = await axiosInstance.get(`/admin/dashboard/recent-sellers?limit=${limit}`);
    return response.data;
  },
  getRecentActivity: async (limit = 10) => {
    const response = await axiosInstance.get(`/admin/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  },
  getPendingVerifications: async (limit = 10) => {
    const response = await axiosInstance.get(`/admin/dashboard/pending-verifications?limit=${limit}`);
    return response.data;
  },

  // ─── User Management ────────────────────────────────────────────────────
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },
  getUser: async (id) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },
  suspendUser: async (id, reason) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/suspend`, { reason });
    return response.data;
  },
  activateUser: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/activate`);
    return response.data;
  },
  blockUser: async (id, reason) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/block`, { reason });
    return response.data;
  },
  unblockUser: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/unblock`);
    return response.data;
  },

  // ─── Seller Management ──────────────────────────────────────────────────
  getSellers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/sellers', { params });
    return response.data;
  },
  getSeller: async (id) => {
    const response = await axiosInstance.get(`/admin/sellers/${id}`);
    return response.data;
  },
  updateSeller: async (id, data) => {
    const response = await axiosInstance.put(`/admin/sellers/${id}`, data);
    return response.data;
  },
  deleteSeller: async (id) => {
    const response = await axiosInstance.delete(`/admin/sellers/${id}`);
    return response.data;
  },
  suspendSeller: async (id, reason) => {
    const response = await axiosInstance.patch(`/admin/sellers/${id}/suspend`, { reason });
    return response.data;
  },
  activateSeller: async (id) => {
    const response = await axiosInstance.patch(`/admin/sellers/${id}/activate`);
    return response.data;
  },
  blockSeller: async (id, reason) => {
    const response = await axiosInstance.patch(`/admin/sellers/${id}/block`, { reason });
    return response.data;
  },

  // ─── Search ─────────────────────────────────────────────────────────────
  globalSearch: async (q, type = 'all', limit = 10) => {
    const response = await axiosInstance.get('/admin/search', {
      params: { q, type, limit },
    });
    return response.data;
  },

  // ─── Audit Logs ─────────────────────────────────────────────────────────
  getAuditLogs: async (params = {}) => {
    const response = await axiosInstance.get('/admin/audit-logs', { params });
    return response.data;
  },

  // ─── Products ────────────────────────────────────────────────────────────
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get('/admin/products', { params });
    return response.data;
  },
  getProduct: async (id) => {
    const response = await axiosInstance.get(`/admin/products/${id}`);
    return response.data;
  },
  updateProduct: async (id, data) => {
    const response = await axiosInstance.put(`/admin/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/admin/products/${id}`);
    return response.data;
  },
  restoreProduct: async (id) => {
    const response = await axiosInstance.patch(`/admin/products/${id}/restore`);
    return response.data;
  },
  approveProduct: async (id) => {
    const response = await axiosInstance.patch(`/admin/products/${id}/approve`);
    return response.data;
  },
  rejectProduct: async (id, data) => {
    const response = await axiosInstance.patch(`/admin/products/${id}/reject`, data);
    return response.data;
  },
  toggleFeaturedProduct: async (id) => {
    const response = await axiosInstance.patch(`/admin/products/${id}/featured`);
    return response.data;
  },
  bulkProductAction: async (action, ids, extraData = {}) => {
    const response = await axiosInstance.post('/admin/products/bulk', {
      action,
      ids,
      extraData,
    });
    return response.data;
  },

  // ─── Categories ──────────────────────────────────────────────────────────
  getCategories: async (params = {}) => {
    const response = await axiosInstance.get('/admin/categories', { params });
    return response.data;
  },
  getCategoryTree: async () => {
    const response = await axiosInstance.get('/admin/categories/tree');
    return response.data;
  },
  getCategory: async (id) => {
    const response = await axiosInstance.get(`/admin/categories/${id}`);
    return response.data;
  },
  createCategory: async (data) => {
    const response = await axiosInstance.post('/admin/categories', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // ─── Orders ──────────────────────────────────────────────────────────────
  getOrders: async (params = {}) => {
    const response = await axiosInstance.get('/admin/orders', { params });
    return response.data;
  },
  getOrder: async (id) => {
    const response = await axiosInstance.get(`/admin/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, status, note = '') => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/status`, { status, note });
    return response.data;
  },
  cancelOrder: async (id, reason = '') => {
    const response = await axiosInstance.patch(`/admin/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // ─── Verification Center ─────────────────────────────────────────────────
  getVerifications: async (params = {}) => {
    const response = await axiosInstance.get('/admin/verification', { params });
    return response.data;
  },
  getVerificationCounts: async () => {
    const response = await axiosInstance.get('/admin/verification/counts');
    return response.data;
  },
  approveVerification: async (id) => {
    const response = await axiosInstance.patch(`/admin/verification/${id}/approve`);
    return response.data;
  },
  rejectVerification: async (id, remarks = '') => {
    const response = await axiosInstance.patch(`/admin/verification/${id}/reject`, { remarks });
    return response.data;
  },
  requestReuploadVerification: async (id, remarks = '') => {
    const response = await axiosInstance.patch(`/admin/verification/${id}/request-reupload`, { remarks });
    return response.data;
  },

  // ─── CSV & Excel Import ──────────────────────────────────────────────────
  previewImport: async (formData) => {
    const response = await axiosInstance.post('/admin/import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  executeImport: async (type, rows) => {
    const response = await axiosInstance.post('/admin/import/execute', { type, rows });
    return response.data;
  },

  // ─── Universal Bulk Actions ──────────────────────────────────────────────
  executeBulkAction: async (targetEntity, action, ids, payload = {}) => {
    const response = await axiosInstance.post('/admin/bulk', {
      targetEntity,
      action,
      ids,
      payload,
    });
    return response.data;
  },

  // ─── Reports & Disputes ──────────────────────────────────────────────────
  getBusinessReport: async (type = 'marketplace', timeframe = 'monthly', params = {}) => {
    const response = await axiosInstance.get('/admin/reports/business', {
      params: { type, timeframe, ...params },
    });
    return response.data;
  },
  getDisputeReports: async (params = {}) => {
    const response = await axiosInstance.get('/admin/reports/disputes', { params });
    return response.data;
  },
  getDisputeReport: async (id) => {
    const response = await axiosInstance.get(`/admin/reports/disputes/${id}`);
    return response.data;
  },
  resolveDisputeReport: async (id, data) => {
    const response = await axiosInstance.patch(`/admin/reports/disputes/${id}/resolve`, data);
    return response.data;
  },

  // ─── Marketplace Analytics & BI ──────────────────────────────────────────
  getMarketplaceAnalytics: async (range = '12 Months') => {
    const response = await axiosInstance.get('/admin/analytics', { params: { range } });
    return response.data;
  },

  // ─── Notifications & Alerts ──────────────────────────────────────────────
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/admin/notifications', { params });
    return response.data;
  },
  getUnreadNotificationsCount: async () => {
    const response = await axiosInstance.get('/admin/notifications/unread-count');
    return response.data;
  },
  markNotificationRead: async (id) => {
    const response = await axiosInstance.patch(`/admin/notifications/${id}/read`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await axiosInstance.patch('/admin/notifications/read-all');
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/admin/notifications/${id}`);
    return response.data;
  },

  // ─── Platform Settings ───────────────────────────────────────────────────
  getPlatformSettings: async () => {
    const response = await axiosInstance.get('/admin/settings');
    return response.data;
  },
  updatePlatformSettings: async (settingsData) => {
    const response = await axiosInstance.put('/admin/settings', settingsData);
    return response.data;
  },

  // ─── System Monitoring ───────────────────────────────────────────────────
  getSystemHealth: async () => {
    const response = await axiosInstance.get('/admin/system/health');
    return response.data;
  },

  // ─── Data Export Engine ──────────────────────────────────────────────────
  exportData: async (entity, format = 'csv', params = {}) => {
    const response = await axiosInstance.get(`/admin/export/${entity}`, {
      params: { format, ...params },
      responseType: format === 'json' ? 'json' : 'blob',
    });

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexcart_${entity}_export.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      return;
    }

    const mimeTypes = {
      csv: 'text/csv;charset=utf-8;',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const blob = new Blob([response.data], { type: mimeTypes[format] || 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexcart_${entity}_export.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // ─── Roles & Permissions ─────────────────────────────────────────────────
  getRolesAndPermissions: async () => {
    const response = await axiosInstance.get('/admin/roles-permissions');
    return response.data;
  },

  // ─── Admin Profile & Security ────────────────────────────────────────────
  getAdminProfile: async () => {
    const response = await axiosInstance.get('/admin/profile');
    return response.data;
  },
  updateAdminProfile: async (profileData) => {
    const response = await axiosInstance.put('/admin/profile', profileData);
    return response.data;
  },
  updateAdminPassword: async (passwordData) => {
    const response = await axiosInstance.put('/admin/profile/password', passwordData);
    return response.data;
  },
};

export default adminService;
