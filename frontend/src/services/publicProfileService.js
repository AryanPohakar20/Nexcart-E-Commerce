import axiosInstance from '../api/axios';

const publicProfileService = {
  /**
   * Fetch public seller/user profile by identifier (slug, sellerId, userId, _id).
   */
  getPublicProfile: async (identifier) => {
    try {
      const response = await axiosInstance.get(`/seller/public/${identifier}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Toggle follow status for target seller/user.
   */
  toggleFollow: async (identifier) => {
    try {
      const response = await axiosInstance.post(`/seller/public/${identifier}/follow`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Submit a review for a seller.
   */
  postReview: async (identifier, reviewData) => {
    try {
      const response = await axiosInstance.post(`/seller/public/${identifier}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default publicProfileService;
