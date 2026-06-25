/**
 * Notification ViewModel (Shared)
 * Manages notification state across the app
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { authHeaders, isRealToken } from '../../services/utils/authUtils';

export const useNotificationViewModel = () => {
  const { token } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [isOpen, setIsOpen]               = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isRealToken(token)) return; // skip for mock tokens
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        headers: authHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    if (!isRealToken(token)) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: authHeaders(token)
      });
    } catch { /* silent */ }
  }, [token]);

  const markOneRead = useCallback(async (id) => {
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (!isRealToken(token)) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders(token)
      });
    } catch { /* silent */ }
  }, [token]);

  const addRealtime = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    fetchNotifications,
    markAllRead,
    markOneRead,
    addRealtime,
  };
};