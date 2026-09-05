import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('Socket connection aborted: No access token found');
      return null;
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket'], // polling first — required for Render free tier
      upgrade: true,                         // upgrade to websocket after polling connects
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket connected successfully:', this.socket?.id);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('joinConversation', { conversationId });
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('leaveConversation', { conversationId });
    }
  }

  sendMessage(payload, callback) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('sendMessage', payload, (response) => {
        if (callback) callback(response);
      });
    }
  }

  emitTyping(conversationId, partnerId) {
    if (this.socket && conversationId) {
      this.socket.emit('typing', { conversationId, partnerId });
    }
  }

  emitStopTyping(conversationId, partnerId) {
    if (this.socket && conversationId) {
      this.socket.emit('stopTyping', { conversationId, partnerId });
    }
  }

  markMessageSeen(conversationId, messageIds = []) {
    if (this.socket && conversationId) {
      this.socket.emit('messageSeen', { conversationId, messageIds });
    }
  }

  emitOfferAction(payload) {
    if (this.socket && payload.conversationId) {
      this.socket.emit('offerAction', payload);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
