import React, { useState, useEffect } from 'react';
import { isValidPassword } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ResetPassword = ({ onNavigate, token }) => {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [resetExitoso, setResetExitoso] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🛡️ Obtener token de la URL si no se pasa como prop
  const [resetToken, setResetToken] = useState(token || '');

  useEffect(() => {
    // Si no hay token en props, intentar obtenerlo de la URL
    if (!token) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token') || window.location.pathname.split('/').pop();
      setResetToken(urlToken);
    }
  }, [token]);

  const manejarReset = async () => {
    const newErrors = {};

    // 🛡️ Validación frontend
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!resetToken) {
      toast.error('Token de recuperación no válido');
      return;
    }

    setLoading(true);

    // 🔒 Llamada al backend
    const result = await resetPassword(resetToken, password);

    if (result.success) {
      setResetExitoso(true);
      toast.success('Contraseña restablecida exitosamente');
      
      setTimeout(() => {
        onNavigate('inicio'); // Ya está logueado automáticamente
      }, 2000);
    } else {
      toast.error(result.error || 'Error al restablecer contraseña');
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      manejarReset();
    }
  };

  return (
    <div className="vista-auth">
      <div className="auth-card">
        <h2>Restablecer Contraseña</h2>
        {!resetExitoso ? (
          <>
            <p className="auth-description">
              Ingresa tu nueva contraseña
            </p>
            <div className="auth-form">
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Nueva contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: '' });
                  }}
                  className={errors.password ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <input 
                  type="password" 
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  disabled={loading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              {errors.general && (
                <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {errors.general}
                </div>
              )}
              
              <button 
                onClick={manejarReset} 
                className="btn-primario"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </div>
            <p>
              <span onClick={() => onNavigate('login')} className="link-text">
                Volver al inicio de sesión
              </span>
            </p>
          </>
        ) : (
          <div className="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>✅ Contraseña restablecida</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#666' }}>
              Redirigiendo...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;