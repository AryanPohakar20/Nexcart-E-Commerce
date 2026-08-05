// src/services/addressService.js
// All address-related API calls for the Customer Dashboard.

import axiosInstance from '../api/axios';

const addressService = {
  /**
   * Fetch all addresses for the authenticated user.
   * @returns {Promise<{ success, data: { addresses, count } }>}
   */
  getAddresses: async () => {
    try {
      const response = await axiosInstance.get('/address');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new address.
   * @param {{ fullName, phone, addressLine1, addressLine2?, city, state, country?, postalCode, landmark?, type?, isDefault? }} data
   * @returns {Promise<{ success, data: { address } }>}
   */
  createAddress: async (data) => {
    try {
      const response = await axiosInstance.post('/address', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing address by ID.
   * @param {string} id - Address MongoDB ObjectId
   * @param {Object} data - Fields to update
   * @returns {Promise<{ success, data: { address } }>}
   */
  updateAddress: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/address/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete an address by ID.
   * @param {string} id - Address MongoDB ObjectId
   * @returns {Promise<{ success, message }>}
   */
  deleteAddress: async (id) => {
    try {
      const response = await axiosInstance.delete(`/address/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Set an address as the default delivery address.
   * @param {string} id - Address MongoDB ObjectId
   * @returns {Promise<{ success, data: { address } }>}
   */
  setDefaultAddress: async (id) => {
    try {
      const response = await axiosInstance.patch(`/address/default/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default addressService;
