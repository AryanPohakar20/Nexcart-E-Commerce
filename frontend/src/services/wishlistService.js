import axiosInstance from '../api/axios';

const wishlistService = {
  getWishlist: async () => {
    try {
      const response = await axiosInstance.get('/wishlist');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addToWishlist: async (productId) => {
    try {
      const response = await axiosInstance.post('/wishlist/add', { productId });
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
