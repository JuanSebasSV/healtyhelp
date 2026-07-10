import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import TarjetaReceta from '../recipe/TarjetaReceta';
import { generarPDFRecetas } from '../../utils/generarPDF';
import useFiltroSalud from '../../hooks/useFiltroSalud';
import useAuth from '../../hooks/useAuth';
import { useCarousel } from '../../hooks/useCarousel';
import FiltrosSalud from './FiltrosSalud';
import Hero, { HERO_IMGS } from './Hero';
import BtnPDF from './BtnPDF';
import RecetasGrid from './RecetasGrid';
import ScrollbarIndicator from './ScrollbarIndicator';
import { recetaEsSegura } from '../../utils/sinonimosIngredientes';
import './VistaInicio.css';


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
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [generandoPDF,  setGenerandoPDF]  = useState(false);
  const [isDragging,    setIsDragging]    = useState(false);
  const [busqueda,      setBusqueda]      = useState('');

  const { imagenActual, cambiarManual } = useCarousel(HERO_IMGS);

  const thumbRef        = useRef(null);
  const trackRef        = useRef(null);
  const dragStartY      = useRef(0);
  const dragStartScroll = useRef(0);

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
      if (thumbRef.current) {
        thumbRef.current.setAttribute('aria-valuenow', String(Math.round(targetPct * 100)));
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleThumbKeyDown = useCallback((e) => {
    const maxScr = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScr <= 0) return;
    let target;
    switch (e.key) {
      case 'ArrowUp':    target = window.scrollY - 60; break;
      case 'ArrowDown':  target = window.scrollY + 60; break;
      case 'PageUp':     target = window.scrollY - window.innerHeight * 0.85; break;
      case 'PageDown':   target = window.scrollY + window.innerHeight * 0.85; break;
      case 'Home':       target = 0; break;
      case 'End':        target = maxScr; break;
      default: return;
    }
    e.preventDefault();
    target = Math.max(0, Math.min(maxScr, target));
    window.scrollTo({ top: target, behavior: 'smooth' });
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  cambiarManual(imagenActual - 1);
      if (e.key === 'ArrowRight') cambiarManual(imagenActual + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cambiarManual, imagenActual]);

  const toggleSeleccion = useCallback((id) =>
    setSeleccionadas(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
  , []);

  const handleAbrirFiltro  = useCallback(() => setFiltroAbierto(true),  []);
  const handleCerrarFiltro = useCallback(() => setFiltroAbierto(false), []);

  const handlePDF = async () => {
    if (!seleccionadas.length) return;
    setGenerandoPDF(true);
    try {
      const selSet = new Set(seleccionadas);
      await generarPDFRecetas(recetas.filter(r => selSet.has(r._id)));
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

  const favoritosSet = useMemo(() => new Set(favoritos), [favoritos]);
  const seleccionadasSet = useMemo(() => new Set(seleccionadas), [seleccionadas]);

  const recetasFiltradas = useMemo(() => recetas.filter(r => {
    const okCat   = !categoria || r.cat === categoria;
    const saludArr = Array.isArray(r.salud) ? r.salud : [];
    const saludSet = saludArr.length ? new Set(saludArr) : null;
    const okSalud  = filtros.length === 0 || (saludSet ? filtros.every(f => saludSet.has(f)) : true);
    const busquedaLimpia = normalizarTexto(busqueda);
    const textoRecetaBusq = normalizarTexto(`${r.nombre || ''} ${r.desc || ''}`);
    const okBusqueda = busqueda.trim() === '' || textoRecetaBusq.includes(busquedaLimpia);
    const t = r.tiempoMinutos || 0;
    const okTiempo = !filtroTiempo ? true :
      filtroTiempo === 'menos15' ? (t > 0 && t < 15) :
      filtroTiempo === '15a30'   ? (t >= 15 && t <= 30) :
      filtroTiempo === 'mas30'   ? (t > 30) : true;

      const okAlergia = (() => {
        if (!alergia || !alergia.trim()) return true;
        const palabrasAlergia = alergia.split(',').reduce((acc, a) => {
          const norm = normalizarTexto(a.trim());
          if (norm) acc.push(norm);
          return acc;
        }, []);
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

      <Hero imagenActual={imagenActual} onDotClick={cambiarManual} />

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

      <RecetasGrid
        recetasFiltradas={recetasFiltradas}
        cargandoRecetas={cargandoRecetas}
        toggleFav={toggleFav}
        favoritosSet={favoritosSet}
        seleccionadasSet={seleccionadasSet}
        toggleSeleccion={toggleSeleccion}
        pendienteId={pendienteId}
        recetaPendiente={recetaPendiente}
        onRecetaPendienteResuelta={onRecetaPendienteResuelta}
      />

      {seleccionadas.length > 0 && (
        <BtnPDF count={seleccionadas.length} generando={generandoPDF} onClick={handlePDF} />
      )}

      <ScrollbarIndicator
        trackRef={trackRef}
        thumbRef={thumbRef}
        isDragging={isDragging}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          dragStartY.current = e.clientY;
          dragStartScroll.current = window.scrollY;
        }}
        onKeyDown={handleThumbKeyDown}
      />

    </div>
  );
};

export default VistaInicio;