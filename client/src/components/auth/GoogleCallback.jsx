import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// 🔒 Componente para manejar el callback de Google OAuth
const GoogleCallback = ({ onNavigate }) => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Obtener token de la URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        // Guardar token
        localStorage.setItem('token', token);
        
        // Verificar autenticación
        await checkAuth();
        
        // Redirigir a inicio
        onNavigate('inicio');
      } else {
        // Si no hay token, redirigir a login
        onNavigate('login');
      }
    };

    handleGoogleCallback();
  }, [checkAuth, onNavigate]);

  return (
    <div className="vista-auth">
      <div className="auth-card">
        <div className="success-message">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;