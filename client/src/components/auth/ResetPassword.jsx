import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { validateResetPasswordForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    passwordConf: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación frontend
    const validationErrors = validateResetPasswordForm(
      formData.password,
      formData.passwordConf
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      toast.error('Token inválido o expirado');
      return;
    }

    setLoading(true);

    // Llamada al backend
    const result = await resetPassword(token, formData.password);

    if (result.success) {
      setSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(result.error || 'Error al restablecer contraseña');
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  if (!token) {
    return (
      <div className="vistaAuth">
        <div className="authCard">
          <h2>❌ Token Inválido</h2>
          <p>El enlace de recuperación es inválido o ha expirado.</p>
          <button onClick={() => navigate('/forgot-password')} className="btn-primario">
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vistaAuth">
      <div className="authCard">
        <h2>Restablecer Contraseña</h2>
        {!success ? (
          <>
            <p className="authDescription">
              Ingresa tu nueva contraseña
            </p>
            <form onSubmit={handleSubmit} className="authForm">
              <div className="formGroup">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Nueva contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={errors.password ? 'inputError' : ''}
                  disabled={loading}
                />
                {errors.password && <span className="errorMessage">{errors.password}</span>}
              </div>

              <div className="formGroup">
                <input 
                  type="password" 
                  name="passwordConf"
                  placeholder="Confirmar contraseña"
                  value={formData.passwordConf}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className={errors.passwordConf ? 'inputError' : ''}
                  disabled={loading}
                />
                {errors.passwordConf && <span className="errorMessage">{errors.passwordConf}</span>}
              </div>

              {errors.general && (
                <div className="errorMessage" style={{ marginBottom: '1rem' }}>
                  {errors.general}
                </div>
              )}

              <button 
                type="submit"
                className="btn-primario"
                disabled={loading}
              >
                {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>

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
            <p>✅ Contraseña restablecida</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#666' }}>
              Redirigiendo al login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
