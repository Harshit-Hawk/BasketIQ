import { io } from 'socket.io-client';

// Use the VITE_API_URL or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
