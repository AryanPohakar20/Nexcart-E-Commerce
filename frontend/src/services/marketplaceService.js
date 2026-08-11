import axiosInstance from '../api/axios';

const marketplaceService = {
  /**
   * Get C2C Marketplace Listings
   */
  getListings: async (params = {}) => {
    const response = await axiosInstance.get('/marketplace/listings', { params });
    return response.data;
  },

  /**
   * Get single C2C Marketplace Listing by ID
   */
  getListingById: async (id) => {
    const response = await axiosInstance.get(`/marketplace/listings/${id}`);
    return response.data;
  },

  /**
   * Get listings owned by currently authenticated seller
   */
  getMyListings: async () => {
    const response = await axiosInstance.get('/marketplace/listings/my');
    return response.data;
  },

  /**
   * Create a new C2C Marketplace Listing
   */
  createListing: async (formData) => {
    const response = await axiosInstance.post('/marketplace/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing C2C Marketplace Listing
   */
  updateListing: async (id, formData) => {
    const response = await axiosInstance.put(`/marketplace/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a C2C Marketplace Listing
   */
  deleteListing: async (id) => {
    const response = await axiosInstance.delete(`/marketplace/listings/${id}`);
    return response.data;
  },
};

export default marketplaceService;
