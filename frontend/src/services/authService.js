import axiosInstance from '../api/axios';

const authService = {
  register: async (firstName, lastName, email, password, phone, username) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
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
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  verifyOtp: async (email, otp, purpose) => {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { email, otp, purpose });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;
