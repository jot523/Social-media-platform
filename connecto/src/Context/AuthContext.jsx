import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current user profile from backend
  const fetchCurrentUser = useCallback(async (authToken) => {
    if (!authToken) return null;
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return data;
      } else {
        // Token invalid — clear auth state
        console.warn('Token rejected by API, clearing auth');
        return null;
      }
    } catch (err) {
      // Network error — try cached user
      console.warn('Could not fetch user profile from API, using cached data');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const cached = JSON.parse(storedUser);
          setUser(cached);
          return cached;
        } catch {
          return null;
        }
      }
      return null;
    }
  }, []);

  // On mount, if we have a token, fetch the user
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        const userData = await fetchCurrentUser(token);
        if (!userData) {
          // Token is invalid or network is down with no cache — force re-login
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token, fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        const authToken = data.token;
        const userData = data.user;

        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Cannot connect to server. Please ensure the backend is running.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (res.ok) {
        const authToken = data.token;
        const newUser = data.user;

        setToken(authToken);
        setUser(newUser);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        navigate('/');
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Cannot connect to server. Please ensure the backend is running.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/landing');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      fetchCurrentUser
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
