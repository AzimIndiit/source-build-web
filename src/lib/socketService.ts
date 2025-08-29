import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import socketConfig from '@/config/socket';

// Define socket event types (extend as needed based on your events)
export interface ServerToClientEvents {
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  message: (data: any) => void;
  notification: (data: any) => void;
  orderUpdate: (data: any) => void;
  chatMessage: (data: any) => void;
  // Add more events as needed
}

export interface ClientToServerEvents {
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (data: any) => void;
  markAsRead: (messageId: string) => void;
  // Add more events as needed
}

type SocketEventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  private isConnected: boolean;
  private userId: string | null;

  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
  }

  connect(userId: string): void {
    // Prevent multiple connections
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    // Store userId for reconnection
    this.userId = userId;

    // Connect to the WebSocket endpoint
    const wsUrl = socketConfig.socketUrl;
    
    this.socket = io(`${wsUrl}?userId=${userId}`, socketConfig.connectionOptions) as Socket<ServerToClientEvents, ClientToServerEvents>;

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected with userId:', this.userId);
      // toast.success('Connected to server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  // Subscribe to an event
  on(event: string, callback: SocketEventCallback): void {
    if (!this.socket) {
      console.warn('Socket not connected. Cannot subscribe to event:', event);
      return;
    }
    this.socket.on(event as keyof ServerToClientEvents, callback as any);
  }

  // Unsubscribe from an event
  off(event: string, callback?: SocketEventCallback): void {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event as keyof ServerToClientEvents, callback as any);
    } else {
      this.socket.off(event as keyof ServerToClientEvents);
    }
  }

  // Emit an event
  emit(event: string, data?: any): void {
    if (!this.socket) {
      console.warn('Socket not connected. Cannot emit event:', event);
      return;
    }
    this.socket.emit(event as keyof ClientToServerEvents, data);
  }

  // Check if socket is connected
  getIsConnected(): boolean {
    return this.isConnected;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  // Reconnect with stored userId
  reconnect(): void {
    if (this.userId && !this.socket?.connected) {
      this.connect(this.userId);
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;