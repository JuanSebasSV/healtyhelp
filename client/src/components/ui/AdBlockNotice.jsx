import { useCallback, useEffect, useRef, useState } from 'react';
import './AdBlockNotice.css';

const STORAGE_KEY = 'hh_adblock_dismissed_forever';

const BAIT_CLASSES = [
  'adsbox',
  'ad-banner',
  'ad-container',
  'ad-placement',
  'ad-wrapper',
  'ad-slot',
  'adsbygoogle',
];

const BAIT_IDS = [
  'ad-banner',
  'ad-container',
  'ad-placement',
  'google_ads_iframe',
];

const BANNED_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const CONTROL_URL = '/favicon.ico';

const scheduleIdle = (cb, timeout = 4000) => {
  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(cb, { timeout });
  }
  return setTimeout(cb, 1500);
};

const cancelIdle = (handle) => {
  if (typeof window.cancelIdleCallback === 'function' && typeof handle === 'number') {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
};

const detectViaDOM = () => {
  if (!document.body) return false;

  const bait = document.createElement('div');
  bait.className = BAIT_CLASSES.join(' ');
  bait.id = BAIT_IDS.join(' ');
  bait.setAttribute('aria-hidden', 'true');
  bait.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;display:block;visibility:visible;opacity:1;pointer-events:auto;';

  const inner = document.createElement('div');
  inner.className = 'ad ads ad-banner';
  inner.innerHTML = '&nbsp;';
  bait.appendChild(inner);

  const iframe = document.createElement('iframe');
  iframe.id = 'ad-iframe';
  iframe.name = 'google_ads_iframe';
  iframe.src = 'about:blank';
  iframe.style.cssText = 'width:1px;height:1px;display:block;visibility:visible;';
  bait.appendChild(iframe);

  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.cssText = 'display:block;width:1px;height:1px;';
  bait.appendChild(ins);

  document.body.appendChild(bait);

  let blocked = false;

  try {
    const baitCs = window.getComputedStyle(bait);
    const innerStyle = inner.style;
    const innerCs = window.getComputedStyle(inner);
    const insCs = window.getComputedStyle(ins);

    blocked =
      baitCs.display === 'none' ||
      baitCs.visibility === 'hidden' ||
      parseFloat(baitCs.opacity) === 0 ||
      innerStyle.display === 'none' ||
      innerCs.display === 'none' ||
      innerCs.visibility === 'hidden' ||
      insCs.display === 'none' ||
      iframe.offsetHeight === 0;
  } catch {
    blocked = false;
  } finally {
    bait.parentNode?.removeChild(bait);
  }

  return blocked;
};

const probeUrl = (url, timeoutMs = 1500) => {
  return new Promise((resolve) => {
    let settled = false;
    const startTime = Date.now();
    const finish = (result, ms) => {
      if (settled) return;
      settled = true;
      resolve({ result, ms });
    };

    const img = new Image();
    const timer = setTimeout(() => finish('timeout', Date.now() - startTime), timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      finish('loaded', Date.now() - startTime);
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish('error', Date.now() - startTime);
    };

    img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  });
};

const detectViaNetwork = async () => {
  const [banned, control] = await Promise.all([
    probeUrl(BANNED_URL, 1500),
    probeUrl(CONTROL_URL, 1500),
  ]);

  if (banned.result !== 'error') return false;

  if (control.result === 'error' || control.result === 'loaded') {
    const ratio = banned.ms / Math.max(control.ms, 1);
    if (ratio < 0.4 && banned.ms < 200) return true;
  }

  if (banned.ms < 50) return true;

  return false;
};

const detectAdBlock = async () => {
  const domBlocked = detectViaDOM();
  if (domBlocked) return true;

  try {
    const networkBlocked = await detectViaNetwork();
    if (networkBlocked === true) return true;
  } catch {
    /* ignore */
  }

  return false;
};

const useAdBlockerDetected = (delay = 1500) => {
  const [detected, setDetected] = useState(false);
  const [checked, setChecked] = useState(false);
  const [version, setVersion] = useState(0);

  const recheck = useCallback(() => {
    setChecked(false);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let idleHandle = null;

    const run = async () => {
      try {
        const result = await detectAdBlock();
        if (!cancelled) setDetected(!!result);
      } catch {
        if (!cancelled) setDetected(false);
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    if (typeof document !== 'undefined' && document.readyState === 'loading') {
      const onReady = () => {
        idleHandle = scheduleIdle(run, 4000);
      };
      document.addEventListener('DOMContentLoaded', onReady, { once: true });
      return () => {
        cancelled = true;
        document.removeEventListener('DOMContentLoaded', onReady);
        if (idleHandle !== null) cancelIdle(idleHandle);
      };
    }

    idleHandle = scheduleIdle(run, 4000);
    return () => {
      cancelled = true;
      if (idleHandle !== null) cancelIdle(idleHandle);
    };
  }, [delay, version]);

  return { detected, checked, recheck };
};

const isDismissedForever = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

const AdBlockNotice = () => {
  const { detected, checked, recheck } = useAdBlockerDetected(2000);
  const [visible, setVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [hideUntilReload, setHideUntilReload] = useState(false);
  const [dismissedForever] = useState(isDismissedForever);
  const closeRef = useRef(null);

  const handleCloseUntilReload = useCallback(() => {
    setHideUntilReload(true);
    setVisible(false);
  }, []);

  const handleRetry = useCallback(() => {
    setVerifying(true);
    recheck();
    setTimeout(() => setVerifying(false), 1500);
  }, [recheck]);

  const handleDismissForever = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ignore */ }
    setVerified(true);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (dismissedForever) {
      setVisible(false);
      return undefined;
    }
    if (detected && checked && !verified && !hideUntilReload) {
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    }
    setVisible(false);
    return undefined;
  }, [detected, checked, verified, hideUntilReload, dismissedForever]);

  useEffect(() => {
    if (!visible) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') handleCloseUntilReload();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, handleCloseUntilReload]);

  useEffect(() => {
    if (detected || !checked) setVerified(false);
  }, [detected, checked]);

  if (!visible) return null;

  return (
    <div className="adblock-notice" role="alertdialog" aria-live="polite" aria-labelledby="adblock-title">
      <div className="adblock-card" data-modal="true">
        <button
          type="button"
          className="adblock-close"
          onClick={handleCloseUntilReload}
          aria-label="Cerrar aviso"
          tabIndex={-1}
          title="Cerrar (volverá a aparecer al recargar)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="adblock-header">
          <div className="adblock-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
          </div>

          <div className="adblock-content">
            <h3 id="adblock-title" className="adblock-title">Detectamos un bloqueador de anuncios</h3>
            <p className="adblock-message">
              Para que <strong>Healthy Help</strong> funcione correctamente necesitamos
              cargar algunos recursos que extensiones como{' '}
              <strong>uBlock Origin</strong>, <strong>AdBlock</strong>,{' '}
              <strong>Brave Shields</strong> o similares pueden estar bloqueando.
            </p>
            <p className="adblock-detail">
              Desactivalo para <strong>healthyhelpoficial.com</strong> en tu extensión
              y volvé a comprobar. Si seguís viendo este aviso, revisá otras extensiones
              como bloqueadores de privacidad, antivirus o filtros corporativos.
            </p>
          </div>
        </div>

        <div className="adblock-actions">
          <button
            ref={closeRef}
            type="button"
            className="adblock-btn adblock-btn--primary"
            onClick={handleRetry}
            disabled={verifying}
          >
            {verifying ? 'Comprobando...' : 'Volver a comprobar'}
          </button>
          <button
            type="button"
            className="adblock-btn adblock-btn--ghost"
            onClick={handleDismissForever}
            disabled={verifying}
          >
            No mostrar más
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBlockNotice;