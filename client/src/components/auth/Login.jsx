import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Login.css';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validation';
import ModalGooglePassword from './ModalGooglePassword';

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [googlePasswordData, setGooglePasswordData] = useState(null);
  const [formData, setFormData] = useState(() => {
    try {
      const savedEmail = localStorage.getItem('login_email_draft');
      return { email: savedEmail || '', password: '' };
    } catch {
      return { email: '', password: '' };
    }
  });
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors]             = useState({});

  const formDataRef = useRef(formData);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  const [now, setNow] = useState(() => Date.now());

  const [lockUntil, setLockUntil] = useState(() => {
    const v = typeof window !== 'undefined' ? localStorage.getItem('accountLockedUntil') : null;
    return v && new Date(v).getTime() > Date.now() ? v : null;
  });

  useEffect(() => {
    if (!lockUntil) return;
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, [lockUntil]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v = localStorage.getItem('accountLockedUntil');
    if (v && new Date(v).getTime() <= Date.now()) {
      localStorage.removeItem('accountLockedUntil');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (formData.email) localStorage.setItem('login_email_draft', formData.email);
        else localStorage.removeItem('login_email_draft');
      } catch (e) { console.error('Error guardando email draft:', e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const minutosRestantes = useMemo(() => {
    if (!lockUntil) return 15;
    return Math.max(1, Math.ceil((new Date(lockUntil).getTime() - now) / 60000));
  }, [lockUntil, now]);

  const esBloqueado = useMemo(
    () => Boolean(lockUntil && new Date(lockUntil).getTime() > now),
    [lockUntil, now]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: '' } : prev));
  }, []);

  const togglePassword = useCallback(() => setShowPassword(p => !p), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (esBloqueado) {
      toast.error(`Cuenta bloqueada. Intenta en ${minutosRestantes} minuto(s)`);
      return;
    }

    const { email, password } = formDataRef.current;
    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await login({ email, password });

    if (result.needsGooglePassword) {
      setGooglePasswordData({ token: result.token });
      setLoading(false);
      return;
    }

    if (result.success) {
      localStorage.removeItem('accountLockedUntil');
      localStorage.removeItem('login_email_draft');
      setLockUntil(null);
      toast.success('¡Bienvenido!');
      navigate('/');
    } else if (result.locked) {
      setLockUntil(result.lockUntil);
      localStorage.setItem('accountLockedUntil', result.lockUntil);
      toast.error(`Cuenta bloqueada. Intenta en ${minutosRestantes} minuto(s)`);
    } else if (result.needsVerification) {
      toast.info('Debes verificar tu correo primero');
      navigate('/verificar-email', { state: { email } });
    } else {
      const msg = result.attemptsLeft !== undefined
        ? `${result.error}. Intentos restantes: ${result.attemptsLeft}`
        : result.error || 'Credenciales incorrectas';
      toast.error(msg);
      setErrors({ general: msg });
    }

    setLoading(false);
  }, [esBloqueado, minutosRestantes, login, navigate]);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }, []);

  const handleModalSuccess = useCallback(() => {
    setGooglePasswordData(null);
    localStorage.removeItem('login_email_draft');
    navigate('/');
  }, [navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
              <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22" />
            </svg>
            Healthy Help
          </h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="tu@email.com"
              disabled={esBloqueado}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'} id="password" name="password"
                value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                disabled={esBloqueado}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button type="button" className="toggle-password" onClick={togglePassword} tabIndex={-1}>
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.general && (
            <span className="error-message" style={{ display: 'block', textAlign: 'center', marginBottom: '0.75rem' }}>
              {errors.general}
            </span>
          )}

          {esBloqueado && (
            <div className="lock-warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Cuenta bloqueada. Intenta en {minutosRestantes} minuto(s) —{' '}
              <Link to="/recuperar" style={{ color: 'inherit', fontWeight: 700 }}>
                Restablecer contraseña
              </Link>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading || esBloqueado}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="divider"><span>O continúa con</span></div>

          <button type="button" onClick={handleGoogleLogin} className="btn-google" disabled={esBloqueado}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Continuar con Google
          </button>

          <div className="login-footer">
            <Link to="/recuperar" className="link">¿Olvidaste tu contraseña?</Link>
            <p>¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
          </div>
        </form>
      </div>

      {googlePasswordData && (
        <ModalGooglePassword
          token={googlePasswordData.token}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Login;