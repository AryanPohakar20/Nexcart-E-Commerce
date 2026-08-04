import axiosInstance from '../api/axios';

const sellerAuthService = {
  // ─── Auth ──────────────────────────────────────────────────────────────────

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

  // ─── Onboarding ────────────────────────────────────────────────────────────

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

  /** @deprecated Use getDashboardProfile instead */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/seller/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /** @deprecated Use updateDashboardProfile instead */
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-2', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  uploadIdentity: async (data) => {
    try {
      const formData = new FormData();
      formData.append('idType', data.idType);
      if (data.frontImage) formData.append('frontImage', data.frontImage);
      if (data.backImage) formData.append('backImage', data.backImage);

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

  // ─── Dashboard Profile ─────────────────────────────────────────────────────

  /** Get full dashboard seller profile (replaces dummy data). */
  getDashboardProfile: async () => {
    try {
      const response = await axiosInstance.get('/seller/dashboard/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /** Update seller profile fields (type-aware: individual vs business). */
  updateDashboardProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/dashboard/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Upload/replace profile photo (individual) or business logo (business).
   * @param {File} file - Image file from input[type=file]
   */
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

  /**
   * Upload/replace business banner image (business sellers only).
   * @param {File} file - Banner image file
   */
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

  /** Get dashboard summary stats (trust score, completion, etc.) */
  getDashboardSummary: async () => {
    try {
      const response = await axiosInstance.get('/seller/dashboard/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ─── Settings ──────────────────────────────────────────────────────────────

  /** Fetch seller settings (notifications, privacy, shipping, returns). */
  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/seller/dashboard/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update seller settings (partial update — only provided sections change).
   * @param {Object} data - { notifications?, privacy?, shipping?, returns? }
   */
  updateSettings: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/dashboard/settings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change seller account password.
   * @param {string} currentPassword
   * @param {string} newPassword
   */
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

  /** Soft-deactivate the store (keeps data, marks as inactive). */
  deactivateStore: async () => {
    try {
      const response = await axiosInstance.patch('/seller/dashboard/settings/deactivate');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /** Permanently delete the seller store and all associated data. */
  deleteStore: async () => {
    try {
      const response = await axiosInstance.delete('/seller/dashboard/settings/delete');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ─── Public Discovery ──────────────────────────────────────────────────────

  /**
   * Get public seller profile by slug (no auth required).
   * @param {string} slug - e.g. 'aryan-pohakar'
   */
  getPublicProfile: async (slug) => {
    try {
      const response = await axiosInstance.get(`/seller/public/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default sellerAuthService;
