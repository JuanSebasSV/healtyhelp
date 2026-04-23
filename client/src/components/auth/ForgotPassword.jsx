import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isValidEmail } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const manejarRecuperar = async () => {
    // Validación frontend
    if (!email) {
      setError('El correo es requerido');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('El correo no es válido');
      return;
    }

    setLoading(true);

    // Llamada al backend
    const result = await forgotPassword(email);

    if (result.success) {
      setEnviado(true);
      toast.success('Revisa tu correo electrónico');      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      toast.error(result.error || 'Error al enviar el correo');
      setError(result.error);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      manejarRecuperar();
    }
  };

  return (
    <div className="vistaAuth">
      <div className="authCard">
        {/*Header Healthy Help*/}
        <div className="auth-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/>
          </svg>
          <span className="auth-brand-nombre">Healthy Help</span>
        </div>
        <h2>Recuperar contraseña</h2>
        {!enviado ? (
          <>
            <p className="authDescription">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div className="authForm">
              <div className="formGroup">
                <input 
                  type="email" 
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className={error ? 'inputError' : ''}
                  disabled={loading}
                />
                {error && <span className="errorMessage">{error}</span>}
              </div>
              <button 
                onClick={manejarRecuperar} 
                className="btn-primario"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </div>
            <p>
              <Link to="/login" className="linkText">
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        ) : (
          <div className="successMessage">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>✅ Enlace enviado a tu correo</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#666' }}>
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#999' }}>
              Redirigiendo al login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;