import axiosInstance from '../api/axios';

const cartService = {
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addToCart: async (productId, quantity, priceAtAddition, selectedColor = '', selectedSize = '', selectedVariant = '') => {
    try {
      const response = await axiosInstance.post('/cart/add', {
        productId,
        quantity,
        priceAtAddition,
        selectedColor,
        selectedSize,
        selectedVariant
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      const response = await axiosInstance.patch(`/cart/update/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeCartItem: async (productId) => {
    try {
      const response = await axiosInstance.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  clearCart: async () => {
    try {
      const response = await axiosInstance.delete('/cart/clear');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  saveForLater: async (productId) => {
    try {
      const response = await axiosInstance.post('/cart/save-for-later', { productId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  moveToCart: async (productId) => {
    try {
      const response = await axiosInstance.post('/cart/move-to-cart', { productId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  applyCoupon: async (code) => {
    try {
      const response = await axiosInstance.post('/cart/apply-coupon', { code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeCoupon: async () => {
    try {
      const response = await axiosInstance.post('/cart/remove-coupon');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  mergeCart: async (guestCartItems) => {
    try {
      const response = await axiosInstance.post('/cart/merge', { guestCartItems });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default cartService;
