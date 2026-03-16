import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './VerificarEmail.css';

const VerificarEmail = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const email = location.state?.email || '';
  const [codigo, setCodigo]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError]         = useState('');
  const inputs = useRef([]);

  // Redirigir si no hay email
  useEffect(() => {
    if (!email) navigate('/registro');
  }, [email, navigate]);

  // Countdown para reenviar
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const nuevo = [...codigo];
    nuevo[i] = val;
    setCodigo(nuevo);
    setError('');
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !codigo[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerificar();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const nuevo = [...codigo];
    texto.split('').forEach((c, i) => { nuevo[i] = c; });
    setCodigo(nuevo);
    inputs.current[Math.min(texto.length, 5)]?.focus();
  };

  const handleVerificar = async () => {
    const code = codigo.join('');
    if (code.length < 6) {
      setError('Ingresa los 6 dígitos del código');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-email', { email, code });
      if (data.token) {
        localStorage.setItem('token', data.token);
        toast.success('¡Cuenta verificada! Bienvenido.');
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido o expirado');
      setCodigo(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setReenviando(true);
    try {
      await api.post('/auth/resend-code', { email });
      toast.success('Código reenviado a tu correo');
      setCountdown(60);
      setCodigo(['', '', '', '', '', '']);
      setError('');
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al reenviar');
    } finally {
      setReenviando(false);
    }
  };

  const emailOculto = email
    ? email.replace(/(.{2}).+(@.+)/, '$1***$2')
    : '';

  return (
    <div className="verificar-pagina">
      <div className="verificar-card">

        {/* Icono */}
        <div className="verificar-icono">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>

        <h2 className="verificar-titulo">Verifica tu correo</h2>
        <p className="verificar-desc">
          Enviamos un código de 6 dígitos a<br/>
          <strong>{emailOculto}</strong>
        </p>

        {/* Campos de código */}
        <div className="verificar-campos">
          {codigo.map((d, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              className={`verificar-digito ${error ? 'verificar-digito--error' : ''} ${d ? 'verificar-digito--lleno' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="verificar-error">{error}</p>}

        <button
          className="verificar-btn"
          onClick={handleVerificar}
          disabled={loading || codigo.join('').length < 6}
        >
          {loading ? (
            <span className="verificar-spinner" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Verificar cuenta
            </>
          )}
        </button>

        <div className="verificar-reenviar">
          <span>¿No recibiste el código?</span>
          {countdown > 0 ? (
            <span className="verificar-countdown">Reenviar en {countdown}s</span>
          ) : (
            <button
              className="verificar-btn-reenviar"
              onClick={handleReenviar}
              disabled={reenviando}
            >
              {reenviando ? 'Enviando...' : 'Reenviar código'}
            </button>
          )}
        </div>

        <button className="verificar-volver" onClick={() => navigate('/registro')}>
          ← Volver al registro
        </button>

      </div>
    </div>
  );
};

export default VerificarEmail;