import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
      });

      // Handle connection
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      // Handle task updates
      socketRef.current.on('task_updated', (data) => {
        const { task, action } = data;
        
        switch (action) {
          case 'created':
            toast.success(`New task assigned: ${task.title}`);
            break;
          case 'updated':
            toast.info(`Task updated: ${task.title}`);
            break;
          case 'deleted':
            toast.info(`Task deleted: ${task.title}`);
            break;
          default:
            break;
        }
        
        // Trigger React Query cache invalidation
        window.dispatchEvent(new CustomEvent('invalidate-tasks'));
      });

      // Handle notifications
      socketRef.current.on('notification', (notification) => {
        toast(notification.message, {
          icon: notification.type === 'success' ? '✅' : 'ℹ️'
        });
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  return socketRef.current;
};