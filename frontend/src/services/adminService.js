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
};

export default adminService;
