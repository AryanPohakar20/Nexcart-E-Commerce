import axiosInstance from '../api/axios';

const orderService = {
  /**
   * Place a new order (buyer checkout)
   */
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get orders placed by the current logged-in buyer
   */
  getBuyerOrders: async () => {
    try {
      const response = await axiosInstance.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get a single order's details (customer-owned only)
   * Accepts either the Mongo _id or the business order number (ORD-xxxxx)
   */
  getOrderDetails: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default orderService;
