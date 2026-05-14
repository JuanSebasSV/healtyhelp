import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  const setGooglePassword = async (password, token) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/set-google-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      if (data.token && data.user) context.login(data.token, data.user);
      return { success: true, token: data.token, user: data.user };
    } catch {
      return { success: false, error: 'Error de conexión' };
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