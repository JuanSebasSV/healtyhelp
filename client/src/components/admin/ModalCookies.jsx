import { useState, useEffect } from 'react';
import './ModalCookies.css';

const COOKIE_KEY = 'hh_cookie_consent';
const COOKIE_AGE = 60 * 60 * 24 * 365;

const setCookie = (name, value, maxAge = COOKIE_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const ModalCookies = ({ onAceptar }) => {
  const [visible,  setVisible]  = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const aceptar = () => {
    setSaliendo(true);
    setCookie(COOKIE_KEY, 'accepted');
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setTimeout(() => onAceptar(), 400);
  };

  const rechazar = () => {
    setSaliendo(true);
    setTimeout(() => {
      window.location.href = 'about:blank';
    }, 400);
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
          <h3>Cookies necesarias</h3>
          <p>
            Healthy Help <strong>requiere cookies funcionales</strong> para operar correctamente.
            Las usamos para recordar tus preferencias de dieta, el estado de los Términos y
            Condiciones, y tu sesión. <strong>Sin ellas la aplicación no puede funcionar.</strong>
          </p>
          <p className="cookies-aviso-critico">
            Si rechazas o cierras este aviso serás redirigido fuera de la aplicación.
          </p>
        </div>

        <div className="cookies-acciones">
          <button className="cookies-btn-aceptar" onClick={aceptar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Aceptar y continuar
          </button>
          <button className="cookies-btn-rechazar" onClick={rechazar}>
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCookies;