import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// 🔒 Hook personalizado para autenticación
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  // Retornar con nomenclatura que usas en tus componentes
  return {
    // Tus nombres originales
    usuario: context.user,
    iniciarSesion: context.login,
    cerrarSesion: context.logout,
    isAuthenticated: !!context.user,
    
    // También mantener los nombres estándar
    user: context.user,
    login: context.login,
    logout: context.logout,
    register: context.register,
    forgotPassword: context.forgotPassword,
    resetPassword: context.resetPassword,
    isAdmin: context.isAdmin,
    loading: context.loading,
    checkAuth: context.checkAuth
  };
};

export { useAuth };
export default useAuth;