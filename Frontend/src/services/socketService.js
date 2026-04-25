import { io } from 'socket.io-client';

// Connect to your backend server
const SOCKET_URL = 'http://localhost:3000';

/** @param {unknown} value */
const toText = (value) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value && typeof value === 'object') {
    const candidates = [value.text, value.message, value.query, value.value];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }

  return '';
};

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to backend server');
        this.connected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from backend server');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.connected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  sendMessage(message, callback) {
    if (this.socket) {
      this.socket.emit('ai-message', toText(message));

      // Listen for the response
      this.socket.once('ai-response', (response) => {
        callback(toText(response));
      });
    } else {
      console.error('Socket not connected');
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;
