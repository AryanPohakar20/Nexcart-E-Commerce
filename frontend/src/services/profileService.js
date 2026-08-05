// src/services/profileService.js
// All profile-related API calls for the Customer Dashboard.

import axiosInstance from '../api/axios';

const profileService = {
  /**
   * Fetch the authenticated user's profile.
   * @returns {Promise<{ success, data: { user } }>}
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update editable profile fields.
   * @param {{ firstName?, lastName?, phone?, dob?, gender?, bio? }} data
   * @returns {Promise<{ success, data: { user } }>}
   */
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put('/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Upload a new avatar image.
   * @param {File} file - The image File object from an <input type="file">
   * @returns {Promise<{ success, data: { avatar } }>}
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axiosInstance.patch('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change the authenticated user's password.
   * @param {{ currentPassword: string, newPassword: string }} data
   * @returns {Promise<{ success, message }>}
   */
  changePassword: async (data) => {
    try {
      const response = await axiosInstance.patch('/profile/password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Fetch account settings.
   * @returns {Promise<{ success, data: { settings } }>}
   */
  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/profile/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update account settings (partial merge).
   * @param {{ notifications?, privacy?, language?, theme? }} data
   * @returns {Promise<{ success, data: { settings } }>}
   */
  updateSettings: async (data) => {
    try {
      const response = await axiosInstance.put('/profile/settings', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default profileService;
