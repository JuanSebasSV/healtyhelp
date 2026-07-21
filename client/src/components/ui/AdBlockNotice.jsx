import { useCallback, useEffect, useRef, useState } from 'react';
import './AdBlockNotice.css';

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

const BANNED_URLS = [
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  'https://pagead2.googlesyndication.com/pagead/show_ads.js',
  'https://www.googletagservices.com/tag/js/gpt.js',
  'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
];

const STORAGE_KEY = 'hh_adblock_notice_dismissed';
const DISMISS_HOURS = 6;

const detectAdBlock = () => {
  return new Promise((resolve) => {
    const run = () => {
      if (!document.body) {
        resolve(false);
        return;
      }

      let detected = false;

      try {
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

        document.body.appendChild(bait);

        setTimeout(() => {
          try {
            const cs = window.getComputedStyle(bait);
            const innerStyle = inner.style;
            const innerCs = window.getComputedStyle(inner);

            const baitBlocked =
              cs.display === 'none' ||
              cs.visibility === 'hidden' ||
              parseFloat(cs.opacity) === 0;

            const innerBlocked =
              innerStyle.display === 'none' ||
              innerCs.display === 'none' ||
              innerCs.visibility === 'hidden';

            const iframeBlocked = iframe.offsetHeight === 0;

            detected = baitBlocked || innerBlocked || iframeBlocked;

            if (!detected) {
              const ad = document.createElement('ins');
              ad.className = 'adsbygoogle';
              ad.style.display = 'block';
              ad.style.width = '1px';
              ad.style.height = '1px';
              document.body.appendChild(ad);
              setTimeout(() => {
                const adCs = window.getComputedStyle(ad);
                if (adCs.display === 'none' || ad.offsetHeight === 0) {
                  detected = true;
                }
                ad.parentNode?.removeChild(ad);
                bait.parentNode?.removeChild(bait);
                resolve(detected);
              }, 200);
            } else {
              bait.parentNode?.removeChild(bait);
              resolve(detected);
            }
          } catch {
            try { bait.parentNode?.removeChild(bait); } catch { /* ignore */ }
            resolve(false);
          }
        }, 200);
      } catch {
        resolve(false);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }
  });
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdBlockerDetected = (delay = 1500) => {
  const [detected, setDetected] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const result = await detectAdBlock();
        if (result) setDetected(true);
      } catch {
        // ignore
      } finally {
        setChecked(true);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [delay]);

  return { detected, checked };
};

const isDismissedRecently = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const AdBlockNotice = () => {
  const { detected, checked } = useAdBlockerDetected(2000);
  const [dismissed, setDismissed] = useState(isDismissedRecently);
  const [visible, setVisible] = useState(false);
  const closeRef = useRef(null);

  const handleDismiss = useCallback(() => {
    try { sessionStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* ignore */ }
    setDismissed(true);
    setVisible(false);
  }, []);

  useEffect(() => {
    if (detected && checked && !dismissed) {
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    }
    setVisible(false);
    return undefined;
  }, [detected, checked, dismissed]);

  useEffect(() => {
    if (!visible) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, handleDismiss]);

  if (!visible) return null;

  return (
    <div className="adblock-notice" role="alertdialog" aria-live="polite" aria-labelledby="adblock-title">
      <div className="adblock-card" data-modal="true">
        <div className="adblock-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            Si experimentás problemas con el inicio de sesión, el chatbot o las recetas,
            desactivalo para <strong>healthyhelpoficial.com</strong> en tu extensión
            y recargá la página.
          </p>
        </div>

        <div className="adblock-actions">
          <button
            ref={closeRef}
            type="button"
            className="adblock-btn adblock-btn--primary"
            onClick={handleDismiss}
          >
            Entendido
          </button>
        </div>

        <button
          type="button"
          className="adblock-close"
          onClick={handleDismiss}
          aria-label="Cerrar aviso"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AdBlockNotice;