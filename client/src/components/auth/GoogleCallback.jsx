import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ModalGooglePassword from './ModalGooglePassword';

const GoogleCallback = () => {
  const { checkAuth, user } = useAuth();
  const navigate = useNavigate();
  const [pendingError, setPendingError]  = useState(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');

        if (errorParam) {
          setPendingError('No se pudo iniciar sesión con Google. Intenta de nuevo.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          credentials: 'include',
          signal: controller.signal,
        });

        if (cancelled) return;

        if (!res.ok) {
          setPendingError('Error al verificar la sesión. Intenta de nuevo.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const data = await res.json();

        if (data.user?.googleId && data.user?.hasPassword === false) {
          setNeedsPassword(true);
          setReady(true);
          return;
        }

        await checkAuth();
        if (!cancelled) navigate('/');
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error en Google callback:', err);
        setPendingError('Error al procesar la autenticación. Intenta de nuevo.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleGoogleCallback();

    return () => { cancelled = true; controller.abort(); };
  }, [checkAuth, navigate]);

  useEffect(() => {
    if (!ready || needsPassword || !user) return;
    navigate('/');
  }, [ready, needsPassword, user, navigate]);

  const handleModalSuccess = useCallback(async () => {
    setNeedsPassword(false);
    await checkAuth();
    navigate('/');
  }, [checkAuth, navigate]);

  if (needsPassword) {
    return (
      <ModalGooglePassword onSuccess={handleModalSuccess} />
    );
  }

  if (pendingError) {
    return (
      <div className="vista-auth">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ {pendingError}</p>
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
          margin: '0 auto 1rem',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Verificando con Google...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default GoogleCallback;
