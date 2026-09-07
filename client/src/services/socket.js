import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io('/live', {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socket.on('connect', () => console.log('📡 Connected to /live socket'));
    socket.on('disconnect', (reason) => console.log('📡 Socket disconnected:', reason));
    socket.on('connect_error', (err) => console.warn('📡 Socket error:', err.message));
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
