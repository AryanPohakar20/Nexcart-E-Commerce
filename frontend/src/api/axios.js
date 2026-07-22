import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }
        
        // Call refresh token API directly using fetch or basic axios to avoid infinite loops
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data?.data?.accessToken) {
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (err) {
        // If refresh token is invalid or expired, clear storage and maybe redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Handle redirect or logout logic (usually via an event or AuthContext but keeping it clean here)
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
