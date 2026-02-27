import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const GoogleCallback = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        await checkAuth();
        navigate('/');
      } else {
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, []);

  return (
    <div className="vista-auth">
      <div className="auth-card">
        <p>Verificando autenticación...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;