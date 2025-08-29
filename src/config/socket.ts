// Socket configuration
const socketConfig = {
  // Use environment variable or fallback to localhost
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:8081',
  
  // Socket.io connection options
  connectionOptions: {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  },
};

export default socketConfig;