import axiosInstance from '../api/axios';

const sellerAuthService = {
  register: async (firstName, lastName, email, password, phone, username) => {
    try {
      const response = await axiosInstance.post('/seller/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone,
        username,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/seller/auth/login', {
        email,
        password,
      });
      if (response.data?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/seller/auth/logout');
    } catch (error) {
      console.error('Seller logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nexcart-user');
    }
  },

  createSellerEntry: async () => {
    try {
      const response = await axiosInstance.post('/seller/create');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  saveStep1: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-1', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/seller/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-2', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  uploadIdentity: async (dataOrFormData) => {
    try {
      let formData = dataOrFormData;
      if (!(dataOrFormData instanceof FormData)) {
        formData = new FormData();
        formData.append('idType', dataOrFormData.idType || '');
        if (dataOrFormData.aadhaarNumber) formData.append('aadhaarNumber', dataOrFormData.aadhaarNumber);
        if (dataOrFormData.pan) formData.append('pan', dataOrFormData.pan);
        if (dataOrFormData.gst) formData.append('gst', dataOrFormData.gst);
        if (dataOrFormData.frontImage) formData.append('frontImage', dataOrFormData.frontImage);
        if (dataOrFormData.backImage) formData.append('backImage', dataOrFormData.backImage);
      }

      const response = await axiosInstance.put('/seller/onboarding/step-3', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  submitPayment: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-4', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  agreeTerms: async () => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-5');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVerificationStatus: async () => {
    try {
      const response = await axiosInstance.get('/seller/verification-status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDashboardProfile: async () => {
    try {
      const response = await axiosInstance.get('/seller/dashboard/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateDashboardProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/dashboard/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await axiosInstance.patch('/seller/dashboard/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateBanner: async (file) => {
    try {
      const formData = new FormData();
      formData.append('banner', file);
      const response = await axiosInstance.patch('/seller/dashboard/profile/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getDashboardSummary: async (timeframe = '7D') => {
    try {
      const response = await axiosInstance.get(`/seller/dashboard/summary?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/seller/dashboard/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateSettings: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/dashboard/settings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.patch('/seller/dashboard/settings/password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deactivateStore: async () => {
    try {
      const response = await axiosInstance.patch('/seller/dashboard/settings/deactivate');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteStore: async () => {
    try {
      const response = await axiosInstance.delete('/seller/dashboard/settings/delete');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPublicProfile: async (slug) => {
    try {
      const response = await axiosInstance.get(`/seller/public/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getOrders: async () => {
    try {
      const response = await axiosInstance.get('/seller/dashboard/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateOrderStatus: async (id, status, trackingInfo = {}) => {
    try {
      const response = await axiosInstance.patch(`/seller/dashboard/orders/${id}/status`, {
        status,
        ...trackingInfo,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  cancelOrder: async (id, reason) => {
    try {
      const response = await axiosInstance.patch(`/seller/dashboard/orders/${id}/cancel`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default sellerAuthService;
