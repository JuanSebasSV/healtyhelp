import { useEffect, useState } from 'react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import useModalLayerHint from '../../hooks/useModalLayerHint';
import ModalShell from '../ui/ModalShell';
import './ModalCookies.css';

const COOKIE_KEY = 'hh_cookie_consent';
const COOKIE_AGE = 60 * 60 * 24 * 365;

const setCookie = (name, value, maxAge = COOKIE_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const ModalCookies = ({ onAceptar }) => {
  useBodyScrollLock(true);
  useModalLayerHint(true);
  const [visible,  setVisible]  = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const aceptar = () => {
    if (saliendo) return;
    setSaliendo(true);
    setCookie(COOKIE_KEY, 'accepted');
    try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch { /* ignore */ }
    try { sessionStorage.removeItem(COOKIE_KEY); } catch { /* ignore */ }
    setTimeout(() => onAceptar(), 400);
  };

  const rechazar = () => {
    if (saliendo) return;
    setSaliendo(true);
    setTimeout(() => {
      window.location.href = '/cookies-necesarias.html';
    }, 400);
  };

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        aceptar();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, saliendo]);

  return (
    <ModalShell open={visible} label="Aviso de cookies">
      <div className={`hh-consent ${saliendo ? 'hh-consent--leaving' : ''}`}>
        <div className="hh-consent__glow" />

        <div className="hh-consent__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
          </svg>
        </div>

        <div className="hh-consent__content">
          <h3>Cookies necesarias</h3>
          <p>
            Healthy Help <strong>requiere cookies funcionales</strong> para operar correctamente.
            Las usamos para recordar tus preferencias de dieta, el estado de los Términos y
            Condiciones, y tu sesión. <strong>Sin ellas la aplicación no puede funcionar.</strong>
          </p>
          <p className="hh-consent__warning">
            Si rechazas o cierras este aviso serás redirigido fuera de la aplicación.
          </p>
        </div>

        <div className="hh-consent__actions">
          <button type="button" className="hh-consent__btn hh-consent__btn--primary" onClick={aceptar} autoFocus>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Aceptar y continuar
          </button>
          <button type="button" className="hh-consent__btn hh-consent__btn--ghost" onClick={rechazar}>
            Salir
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ModalCookies;