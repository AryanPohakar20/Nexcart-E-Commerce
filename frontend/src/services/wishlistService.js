import axiosInstance from '../api/axios';

const wishlistService = {
  getWishlist: async (userId) => {
    try {
      const url = userId ? `/wishlist/${userId}` : '/wishlist';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addToWishlist: async (payload) => {
    try {
      const response = await axiosInstance.post('/wishlist/add', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  moveToCart: async (productId) => {
    try {
      const response = await axiosInstance.post('/wishlist/move-to-cart', { productId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  clearWishlist: async () => {
    try {
      const response = await axiosInstance.post('/wishlist/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default wishlistService;
