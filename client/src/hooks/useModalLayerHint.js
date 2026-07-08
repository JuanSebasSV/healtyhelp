import { useEffect } from 'react';

const ATTR = 'data-hh-modal-layer';

const useModalLayerHint = (isOpen) => {
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined;
    document.body.setAttribute(ATTR, '1');
    return () => {
      if (document.body.getAttribute(ATTR) === '1') {
        document.body.removeAttribute(ATTR);
      }
    };
  }, [isOpen]);
};

export default useModalLayerHint;
