import { io } from 'socket.io-client';

// Validate and get Socket URL
const getSocketUrl = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  const isProduction = import.meta.env.PROD;
  
  // Validate URL format
  if (isProduction && (socketUrl.includes('localhost') || socketUrl.includes('127.0.0.1'))) {
    console.error(
      '%c⚠️ Socket Configuration Error',
      'color: red; font-weight: bold; font-size: 14px;'
    );
    console.error('VITE_SOCKET_URL is pointing to localhost in production!');
    console.error('Current SOCKET_URL:', socketUrl);
    console.error('Please set VITE_SOCKET_URL in Vercel environment variables.');
  } else {
    console.log('🔌 Socket Server URL:', socketUrl);
  }
  
  return socketUrl;
};

const SOCKET_URL = getSocketUrl();

let socket = null;
let connectionStatus = 'disconnected';
let reconnectAttempts = 0;

export const socketService = {
  connect: (userId) => {
    if (socket?.connected) {
      console.log('✅ Socket already connected');
      return socket;
    }

    console.log('🔌 Attempting to connect to Socket.io server:', SOCKET_URL);
    connectionStatus = 'connecting';

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
    });

    // Connection event handlers
    socket.on('connect', () => {
      connectionStatus = 'connected';
      reconnectAttempts = 0;
      console.log('✅ Socket.io connected successfully');
      console.log('🆔 Socket ID:', socket.id);
      
      // Join user room
      if (userId) {
        socket.emit('user:join', { userId });
        console.log('👤 Joined user room:', userId);
      }
    });

    socket.on('disconnect', (reason) => {
      connectionStatus = 'disconnected';
      console.warn('⚠️ Socket.io disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        console.log('🔄 Attempting to reconnect...');
        socket.connect();
      }
    });

    socket.on('connect_error', (error) => {
      connectionStatus = 'error';
      reconnectAttempts++;
      console.error('❌ Socket.io connection error:', error.message);
      console.error('💡 Check if backend Socket.io server is running and VITE_SOCKET_URL is correct:', SOCKET_URL);
      
      if (reconnectAttempts >= 5) {
        console.error('🔴 Multiple connection failures. Please check your backend server.');
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      connectionStatus = 'connected';
      reconnectAttempts = 0;
      console.log(`✅ Socket.io reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    socket.on('reconnect_failed', () => {
      connectionStatus = 'failed';
      console.error('🔴 Socket.io reconnection failed. Please check your backend server.');
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      console.log('🔌 Disconnecting Socket.io...');
      socket.disconnect();
      socket = null;
      connectionStatus = 'disconnected';
    }
  },

  getSocket: () => socket,

  getConnectionStatus: () => connectionStatus,

  isConnected: () => socket?.connected || false,

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      if (import.meta.env.DEV) {
        console.log(`👂 Listening to socket event: ${event}`);
      }
    } else {
      console.warn(`⚠️ Cannot listen to ${event}: Socket not initialized`);
    }
  },

  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
      if (import.meta.env.DEV) {
        console.log(`🔇 Stopped listening to socket event: ${event}`);
      }
    }
  },

  emit: (event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
      if (import.meta.env.DEV) {
        console.log(`📤 Emitting socket event: ${event}`, data);
      }
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
      console.warn('💡 Make sure socketService.connect() is called first');
    }
  },
};

export default socketService;

