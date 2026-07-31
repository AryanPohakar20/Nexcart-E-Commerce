import axiosInstance from '../api/axios';

const sellerAuthService = {
  register: async (firstName, lastName, email, password, phone, username) => {
    try {
      const response = await axiosInstance.post('/seller/auth/register', {
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
      const response = await axiosInstance.post('/seller/auth/login', {
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

  logout: async () => {
    try {
      await axiosInstance.post('/seller/auth/logout');
    } catch (error) {
      console.error('Seller logout error', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nexcart-user');
    }
  },

  createSellerEntry: async () => {
    try {
      const response = await axiosInstance.post('/seller/create');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  saveStep1: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-1', data);
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
      const response = await axiosInstance.put('/seller/onboarding/step-2', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  uploadIdentity: async (data) => {
    try {
      const formData = new FormData();
      formData.append('idType', data.idType);
      if (data.frontImage) formData.append('frontImage', data.frontImage);
      if (data.backImage) formData.append('backImage', data.backImage);

      const response = await axiosInstance.put('/seller/onboarding/step-3', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  submitPayment: async (data) => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-4', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  agreeTerms: async () => {
    try {
      const response = await axiosInstance.put('/seller/onboarding/step-5');
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
