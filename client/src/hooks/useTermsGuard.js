// hooks/useTermsGuard.js
// Orquesta:
//   1. Ventana de cookies (necesaria para que la persistencia funcione)
//   2. Modal de Términos y Condiciones
//
// Funciona para los 3 casos:
//   - Usuarios con cuenta Google / registro normal  → persiste en BD + cookie/localStorage
//   - Usuarios sin cuenta                           → persiste en cookie + localStorage
//
// La combinación cookie + localStorage garantiza que Ctrl+Shift+R
// (hard reload) no borre el estado, porque las cookies NO se borran
// con un hard reload del navegador (sí lo haría sessionStorage).

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

//  Helpers de cookie 

export const COOKIE_CONSENT_KEY = 'hh_cookie_consent';
export const TERMS_ACCEPTED_KEY = 'hh_terms_accepted';
export const TERMS_VERSION_KEY  = 'hh_terms_version';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setCookie = (name, value, maxAge = COOKIE_MAX_AGE) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

// Lee del lugar más confiable: primero cookie, luego localStorage
export const getPersistedValue = (key) => {
  return getCookie(key) || localStorage.getItem(key) || null;
};

// Escribe en ambos lugares para máxima durabilidad
export const setPersisted = (key, value) => {
  setCookie(key, value);
  localStorage.setItem(key, value);
};

//  Hook principal 

/**
 * @param {object|null} user   — el usuario autenticado (o null si no hay sesión)
 * @param {string} activeTermsVersion — versión activa de los términos (viene del servidor)
 */
const useTermsGuard = (user, activeTermsVersion) => {
  // Estado de la UI
  const [showCookieModal,  setShowCookieModal]  = useState(false);
  const [showTermsModal,   setShowTermsModal]   = useState(false);
  const [cookiesReady,     setCookiesReady]     = useState(false);
  const [esActualizacion,  setEsActualizacion]  = useState(false);

  //  Paso 1: decidir si mostrar el banner de cookies 
  useEffect(() => {
    const cookieConsent = getPersistedValue(COOKIE_CONSENT_KEY);
    if (cookieConsent === 'accepted') {
      setCookiesReady(true);
    } else {
      setShowCookieModal(true);
    }
  }, []);

  //  Paso 2: cuando las cookies están listas, evaluar los términos 
  useEffect(() => {
    if (!cookiesReady || !activeTermsVersion) return;
    evaluarTerminos();
  }, [cookiesReady, activeTermsVersion, user]);

  const evaluarTerminos = useCallback(() => {
    if (!activeTermsVersion) return;

    if (user) {
      //  Usuario autenticado: la fuente de verdad es la BD 
      // El objeto `user` debe incluir `termsAccepted` y `termsVersion`
      if (!user.termsAccepted || user.termsVersion !== activeTermsVersion) {
        setEsActualizacion(
          !!user.termsAccepted && user.termsVersion !== activeTermsVersion
        );
        setShowTermsModal(true);
      } else {
        // Sincronizar también local por si el usuario limpia cookies
        setPersisted(TERMS_ACCEPTED_KEY, 'true');
        setPersisted(TERMS_VERSION_KEY, activeTermsVersion);
      }
    } else {
      //  Usuario anónimo: la fuente de verdad son cookies + localStorage 
      const localVersion  = getPersistedValue(TERMS_VERSION_KEY);
      const localAccepted = getPersistedValue(TERMS_ACCEPTED_KEY);

      if (localAccepted !== 'true' || localVersion !== activeTermsVersion) {
        setEsActualizacion(
          localAccepted === 'true' && localVersion !== activeTermsVersion
        );
        setShowTermsModal(true);
      }
    }
  }, [user, activeTermsVersion]);

  //  Handlers 

  const handleCookiesAceptadas = useCallback(() => {
    setPersisted(COOKIE_CONSENT_KEY, 'accepted');
    setShowCookieModal(false);
    setCookiesReady(true);
  }, []);

  /**
   * Llama a la API para marcar los términos como aceptados.
   * Si el usuario no tiene sesión, sólo persiste localmente.
   */
  const handleTermsAceptados = useCallback(async () => {
    // Persistir localmente siempre (sirve de caché y para usuarios anónimos)
    setPersisted(TERMS_ACCEPTED_KEY, 'true');
    setPersisted(TERMS_VERSION_KEY, activeTermsVersion);

    if (user) {
      // Persistir en BD
      try {
        await api.post('/auth/accept-terms', { version: activeTermsVersion });
      } catch (err) {
        console.error('Error guardando aceptación de términos en BD:', err);
        // No bloqueamos al usuario; la cookie/localStorage ya lo persiste.
      }
    }

    setShowTermsModal(false);
  }, [user, activeTermsVersion]);

  return {
    showCookieModal,
    showTermsModal,
    esActualizacion,
    handleCookiesAceptadas,
    handleTermsAceptados,
  };
};

export default useTermsGuard;
