import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './authContext';
import api from '../api/axios';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const limpiarSesion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Verificar expiración del token localmente
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        limpiarSesion();
        setLoading(false);
        return;
      }
    } catch {
      limpiarSesion();
      setLoading(false);
      return;
    }

    // Verificar con el servidor que el usuario aún existe
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      // 401 = usuario no existe o token inválido → cerrar sesión
      if (error.response?.status === 401 || error.response?.status === 404) {
        limpiarSesion();
      }
    } finally {
      setLoading(false);
    }
  }, [limpiarSesion]);

  // Verificar al montar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Verificar cada 2 minutos que el usuario sigue existiendo
  // Esto detecta cuando la cuenta fue eliminada desde otra ventana
  useEffect(() => {
    const intervalo = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && user) checkAuth();
    }, 2 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [user, checkAuth]);

  // Detectar cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token fue eliminado desde otra pestaña → cerrar sesión
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      // No guardar token — requiere verificación de email primero
      if (data.needsVerification) {
        return { success: true, needsVerification: true, email: data.email };
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
      }
      return { success: true };
    } catch (error) {
      const err = error.response?.data;
      return {
        success: false,
        error: err?.error || 'Error en registro',
        needsVerification: err?.needsVerification,
        email: err?.email
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
      const err = error.response?.data;
      return {
        success: false,
        error: err?.error || 'Error en login',
        locked: err?.locked,
        lockUntil: err?.lockUntil,
        needsVerification: err?.needsVerification,
        email: err?.email,
        attemptsLeft: err?.attemptsLeft
      };
    }
  };

  const logout = () => limpiarSesion();

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