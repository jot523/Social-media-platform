/**
 * Socket Service
 * Singleton Socket.io client with event management
 */

import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket   = null;
    this.handlers = new Map();
  }

  connect(user) {
    if (this.socket?.connected) return this.socket;

    const url = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : '/';

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
      if (user) {
        this.socket.emit('newUser', { userId: user._id, username: user.username });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected, cannot emit:', event);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event, handler) {
    if (!this.socket) return;
    this.socket.on(event, handler);
    // Track for cleanup
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  removeAllListeners(event) {
    if (!this.socket) return;
    if (event) {
      this.socket.removeAllListeners(event);
      this.handlers.delete(event);
    } else {
      this.socket.removeAllListeners();
      this.handlers.clear();
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  // ── Chat helpers ──────────────────────────────────────────────
  sendMessage({ senderName, receiverName, senderId, receiverId, text }) {
    this.emit('sendMessage', { senderName, receiverName, senderId, receiverId, text });
  }

  sendTyping(senderName, receiverName) {
    this.emit('typing', { senderName, receiverName });
  }

  sendStopTyping(senderName, receiverName) {
    this.emit('stopTyping', { senderName, receiverName });
  }

  // ── Notification helpers ──────────────────────────────────────
  sendNotification(receiverId, notification) {
    this.emit('sendNotification', { receiverId, notification });
  }
}

// Singleton
const socketService = new SocketService();
export default socketService;