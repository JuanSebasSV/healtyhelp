import React, { useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { validateResetPasswordForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const EyeIcon = ({ open }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
);

const BrandHeader = () => (
  <div className="auth-brand">
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22" />
    </svg>
    <span className="auth-brand-nombre">Healthy Help</span>
  </div>
);

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate          = useNavigate();
  const { token }         = useParams();

  const [formData, setFormData]             = useState({ password: '', passwordConf: '' });
  const [errors, setErrors]                 = useState({});
  const [loading, setLoading]               = useState(false);
  const [success, setSuccess]               = useState(false);
  const [showPassword, setShowPassword]     = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    const { password, passwordConf } = formData;
    const validationErrors = validateResetPasswordForm(password, passwordConf);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!token) {
      toast.error('Token inválido o expirado');
      return;
    }

    setLoading(true);

    const result = await resetPassword(token, password);

    if (result.success) {
      setSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      toast.error(result.error || 'Error al restablecer contraseña');
      setErrors({ general: result.error });
    }

    setLoading(false);
  }, [formData, token, resetPassword, navigate]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') handleSubmit(e);
  }, [handleSubmit]);

  const togglePassword    = useCallback(() => setShowPassword(p => !p), []);
  const togglePasswordConf = useCallback(() => setShowPasswordConf(p => !p), []);

  if (!token) {
    return (
      <div className="vistaAuth">
        <div className="authCard">
          <BrandHeader />
          <h2>❌ Token inválido</h2>
          <p>El enlace de recuperación es inválido o ha expirado.</p>
          <button
            onClick={() => navigate('/recuperar')}
            className="btn-primario"
            style={{ marginTop: '1.5rem', width: '100%' }}
          >
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vistaAuth">
      <div className="authCard">
        <BrandHeader />
        <h2>Restablecer contraseña</h2>

        {!success ? (
          <>
            <p className="authDescription">Ingresa tu nueva contraseña</p>

            <form onSubmit={handleSubmit} className="authForm">
              <div className="formGroup">
                <div className="inputWrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Nueva contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={errors.password ? 'inputError' : ''}
                    disabled={loading}
                  />
                  <button type="button" className="eyeButton" onClick={togglePassword} tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {errors.password && <span className="errorMessage">{errors.password}</span>}
              </div>

              <div className="formGroup">
                <div className="inputWrapper">
                  <input
                    type={showPasswordConf ? 'text' : 'password'}
                    name="passwordConf"
                    placeholder="Confirmar contraseña"
                    value={formData.passwordConf}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    className={errors.passwordConf ? 'inputError' : ''}
                    disabled={loading}
                  />
                  <button type="button" className="eyeButton" onClick={togglePasswordConf} tabIndex={-1}>
                    <EyeIcon open={showPasswordConf} />
                  </button>
                </div>
                {errors.passwordConf && <span className="errorMessage">{errors.passwordConf}</span>}
              </div>

              {errors.general && (
                <div className="errorMessage" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {errors.general}
                </div>
              )}

              <button type="submit" className="btn-primario" disabled={loading}>
                {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>

            <p>
              <Link to="/login" className="linkText">Volver al inicio de sesión</Link>
            </p>
          </>
        ) : (
          <div className="successMessage">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p>¡Contraseña restablecida!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Redirigiendo al login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;