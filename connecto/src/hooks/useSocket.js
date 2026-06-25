/**
 * useSocket Hook
 * Manages a Socket.io connection with automatic cleanup
 */

import { useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../Context/AuthContext';

export const useSocket = () => {
  const { user } = useContext(AuthContext);
  const socket   = useRef(null);

  useEffect(() => {
    if (!user) return;

    const url = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : '/';

    socket.current = io(url, { transports: ['websocket', 'polling'] });

    socket.current.emit('newUser', { userId: user._id, username: user.username });

    return () => {
      socket.current?.disconnect();
    };
  }, [user]);

  const emit = (event, data) => socket.current?.emit(event, data);
  const on   = (event, cb)  => socket.current?.on(event, cb);
  const off  = (event, cb)  => socket.current?.off(event, cb);

  return { socket: socket.current, emit, on, off };
};