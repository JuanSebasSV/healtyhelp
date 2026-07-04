import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import TarjetaReceta from '../recipe/TarjetaReceta';
import { generarPDFRecetas } from '../../utils/generarPDF';
import useFiltroSalud from '../../hooks/useFiltroSalud';
import useAuth from '../../hooks/useAuth';
import FiltrosSalud from './FiltrosSalud';
import { recetaEsSegura } from '../../utils/sinonimosIngredientes';
import './VistaInicio.css';


const HERO_IMGS = [
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031315/ensalada_fs6t5u.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031325/mani_y_frutas_ldhsqc.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031316/pechuga_tfpvfm.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031326/ajo_e0n3fy.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031316/variedad_de_comida_ecokui.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031319/verduras_gbvs6u.webp',
];

const normalizarTexto = (texto) =>
  texto ? texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

const VistaInicio = ({
  recetas,
  cargandoRecetas,
  toggleFav,
  favoritos,
  usuario,
  onFiltrosCambiados,
  recetaPendiente,
  onRecetaPendienteResuelta,
}) => {
  const { loading: authLoading } = useAuth();
  const {
    filtros, toggleFiltro,
    categoria, setCategoria, limpiarCategoria, limpiarTodo, listo,
    filtroTiempo, cambiarFiltroTiempo, limpiarTiempo, alergia,
  } = useFiltroSalud(usuario, authLoading);

  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [imagenActual,  setImagenActual]  = useState(0);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [generandoPDF,  setGenerandoPDF]  = useState(false);
  const [isDragging,    setIsDragging]    = useState(false);
  const [busqueda,      setBusqueda]      = useState('');

  const thumbRef        = useRef(null);
  const trackRef        = useRef(null);
  const dragStartY      = useRef(0);
  const dragStartScroll = useRef(0);
  const transitandoRef  = useRef(false);
  const intervaloRef    = useRef(null);
  const imagenActualRef = useRef(0);

  useEffect(() => { imagenActualRef.current = imagenActual; }, [imagenActual]);

  useEffect(() => {
    let preloadLink = null;
    const id = (window.requestIdleCallback || ((cb) => setTimeout(cb, 1)))(() => {
      preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = HERO_IMGS[0];
      preloadLink.setAttribute('fetchpriority', 'high');
      document.head.appendChild(preloadLink);
      HERO_IMGS.slice(1).forEach(src => { const img = new Image(); img.src = src; });
    });
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
      if (preloadLink && preloadLink.parentNode) {
        preloadLink.parentNode.removeChild(preloadLink);
      }
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let targetPct = 0;
    let currentPct = 0;
    const tick = () => {
      raf = 0;
      currentPct += (targetPct - currentPct) * 0.4;
      if (Math.abs(targetPct - currentPct) < 0.0005) currentPct = targetPct;
      trackRef.current?.style.setProperty('--scroll-pct', currentPct);
      if (currentPct !== targetPct) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetPct = max > 0 ? window.scrollY / max : 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    let rafId = 0;
    let target = dragStartScroll.current;
    const STEP_MAX = 28;
    const tick = () => {
      rafId = 0;
      const maxScr = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScr <= 0) return;
      const cur = window.scrollY;
      const diff = target - cur;
      if (Math.abs(diff) < 1) return;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), STEP_MAX);
      window.scrollTo({ top: Math.round(cur + step), behavior: 'instant' });
      rafId = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      const trackH = window.innerHeight * 0.6;
      const thumbH = trackH * 0.3;
      const maxTop = trackH - thumbH;
      const track = ((e.clientY - dragStartY.current) / maxTop) * 0.55;
      const maxScr = document.documentElement.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(maxScr, dragStartScroll.current + track * maxScr));
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    const onUp = () => {
      setIsDragging(false);
      cancelAnimationFrame(rafId);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(rafId);
    };
  }, [isDragging]);

  const pendienteId = useMemo(() => {
    if (!recetaPendiente) return null;
    return recetaPendiente.recetaId ?? recetaPendiente;
  }, [recetaPendiente]);

  const cambiarImagen = useCallback((idx) => {
    if (transitandoRef.current) return;
    const nuevo = (idx + HERO_IMGS.length) % HERO_IMGS.length;
    if (nuevo === imagenActualRef.current) return;
    transitandoRef.current = true;
    setImagenActual(nuevo);
    setTimeout(() => { transitandoRef.current = false; }, 900);
  }, []);

  const iniciarIntervalo = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    intervaloRef.current = setInterval(() => {
      setImagenActual(p => (p + 1) % HERO_IMGS.length);
    }, 5000);
  }, []);

  useEffect(() => { iniciarIntervalo(); return () => clearInterval(intervaloRef.current); }, [iniciarIntervalo]);

  const cambiarManual = useCallback((idx) => {
    cambiarImagen(idx); iniciarIntervalo();
  }, [cambiarImagen, iniciarIntervalo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  cambiarManual(imagenActualRef.current - 1);
      if (e.key === 'ArrowRight') cambiarManual(imagenActualRef.current + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cambiarManual]);

  const toggleSeleccion = useCallback((id) =>
    setSeleccionadas(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  , []);

  const handleAbrirFiltro  = useCallback(() => setFiltroAbierto(true),  []);
  const handleCerrarFiltro = useCallback(() => setFiltroAbierto(false), []);

  const handlePDF = async () => {
    if (!seleccionadas.length) return;
    setGenerandoPDF(true);
    try {
      await generarPDFRecetas(recetas.filter(r => seleccionadas.includes(r._id)));
      setSeleccionadas([]);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleToggleFiltro = useCallback((id) => {
    toggleFiltro(id); onFiltrosCambiados?.();
  }, [toggleFiltro, onFiltrosCambiados]);

  const handleLimpiarTodo = useCallback(() => {
    limpiarTodo(); onFiltrosCambiados?.();
  }, [limpiarTodo, onFiltrosCambiados]);

  const handleCategoria = useCallback((catId) => {
    if (catId === 'todas') { limpiarCategoria(); } else { setCategoria(catId); }
    onFiltrosCambiados?.();
  }, [setCategoria, limpiarCategoria, onFiltrosCambiados]);

  const handleFiltroTiempo = useCallback((id) => {
    cambiarFiltroTiempo(id);
  }, [cambiarFiltroTiempo]);

  const recetasFiltradas = useMemo(() => recetas.filter(r => {
    const okCat   = !categoria || r.cat === categoria;
    const okSalud = filtros.length === 0 || filtros.every(f => (r.salud || []).includes(f));
    const busquedaLimpia = normalizarTexto(busqueda);
    const okBusqueda = busqueda.trim() === '' ||
      normalizarTexto(r.nombre || '').includes(busquedaLimpia) ||
      normalizarTexto(r.desc   || '').includes(busquedaLimpia);
    const t = r.tiempoMinutos || 0;
    const okTiempo = !filtroTiempo ? true :
      filtroTiempo === 'menos15' ? (t > 0 && t < 15) :
      filtroTiempo === '15a30'   ? (t >= 15 && t <= 30) :
      filtroTiempo === 'mas30'   ? (t > 30) : true;

      const okAlergia = (() => {
        if (!alergia || !alergia.trim()) return true;
        const palabrasAlergia = alergia
          .split(',')
          .map(a => normalizarTexto(a.trim()))
          .filter(Boolean);
        if (palabrasAlergia.length === 0) return true;
        const textoReceta = normalizarTexto(
          [
            r.nombre || '',
            r.desc || '',
            ...(r.ingredientes || []),
          ].join(' ')
        );
        return recetaEsSegura(textoReceta, palabrasAlergia);
      })();
    
    return okCat && okSalud && okBusqueda && okTiempo && okAlergia;
  }), [recetas, categoria, filtros, busqueda, filtroTiempo, alergia,]);

  return (
    <div className="vistaInicio">

      <div className="hero">
        {HERO_IMGS.map((img, i) => (
          <div key={i} className={`hero-capa ${i === imagenActual ? 'hero-capa--activa' : ''}`}
            style={{ backgroundImage: `url('${img}')` }} />
        ))}
        <div className="hero-gradiente" />
        <div className="hero-texto">
          <span className="hero-tag">🌿 Tu dieta, tu salud</span>
          <h1>Sabemos que llevar una dieta especial puede ser un reto, pero no tienes que hacerlo solo.</h1>
          <p>Aquí te ofrecemos recetas pensadas para ti, con ingredientes fáciles de conseguir y preparaciones sencillas pero exquisitas.</p>
          <div className="hero-linea" />
        </div>
        <div className="hero-dots">
          {HERO_IMGS.map((_, i) => (
            <button key={i} className={`hero-dot ${i === imagenActual ? 'activo' : ''}`}
              onClick={() => cambiarManual(i)} />
          ))}
        </div>
      </div>

      <FiltrosSalud
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        resultadosBusqueda={recetasFiltradas.length}
        categoria={categoria}
        onCategoria={handleCategoria}
        filtroTiempo={filtroTiempo}
        onFiltroTiempo={handleFiltroTiempo}
        onLimpiarTiempo={limpiarTiempo}
        filtros={filtros}
        onToggleFiltro={handleToggleFiltro}
        onLimpiarTodo={handleLimpiarTodo}
        listo={listo}
        filtroAbierto={filtroAbierto}
        onAbrirFiltro={handleAbrirFiltro}
        onCerrarFiltro={handleCerrarFiltro}
      />

      <section className="recetasGrid">
        <div className="recetasGrid-header">
          <h2>Explorar Recetas</h2>
          {seleccionadas.length > 0 && (
            <p className="pdf-hint">
              📄 {seleccionadas.length} receta{seleccionadas.length !== 1 ? 's' : ''} seleccionada{seleccionadas.length !== 1 ? 's' : ''} para PDF
            </p>
          )}
        </div>

        {cargandoRecetas ? (
          <div className="recetasCargando">
            <div className="spinner-recetas" />
            <p>Cargando recetas...</p>
          </div>
        ) : (
          <div className="grid">
            {recetasFiltradas.map(receta => {
              const esPendiente = !!pendienteId && (
                receta._id === pendienteId ||
                receta._id?.toString() === pendienteId?.toString()
              );
              return (
                <TarjetaReceta
                  key={esPendiente ? `${receta._id}-${recetaPendiente?._key ?? 0}` : receta._id}
                  receta={receta}
                  toggleFav={toggleFav}
                  esFav={favoritos.includes(receta._id)}
                  seleccionada={seleccionadas.includes(receta._id)}
                  onSeleccionar={toggleSeleccion}
                  autoAbrir={esPendiente}
                  resenaIdDestacada={esPendiente ? recetaPendiente?.resenaId : undefined}
                  respuestaIdDestacada={esPendiente ? recetaPendiente?.respuestaId : undefined}
                  pendienteKey={esPendiente ? recetaPendiente?._key : undefined}
                  onPendienteResuelta={esPendiente ? onRecetaPendienteResuelta : undefined}
                />
              );
            })}
          </div>
        )}

        {!cargandoRecetas && recetasFiltradas.length === 0 && (
          <p className="sinResultados">No hay recetas disponibles con estos filtros.</p>
        )}
      </section>

      {seleccionadas.length > 0 && (
        <button className="btn-pdf-flotante" onClick={handlePDF} disabled={generandoPDF}>
          {generandoPDF ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Generando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Descargar PDF ({seleccionadas.length})
            </>
          )}
        </button>
      )}

      <div className="scrollbar-custom-track" ref={trackRef}>
        <div
          ref={thumbRef}
          className={`scrollbar-custom-thumb${isDragging ? ' scrollbar-custom-thumb--dragging' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            dragStartY.current = e.clientY;
            dragStartScroll.current = window.scrollY;
          }}
        />
      </div>

    </div>
  );
};

export default VistaInicio;