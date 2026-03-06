import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const GoogleCallback = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const errorParam = urlParams.get('error');

        // Si Google devolvió un error
        if (errorParam) {
          setError('No se pudo iniciar sesión con Google. Intenta de nuevo.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!token) {
          setError('No se recibió el token de autenticación.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        localStorage.setItem('token', token);
        await checkAuth();
        navigate('/');

      } catch (err) {
        console.error('Error en Google callback:', err);
        setError('Error al procesar la autenticación. Intenta de nuevo.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, []);

  if (error) {
    return (
      <div className="vista-auth">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ {error}</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
            Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vista-auth">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(255,255,255,0.2)',
          borderTop: '3px solid #f77f00',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }}/>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Verificando con Google...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default GoogleCallback;