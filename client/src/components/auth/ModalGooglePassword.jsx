import { useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './ModalGooglePassword.css';

const EyeIcon = ({ open }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const validarPassword = (password) => {
  if (!password || password.length < 8) return 'Debe tener al menos 8 caracteres';
  if (!/[a-z]/.test(password))          return 'Debe contener al menos una letra minúscula';
  if (!/[A-Z]/.test(password))          return 'Debe contener al menos una letra mayúscula';
  if (!/\d/.test(password))             return 'Debe contener al menos un número';
  return null;
};

const ModalGooglePassword = ({ token, onSuccess }) => {
  const { setGooglePassword } = useAuth();

  const [pass, setPass]         = useState('');
  const [passConf, setPassConf] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const passRef     = useRef(pass);
  const passConfRef = useRef(passConf);
  passRef.current     = pass;
  passConfRef.current = passConf;

  const requisitos = useMemo(() => ({
    longitud:   pass.length >= 8,
    minuscula:  /[a-z]/.test(pass),
    mayuscula:  /[A-Z]/.test(pass),
    numero:     /\d/.test(pass),
  }), [pass]);

  const handleSubmit = useCallback(async () => {
    const currentPass     = passRef.current;
    const currentPassConf = passConfRef.current;

    const pwdError = validarPassword(currentPass);
    if (pwdError) { setError(pwdError); return; }
    if (currentPass !== currentPassConf) { setError('Las contraseñas no coinciden'); return; }

    setError('');
    setLoading(true);

    const result = await setGooglePassword(currentPass, token);

    if (result.success) {
      toast.success('¡Contraseña creada! Ya puedes iniciar sesión con tu correo.');
      onSuccess(result);
    } else {
      setError(result.error || 'Error al guardar la contraseña');
    }

    setLoading(false);
  }, [token, setGooglePassword, onSuccess]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  }, [loading, handleSubmit]);

  const handlePassChange     = useCallback((e) => { setPass(e.target.value);     setError(''); }, []);
  const handlePassConfChange = useCallback((e) => { setPassConf(e.target.value); setError(''); }, []);
  const toggleShowPass       = useCallback(() => setShowPass(p => !p), []);
  const toggleShowConf       = useCallback(() => setShowConf(p => !p), []);

  return (
    <div className="mgp-overlay">
      <div className="mgp-card" role="dialog" aria-modal="true" aria-labelledby="mgp-titulo">

        <div className="mgp-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22" />
          </svg>
          <span>Healthy Help</span>
        </div>

        <div className="mgp-icono-google">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Cuenta de Google detectada</span>
        </div>

        <h2 id="mgp-titulo">Crea tu contraseña</h2>

        <p className="mgp-descripcion">
          Tu cuenta fue creada con Google. Establece una contraseña para poder iniciar sesión también con tu correo y contraseña.
        </p>

        <div className="mgp-form">
          <div className="mgp-requisitos">
            <p className="req-titulo">La contraseña debe tener:</p>
            <ul>
              <li className={requisitos.longitud  ? 'req-ok' : ''}><CheckIcon />Mínimo 8 caracteres</li>
              <li className={requisitos.minuscula ? 'req-ok' : ''}><CheckIcon />Una letra minúscula</li>
              <li className={requisitos.mayuscula ? 'req-ok' : ''}><CheckIcon />Una letra mayúscula</li>
              <li className={requisitos.numero    ? 'req-ok' : ''}><CheckIcon />Un número</li>
            </ul>
          </div>

          <div className="mgp-input-group">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={pass}
              onChange={handlePassChange}
              onKeyDown={handleKeyDown}
              className={error && !pass ? 'mgp-input-error' : ''}
              disabled={loading}
              autoFocus
            />
            <button type="button" className="mgp-eye" onClick={toggleShowPass} tabIndex={-1}>
              <EyeIcon open={showPass} />
            </button>
          </div>

          <div className="mgp-input-group">
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              value={passConf}
              onChange={handlePassConfChange}
              onKeyDown={handleKeyDown}
              className={error && pass !== passConf ? 'mgp-input-error' : ''}
              disabled={loading}
            />
            <button type="button" className="mgp-eye" onClick={toggleShowConf} tabIndex={-1}>
              <EyeIcon open={showConf} />
            </button>
          </div>

          {error && <span className="mgp-error">{error}</span>}

          <button className="mgp-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : 'Crear contraseña'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGooglePassword;