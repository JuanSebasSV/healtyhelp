import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { validateResetPasswordForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const EyeIcon = ({ open }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [formData, setFormData] = useState({
    password: '',
    passwordConf: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const result = await resetPassword(token, formData.password);

    if (result.success) {
      setSuccess(true);
      toast.success('Contraseña restablecida exitosamente');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      toast.error(result.error || 'Error al restablecer contraseña');
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit(e);
  };

  if (!token) {
    return (
      <div className="vistaAuth">
        <div className="authCard">
          <h2>❌ Token Inválido</h2>
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
        <h2>Restablecer Contraseña</h2>

        {!success ? (
          <>
            <p className="authDescription">
              Ingresa tu nueva contraseña
            </p>

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
                  <button
                    type="button"
                    className="eyeButton"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
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
                  <button
                    type="button"
                    className="eyeButton"
                    onClick={() => setShowPasswordConf(!showPasswordConf)}
                    tabIndex={-1}
                  >
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
            <p>¡Contraseña restablecida!</p>
            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
              Redirigiendo al login...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;