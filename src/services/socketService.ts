import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem('business_nexus_token') || (() => {
    try {
      const user = JSON.parse(localStorage.getItem('business_nexus_user') || '{}');
      return user?.token || null;
    } catch {
      return null;
    }
  })();

  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: {
      token
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
