import { useState, useEffect, useRef, useCallback } from 'react';

export const useCarousel = (images, intervalMs = 5000) => {
  const [imagenActual, setImagenActual] = useState(0);
  const transitandoRef = useRef(false);
  const intervaloRef = useRef(null);
  const imagenActualRef = useRef(0);

  useEffect(() => { imagenActualRef.current = imagenActual; }, [imagenActual]);

  useEffect(() => {
    let preloadLink = null;
    const id = (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)))(() => {
      preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = images[0];
      preloadLink.setAttribute('fetchpriority', 'high');
      document.head.appendChild(preloadLink);
      images.slice(1).forEach(src => { const img = new Image(); img.src = src; });
    });
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
      if (preloadLink && preloadLink.parentNode) {
        preloadLink.parentNode.removeChild(preloadLink);
      }
    };
  }, [images]);

  const cambiarImagen = useCallback((idx) => {
    if (transitandoRef.current) return;
    const nuevo = (idx + images.length) % images.length;
    if (nuevo === imagenActualRef.current) return;
    transitandoRef.current = true;
    setImagenActual(nuevo);
    setTimeout(() => { transitandoRef.current = false; }, 900);
  }, [images.length]);

  const iniciarIntervalo = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setImagenActual(p => (p + 1) % images.length);
    }, intervalMs);
  }, [images.length, intervalMs]);

  useEffect(() => { iniciarIntervalo(); return () => clearInterval(intervaloRef.current); }, [iniciarIntervalo]);

  const cambiarManual = useCallback((idx) => {
    cambiarImagen(idx); iniciarIntervalo();
  }, [cambiarImagen, iniciarIntervalo]);

  return { imagenActual, cambiarManual };
};
