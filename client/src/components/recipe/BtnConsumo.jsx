import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { getTipoPorHora } from '../../utils/bogotaTime';
import './BtnConsumo.css';

const TOOLTIP_KEY = 'consumo_tooltip_visto';
const MAX_TOOLTIP  = 5;

const getTooltipCount  = () => parseInt(sessionStorage.getItem(TOOLTIP_KEY) || '0', 10);
const incrementTooltip = () => sessionStorage.setItem(TOOLTIP_KEY, String(getTooltipCount() + 1));

const TIPO_EMOJIS = { desayuno: '🌅', almuerzo: '☀️', cena: '🌙' };

//Iconos memoizados 
const IcoCheck = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
));
IcoCheck.displayName = 'IcoCheck';

const IcoPlus = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
));
IcoPlus.displayName = 'IcoPlus';

const IcoCerrar = memo(() => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
));
IcoCerrar.displayName = 'IcoCerrar';

//BtnConsumo 
const BtnConsumo = ({ recetaId }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [consumoId,  setConsumoId]  = useState(null);
  const [tipoActual, setTipoActual] = useState(null);
  const [cargando,   setCargando]   = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [tooltip,    setTooltip]    = useState(false);
  const [señalar,    setSeñalar]    = useState(false);

  const wrapperRef  = useRef(null);
  const tooltipRef  = useRef(null);
  const observerRef = useRef(null);
  const yaMostroRef = useRef(false);

  /*Cargar estado inicial*/
  useEffect(() => {
    if (!isAuthenticated) { setCargando(false); return; }

    let cancelled = false;

    api.get(`/consumos/receta/${recetaId}/hoy`)
      .then(({ data }) => {
        if (cancelled) return;
        if (data.registrado) {
          setConsumoId(data.consumoId);
          setTipoActual(data.tipo);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCargando(false); });

    return () => { cancelled = true; };
  }, [recetaId, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || cargando || consumoId) return;
    if (getTooltipCount() >= MAX_TOOLTIP) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !yaMostroRef.current) {
          yaMostroRef.current = true;
          setSeñalar(true);
          setTooltip(true);
          incrementTooltip();
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.8 }
    );

    if (wrapperRef.current) observerRef.current.observe(wrapperRef.current);
    return () => observerRef.current?.disconnect();
  }, [isAuthenticated, cargando, consumoId]);

  /* Quitar animación de señalado después de 2.2 s */
  useEffect(() => {
    if (!señalar) return;
    const t = setTimeout(() => setSeñalar(false), 2200);
    return () => clearTimeout(t);
  }, [señalar]);

  /* Cerrar tooltip al hacer clic fuera */
  useEffect(() => {
    if (!tooltip) return;
    const handler = (e) => {
      if (
        tooltipRef.current  && !tooltipRef.current.contains(e.target) &&
        wrapperRef.current  && !wrapperRef.current.contains(e.target)
      ) setTooltip(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [tooltip]);

  const handleRegistrar = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info('Inicia sesión para registrar tu consumo');
      navigate('/login');
      return;
    }
    setTooltip(false);
    setProcesando(true);
    try {
      if (consumoId) {
        await api.delete(`/consumos/${consumoId}`);
        setConsumoId(null);
        setTipoActual(null);
        toast.success('Consumo cancelado');
      } else {
        const { data } = await api.post(`/consumos/${recetaId}`);
        setConsumoId(data.consumo._id);
        setTipoActual(data.consumo.tipo);
        toast.success(`✅ Registrado como ${data.consumo.tipo}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrar');
    } finally {
      setProcesando(false);
    }
  }, [isAuthenticated, navigate, consumoId, recetaId]);

  const handleVerTooltip = useCallback((e) => {
    e.stopPropagation();
    setSeñalar(true);
    setTooltip(v => !v);
  }, []);

  const handleCerrarTooltip = useCallback(() => setTooltip(false), []);

  if (cargando) return null;

  const registrado = !!consumoId;
  const tipoBogota = getTipoPorHora();

  return (
    <div className="btnConsumo-wrapper" ref={wrapperRef}>

      {tooltip && (
        <div className="btnConsumo-tooltip" ref={tooltipRef}>
          <button
            className="btnConsumo-tooltip-cerrar"
            onClick={handleCerrarTooltip}
            aria-label="Cerrar"
          >
            <IcoCerrar />
          </button>
          <p>
            <strong>¿Preparaste o comiste esta receta hoy?</strong> Pulsa el botón
            de abajo para registrarla en tu diario. La app detecta la hora y la
            guarda automáticamente
            como <strong>{TIPO_EMOJIS[tipoBogota]} {tipoBogota}</strong>.
          </p>
          <p>
            Solo puedes guardar <strong>una receta por comida</strong> (desayuno,
            almuerzo o cena). En <strong>Seguimiento</strong> verás todo lo que
            comiste cada día con su resumen nutricional completo.
          </p>
          <div className="btnConsumo-tooltip-cola" />
        </div>
      )}

      <div className="btnConsumo-row">
        <button
          className={`btnConsumo${registrado ? ' btnConsumo--registrado' : ''}${señalar ? ' btnConsumo--señalar' : ''}`}
          onClick={handleRegistrar}
          disabled={procesando}
        >
          {procesando ? (
            <span className="btnConsumo-spinner" />
          ) : registrado ? (
            <>
              <IcoCheck />
              {TIPO_EMOJIS[tipoActual]} Registrado · Cancelar
            </>
          ) : (
            <>
              <IcoPlus />
              Registrar consumo
            </>
          )}
        </button>

        {!registrado && (
          <button
            className="btnConsumo-help"
            onClick={handleVerTooltip}
            aria-label="¿Qué es esto?"
            title="¿Qué es esto?"
          >?</button>
        )}
      </div>

    </div>
  );
};

export default memo(BtnConsumo);