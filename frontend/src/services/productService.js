// src/services/productService.js
// Client service for fetching customer-facing product catalogue, categories, search, and filters.

import axiosInstance from '../api/axios';

const productService = {
  /**
   * Get all products with query parameters (category, brand, search, price, rating, pagination, etc.)
   */
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },

  /**
   * Get single product details by ID or Slug
   */
  getProductById: async (idOrSlug) => {
    const response = await axiosInstance.get(`/products/${idOrSlug}`);
    return response.data;
  },

  /**
   * Get featured products for homepage / carousels
   */
  getFeaturedProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products/featured', { params });
    return response.data;
  },

  /**
   * Get trending / popular products
   */
  getTrendingProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products/trending', { params });
    return response.data;
  },

  /**
   * Get newest arrivals
   */
  getNewestProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products/newest', { params });
    return response.data;
  },

  /**
   * Get recommended products
   */
  getRecommendedProducts: async (params = {}) => {
    const response = await axiosInstance.get('/products/recommended', { params });
    return response.data;
  },

  /**
   * Search products with keyword and dynamic filters
   */
  searchProducts: async (params = {}) => {
    const response = await axiosInstance.get('/search', { params });
    return response.data;
  },

  /**
   * Autocomplete search terms
   */
  getAutocomplete: async (q) => {
    const response = await axiosInstance.get('/search/autocomplete', { params: { q } });
    return response.data;
  },

  /**
   * Search suggestions (categories, brands, products)
   */
  getSuggestions: async (q) => {
    const response = await axiosInstance.get('/search/suggestions', { params: { q } });
    return response.data;
  },

  /**
   * Fetch all categories
   */
  getCategories: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },

  /**
   * Create a new product (Seller)
   */
  createProduct: async (formData) => {
    const response = await axiosInstance.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get all products for the logged-in seller
   */
  getSellerProducts: async () => {
    const response = await axiosInstance.get('/products/seller');
    return response.data;
  },

  /**
   * Update an existing product (Seller)
   */
  updateProduct: async (id, formData) => {
    const response = await axiosInstance.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a product (Seller)
   */
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
