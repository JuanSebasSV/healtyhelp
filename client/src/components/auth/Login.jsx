import React, { useState } from 'react';
import { validateLoginForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Login = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const manejarSubmit = async () => {
    // 🛡️ Validación frontend
    const validationErrors = validateLoginForm(email, pass);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    // 🔒 Llamada al backend
    const result = await login({ email, password: pass });

    if (result.success) {
      toast.success('¡Bienvenido!');
      onNavigate('inicio');
    } else {
      toast.error(result.error || 'Error al iniciar sesión');
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  // 🔒 Login con Google
  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      manejarSubmit();
    }
  };

  return (
    <div className="vista-auth">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <div className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className={errors.email ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
              onKeyPress={handleKeyPress}
              className={errors.password ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}
          
          <button 
            onClick={manejarSubmit} 
            className="btn-primario"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Entrar'}
          </button>

          {/* 🔒 Botón de Google OAuth */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="btn-google"
            disabled={loading}
            style={{
              marginTop: '1rem',
              background: '#db4437',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="currentColor" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="currentColor" d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"/>
              <path fill="currentColor" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="currentColor" d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"/>
            </svg>
            Continuar con Google
          </button>
        </div>
        <p>
          ¿No tienes cuenta?{' '}
          <span onClick={() => onNavigate('registro')} className="link-text">
            Regístrate
          </span>
        </p>
        <p>
          <span onClick={() => onNavigate('recuperar')} className="link-text">
            ¿Olvidaste tu contraseña?
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;