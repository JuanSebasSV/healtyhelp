import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PORTAL_ROOT_ID = 'hh-modal-root';
const PORTAL_Z = 2147483600;

const getPortalRoot = () => {
  if (typeof document === 'undefined') return null;
  let root = document.getElementById(PORTAL_ROOT_ID);
  if (root) return root;
  root = document.createElement('div');
  root.id = PORTAL_ROOT_ID;
  root.setAttribute('data-hh-portal', '1');
  document.body.appendChild(root);
  return root;
};

const ModalShell = ({ children, open = true, label = 'modal' }) => {
  const ref = useRef(null);
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    setPortalRoot(getPortalRoot());
  }, []);

  useEffect(() => {
    if (!open || !ref.current) return undefined;

    const node = ref.current;

    const enforceVisible = () => {
      if (!node || !node.isConnected) return;
      const cs = window.getComputedStyle(node);
      const r = node.getBoundingClientRect();
      const blocked =
        cs.display === 'none' ||
        cs.visibility === 'hidden' ||
        cs.opacity === '0' ||
        r.width === 0 ||
        r.height === 0;
      if (blocked) {
        node.style.setProperty('display', 'flex', 'important');
        node.style.setProperty('visibility', 'visible', 'important');
        node.style.setProperty('opacity', '1', 'important');
        node.style.setProperty('position', 'fixed', 'important');
        node.style.setProperty('inset', '0', 'important');
        node.style.setProperty('z-index', String(PORTAL_Z), 'important');
      }
    };

    const mo = new MutationObserver(enforceVisible);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: true,
    });
    mo.observe(node, { attributes: true, attributeFilter: ['style', 'class'] });

    const interval = setInterval(enforceVisible, 2000);

    enforceVisible();

    return () => {
      mo.disconnect();
      clearInterval(interval);
    };
  }, [open, portalRoot]);

  if (!open || !portalRoot || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      data-hh-modal="1"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: PORTAL_Z,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </div>,
    portalRoot,
  );
};

export default ModalShell;