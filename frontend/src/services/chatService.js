import axiosInstance from '../api/axios';

const chatService = {
  getConversations: async (filter = 'all', search = '') => {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (search) params.append('search', search);

    const response = await axiosInstance.get(`/chat/conversations?${params.toString()}`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await axiosInstance.get('/chat/unread-count');
    return response.data;
  },

  createConversation: async (participantId, productId = null) => {
    const response = await axiosInstance.post('/chat/createConversation', {
      participantId,
      productId,
    });
    return response.data;
  },

  getMessages: async (conversationId, page = 1, limit = 50) => {
    const response = await axiosInstance.get(`/chat/messages/${conversationId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (messageData) => {
    const response = await axiosInstance.post('/chat/send', messageData);
    return response.data;
  },

  markAsRead: async (conversationId) => {
    const response = await axiosInstance.patch(`/chat/read/${conversationId}`);
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await axiosInstance.post('/chat/offer', offerData);
    return response.data;
  },

  acceptOffer: async (offerId, messageId) => {
    const response = await axiosInstance.patch('/chat/offer/accept', { offerId, messageId });
    return response.data;
  },

  rejectOffer: async (offerId, messageId) => {
    const response = await axiosInstance.patch('/chat/offer/reject', { offerId, messageId });
    return response.data;
  },

  counterOffer: async (offerId, messageId, counterPrice, note = '') => {
    const response = await axiosInstance.patch('/chat/offer/counter', {
      offerId,
      messageId,
      counterPrice,
      note,
    });
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await axiosInstance.patch(`/chat/block/${userId}`);
    return response.data;
  },

  reportUser: async (reportData) => {
    const response = await axiosInstance.post('/chat/report', reportData);
    return response.data;
  },

  deleteMessage: async (messageId, deleteType = 'me') => {
    const response = await axiosInstance.delete(`/chat/delete/${messageId}`, {
      data: { deleteType },
    });
    return response.data;
  },
};

export default chatService;
