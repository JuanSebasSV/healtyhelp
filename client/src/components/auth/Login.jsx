import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateLoginForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './Login.css';

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

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const manejarSubmit = async () => {
    const validationErrors = validateLoginForm(email, pass);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const result = await login({ email, password: pass });

    if (result.success) {
      toast.success('¡Bienvenido!');
      navigate('/');
    } else {
      toast.error(result.error || 'Error al iniciar sesión');
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

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
    <div className="vistaAuth">
      <div className="authCard">
        <h2>Iniciar Sesión</h2>
        <div className="authForm">
          <div className="formGroup">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className={errors.email ? 'inputError' : ''}
              disabled={loading}
            />
            {errors.email && <span className="errorMessage">{errors.email}</span>}
          </div>
          
          <div className="formGroup">
            <div className="inputWrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                onKeyPress={handleKeyPress}
                className={errors.password ? 'inputError' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="eyeButton"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            {errors.password && <span className="errorMessage">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="errorMessage" style={{ textAlign: 'center', marginBottom: '1rem' }}>
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

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="btnGoogle"
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"/>
            </svg>
            Continuar con Google
          </button>
        </div>
        <p>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="linkText">
            Regístrate
          </Link>
        </p>
        <p>
          <Link to="/recuperar" className="linkText">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;