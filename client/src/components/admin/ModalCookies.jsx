import { useState, useEffect } from 'react';
import './ModalCookies.css';

export const COOKIE_CONSENT_KEY = 'hh_cookie_consent';
export const COOKIE_MAX_AGE     = 60 * 60 * 24 * 365; // 1 año en segundos

/** Lee una cookie por nombre */
export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

/** Escribe una cookie persistente (sobrevive Ctrl+Shift+R) */
export const setCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const ModalCookies = ({ onAceptar, onRechazar }) => {
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    // Pequeño delay para que no aparezca antes que la página termine de pintar
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const aceptar = () => {
    setSaliendo(true);
    setCookie(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted'); // respaldo
    setTimeout(() => onAceptar(), 400);
  };

  const rechazar = () => {
    setSaliendo(true);
    setTimeout(() => onRechazar(), 400);
  };

  if (!visible) return null;

  return (
    <div className={`cookies-overlay ${saliendo ? 'saliendo' : ''}`}>
      <div className="cookies-card">
        <div className="cookies-glow" />

        <button className="cookies-btn-cerrar" onClick={rechazar} aria-label="Cerrar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="cookies-icon-wrap">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
          </svg>
        </div>

        <div className="cookies-texto">
          <h3>Usamos cookies</h3>
          <p>
            Healthy Help usa cookies esenciales para recordar tus preferencias y garantizar
            que no tengas que aceptar los Términos y Condiciones más de una vez.
            Sin cookies no podemos ofrecerte esa experiencia.
          </p>
        </div>

        <div className="cookies-acciones">
          <button className="cookies-btn-aceptar" onClick={aceptar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Aceptar cookies
          </button>
        </div>

        <p className="cookies-nota">
          Al continuar usando la app, aceptas implícitamente el uso de cookies funcionales.
        </p>
      </div>
    </div>
  );
};

export default ModalCookies;