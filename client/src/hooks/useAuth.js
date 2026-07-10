import { use } from 'react';
import { AuthContext } from '../context/authContext';
import api from '../api/axios';

const useAuth = () => {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  const setGooglePassword = async (password) => {
    try {
      await api.post('/auth/set-google-password', { password });
      await context.checkAuth();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error de conexión'
      };
    }
  };

  return {
    usuario: context.user,
    iniciarSesion: context.login,
    cerrarSesion: context.logout,
    isAuthenticated: !!context.user,
    user: context.user,
    login: context.login,
    logout: context.logout,
    register: context.register,
    forgotPassword: context.forgotPassword,
    resetPassword: context.resetPassword,
    isAdmin: context.isAdmin,
    loading: context.loading,
    checkAuth: context.checkAuth,
    updateAutoLogout: context.updateAutoLogout,
    setGooglePassword,
  };
};

export { useAuth };
export default useAuth;