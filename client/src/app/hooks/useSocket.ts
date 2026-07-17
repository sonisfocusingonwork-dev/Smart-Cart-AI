import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });
      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
      });
      setSocket(socketInstance);
    }
  }, []);

  return socket || socketInstance;
};
