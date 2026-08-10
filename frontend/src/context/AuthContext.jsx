import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import sellerAuthService from '../services/sellerAuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const persistAuth = (authUser, accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (authUser) {
      localStorage.setItem('nexcart-user', JSON.stringify(authUser));
    }
    setUser(authUser);
    setIsAuthenticated(Boolean(authUser));
  };

  const isAuthFailure = (error) => {
    const statusCode = error?.statusCode || error?.status || error?.response?.status;
    const message = String(error?.message || '').toLowerCase();

    return (
      statusCode === 401 ||
      statusCode === 404 ||
      message.includes('invalid credentials') ||
      message.includes('seller account') ||
      message.includes('user is not a seller')
    );
  };

  const trySellerFallbackLogin = async (email, password) => {
    const response = await sellerAuthService.login(email, password);
    if (response.success && response.data) {
      const { user: authUser, accessToken, refreshToken } = response.data;
      persistAuth(authUser, accessToken, refreshToken);
      return { success: true, user: authUser };
    }

    return { success: false, message: response.message || 'Seller login failed' };
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Failed to authenticate user on load', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('nexcart-user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { user: authUser, accessToken, refreshToken } = response.data;
        persistAuth(authUser, accessToken, refreshToken);
        return { success: true, user: authUser };
      }

      if (isAuthFailure(response)) {
        return await trySellerFallbackLogin(email, password);
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      if (isAuthFailure(error)) {
        try {
          return await trySellerFallbackLogin(email, password);
        } catch (sellerError) {
          return {
            success: false,
            message: sellerError.message || error.message || 'An error occurred during login',
            errors: sellerError.errors || error.errors,
          };
        }
      }

      return {
        success: false,
        message: error.message || 'An error occurred during login',
        errors: error.errors,
      };
    }
  };

  const sellerLogin = async (email, password) => {
    try {
      const response = await sellerAuthService.login(email, password);
      if (response.success && response.data) {
        const { user: authUser, accessToken, refreshToken } = response.data;
        persistAuth(authUser, accessToken, refreshToken);
        return { success: true, user: authUser };
      }
      return { success: false, message: response.message || 'Seller login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred during seller login',
        errors: error.errors,
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('nexcart-user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const sellerRegister = async (firstName, lastName, email, password, phone, username) => {
    try {
      const response = await sellerAuthService.register(firstName, lastName, email, password, phone, username);
      if (response.success && response.data) {
        const { user: authUser, accessToken, refreshToken } = response.data;
        persistAuth(authUser, accessToken, refreshToken);
        return { success: true, user: authUser };
      }
      return { success: false, message: response.message || 'Seller registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred during seller registration',
        errors: error.errors,
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, sellerLogin, sellerRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
