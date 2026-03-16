import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authContext';
import api from '../api/axios';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      // El registro ahora requiere verificación — no hay token todavía
      return {
        success: true,
        needsVerification: data.needsVerification,
        email: data.email
      };
    } catch (error) {
      const data = error.response?.data;
      return {
        success: false,
        error: data?.error || 'Error en registro',
        needsVerification: data?.needsVerification,
        email: data?.email
      };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      const data = error.response?.data;
      const status = error.response?.status;

      // Cuenta bloqueada
      if (status === 423) {
        return {
          success: false,
          locked: true,
          lockUntil: data?.lockUntil,
          error: data?.error
        };
      }

      // Necesita verificación
      if (data?.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          email: data?.email,
          error: data?.error
        };
      }

      return {
        success: false,
        error: data?.error || 'Error en login',
        attemptsLeft: data?.attemptsLeft
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accountLockedUntil');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      localStorage.setItem('token', data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, forgotPassword, resetPassword, isAdmin, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};