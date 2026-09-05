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

  /**
   * resetPassword — Change password using current password for identity verification.
   * OTP has been removed. Backend verifies identity via currentPassword.
   */
  resetPassword: async (email, currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email,
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  loginGoogle: async (googleAccessToken) => {
    try {
      const response = await axiosInstance.post('/auth/login/google', {
        accessToken: googleAccessToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  loginApple: async (identityToken, userObj) => {
    try {
      const response = await axiosInstance.post('/auth/login/apple', {
        identityToken,
        user: userObj,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authService;
