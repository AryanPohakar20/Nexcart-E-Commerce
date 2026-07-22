import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
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
        const { user, accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        setUser(user);
        setIsAuthenticated(true);
        return { success: true, user };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred during login',
        errors: error.errors
      };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
