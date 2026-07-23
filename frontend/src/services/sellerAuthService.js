import axiosInstance from '../api/axios';

const sellerAuthService = {
  register: async (firstName, lastName, email, password, phone, username) => {
    try {
      const response = await axiosInstance.post('/seller/register', {
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
      const response = await axiosInstance.post('/seller/login', {
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

  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/seller/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.patch('/seller/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  uploadIdentity: async (data) => {
    try {
      const response = await axiosInstance.post('/seller/upload-document', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  submitPayment: async (data) => {
    try {
      const response = await axiosInstance.post('/seller/payment-details', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  agreeTerms: async () => {
    try {
      const response = await axiosInstance.post('/seller/agree-terms');
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
};

export default sellerAuthService;
