import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import './PanelRecomendaciones.css';

// ─── Iconos ───────────────────────────────────────────────────────────────────

const IcoAlerta    = () => <svg viewBox="0 0 20 20" fill="none" className="rec-ico"><path d="M10 2L18.5 17H1.5L10 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><line x1="10" y1="8" x2="10" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="10" cy="14.5" r="0.8" fill="currentColor"/></svg>;
const IcoOk        = () => <svg viewBox="0 0 20 20" fill="none" className="rec-ico"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M6 10.5L8.5 13L14 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoInfo      = () => <svg viewBox="0 0 20 20" fill="none" className="rec-ico"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><line x1="10" y1="9" x2="10" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="10" cy="6.5" r="0.8" fill="currentColor"/></svg>;
const IcoComida    = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 10C4 6.69 6.69 4 10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoEjercicio = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><path d="M3 10h2l2-5 3 10 2-7 1.5 2H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoCalendario = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><rect x="2.5" y="4" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><line x1="2.5" y1="8" x2="17.5" y2="8" stroke="currentColor" strokeWidth="1.6"/><line x1="6.5" y1="2" x2="6.5" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><line x1="13.5" y1="2" x2="13.5" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoIMC       = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><path d="M3 16L8 9L12 12L16 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoReloj     = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoAgua      = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><path d="M10 3C10 3 4 9.5 4 13a6 6 0 0012 0c0-3.5-6-10-6-10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
const IcoHoy       = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6"/><line x1="10" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="10" y1="10" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
const IcoFuego     = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sec-ico"><path d="M10 17C6.5 17 4 14.5 4 11c0-4 3-6.5 4-9 0 2 1.5 3.5 3 4 0-2 1-4 2-5 1 3 3 4.5 3 7s-2 4-2 4c1-2 0-4-1-4.5C14 10 16 12 16 14c0 1.66-1.34 3-3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;

const IcoBulletPlato    = () => <svg viewBox="0 0 20 20" fill="none" className="rec-bullet-ico" aria-hidden="true"><path d="M7 2v4m0 0a2 2 0 004 0V2M9 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2c0 0 2 1.5 2 4s-2 4-2 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoBulletBolt     = () => <svg viewBox="0 0 20 20" fill="none" className="rec-bullet-ico" aria-hidden="true"><path d="M11.5 2.5L6 11h5.5l-3 6.5 8-9.5H11L11.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoBulletAlarm    = () => <svg viewBox="0 0 20 20" fill="none" className="rec-bullet-ico" aria-hidden="true"><circle cx="10" cy="11.5" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M10 8.5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 4l-2 2M14.5 4l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IcoSinFiltro      = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sin-ico" aria-hidden="true"><path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8.5 5v10M11.5 5v10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1 2" opacity=".4"/></svg>;
const IcoSinMancuerna   = () => <svg viewBox="0 0 20 20" fill="none" className="rec-sin-ico" aria-hidden="true"><path d="M2 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="1" y="7.5" width="2.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3.5" y="6" width="2" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14.5" y="6" width="2" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="16.5" y="7.5" width="2.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_NIVEL = { ok: 'verde', advertencia: 'amarillo', atencion: 'naranja', info: 'azul' };

const iconAlerta = (nivel) =>
  nivel === 'ok' ? <IcoOk /> : nivel === 'advertencia' ? <IcoAlerta /> : <IcoInfo />;

const LABEL_CATEGORIA = {
  desayuno:        'Desayuno',
  almuerzo:        'Almuerzo',
  cena:            'Cena',
  'postres-snacks': 'Postres & Snacks',
};

// ─── Barra de progreso calórico ───────────────────────────────────────────────

const BarraProgreso = ({ calHoy, calObjetivo, progreso }) => {
  const exceso    = progreso > 100;
  const pctBarra  = Math.min(progreso, 100);
  const restantes = calObjetivo ? Math.max(0, calObjetivo - calHoy) : 0;

  return (
    <div className="rec-progreso-wrap">
      <div className="rec-progreso-labels">
        <span className="rec-progreso-consumido">{calHoy} kcal consumidas</span>
        <span className={`rec-progreso-meta ${exceso ? 'rec-progreso-exceso' : ''}`}>
          {exceso ? `+${calHoy - calObjetivo} kcal extra` : `${restantes} kcal restantes`}
        </span>
      </div>
      <div className="rec-progreso-track">
        <div
          className={`rec-progreso-fill ${exceso ? 'rec-progreso-fill--exceso' : progreso >= 80 ? 'rec-progreso-fill--ok' : ''}`}
          style={{ width: `${pctBarra}%` }}
        />
      </div>
      <div className="rec-progreso-objetivo">
        Objetivo: {calObjetivo} kcal/día
      </div>
    </div>
  );
};

// ─── Panel de macros de hoy ───────────────────────────────────────────────────

const MacrosHoy = ({ macrosHoy }) => {
  if (!macrosHoy || (!macrosHoy.carbPct && !macrosHoy.protPct && !macrosHoy.grasPct)) return null;

  const items = [
    { label: 'Carbs', pct: macrosHoy.carbPct, color: '#eab308' },
    { label: 'Prot.',  pct: macrosHoy.protPct, color: '#a855f7' },
    { label: 'Grasas', pct: macrosHoy.grasPct, color: '#06b6d4' },
  ];

  return (
    <div className="rec-macros-hoy">
      {items.map(({ label, pct, color }) => (
        <div key={label} className="rec-macro-item">
          <span className="rec-macro-label">{label}</span>
          <div className="rec-macro-track">
            <div className="rec-macro-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
          </div>
          <span className="rec-macro-pct">{pct}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * PanelRecomendaciones
 *
 * Props:
 *   - versionFiltros: number  ← clave que sube en 1 cada vez que cambian los
 *     filtros del usuario (condiciones o categorías). Cuando cambia, este panel
 *     recarga desde /recomendaciones automáticamente, sin polling ni cookies.
 *
 * La fuente de verdad sigue siendo la BD (via /recomendaciones), nunca el estado
 * local del cliente. versionFiltros es solo una señal de "algo cambió, recarga".
 */
const PanelRecomendaciones = ({ versionFiltros = 0 }) => {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  const montadoRef = useRef(true);
  useEffect(() => {
    montadoRef.current = true;
    return () => { montadoRef.current = false; };
  }, []);

  const cargar = useCallback(async (signal) => {
    if (!montadoRef.current) return;
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/recomendaciones', { signal });
      if (montadoRef.current) setDatos(data);
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return;
      if (montadoRef.current) setError('No se pudieron cargar las recomendaciones.');
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    cargar(controller.signal);
    return () => controller.abort();
  }, [versionFiltros, cargar]);

  const todasEtiquetas = useMemo(() => {
    if (!datos?.recomendaciones) return [];
    const { condicionesDetectadas = [], categoriasActivas = [] } = datos.recomendaciones;
    return [
      ...condicionesDetectadas.map(c => ({ id: c, label: c.replace(/-/g, ' '), tipo: 'condicion' })),
      ...categoriasActivas.map(c => ({ id: c, label: LABEL_CATEGORIA[c] || c, tipo: 'categoria' })),
    ];
  }, [datos]);

  if (cargando) return (
    <div className="rec-panel">
      <div className="rec-header"><h2 className="rec-titulo">Recomendaciones Personalizadas</h2></div>
      <div className="rec-cargando"><div className="rec-spinner" /><p>Analizando tu perfil...</p></div>
    </div>
  );

  if (error) return (
    <div className="rec-panel">
      <div className="rec-header"><h2 className="rec-titulo">Recomendaciones Personalizadas</h2></div>
      <p className="rec-error">{error}</p>
      <button className="rec-btn-reintentar" onClick={cargar}>Reintentar</button>
    </div>
  );

  if (!datos) return null;

  const { nombre, recomendaciones: rec } = datos;
  const {
    imc,
    caloriasObjetivo,
    caloriasHoy            = 0,
    caloriasRestantes,
    progresoHoy            = 0,
    alertas                = [],
    alertasHoy             = [],
    contextoHorario        = [],
    alimentacion           = [],
    ejercicio              = [],
    ejercicioHoy           = [],
    hidratacion,
    comidasSaltadas        = [],
    nutriPromedio,
    macrosHoy              = {},
    coberturaAlimentacion  = false,
    coberturaEjercicio     = false,
    categoriasActivas      = [],
  } = rec;

  const tienePerfil     = todasEtiquetas.length > 0;
  const tieneConsumoHoy = caloriasHoy > 0;

  return (
    <div className="rec-panel">

      {/* ─── Encabezado ─── */}
      <div className="rec-header">
        <h2 className="rec-titulo">
          Recomendaciones para <span className="rec-nombre">{nombre?.split(' ')[0] || 'ti'}</span>
        </h2>
        {tienePerfil ? (
          <p className="rec-subtitulo">
            Basadas en tu perfil:{' '}
            {todasEtiquetas.map(({ id, label, tipo }) => (
              <span key={id} className={`rec-tag rec-tag--${tipo}`}>{label}</span>
            ))}
          </p>
        ) : (
          <p className="rec-subtitulo rec-subtitulo--vacio">
            Sin filtros activos — selecciona condiciones o momentos del día en el inicio para personalizar estas recomendaciones.
          </p>
        )}
      </div>

      {/* ─── Stats IMC / calorías / nutrientes ─── */}
      {(imc || caloriasObjetivo || nutriPromedio) && (
        <div className="rec-stats">
          {imc && (
            <div className={`rec-stat rec-stat--${COLOR_NIVEL[imc.categoria === 'normal' ? 'ok' : 'atencion']}`}>
              <IcoIMC />
              <div>
                <p className="rec-stat-valor">IMC {imc.valor}</p>
                <p className="rec-stat-label">{imc.categoria.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          {caloriasObjetivo && (
            <div className="rec-stat rec-stat--azul">
              <IcoComida />
              <div>
                <p className="rec-stat-valor">{caloriasObjetivo} kcal</p>
                <p className="rec-stat-label">objetivo diario</p>
              </div>
            </div>
          )}
          {tieneConsumoHoy && (
            <div className={`rec-stat ${progresoHoy > 100 ? 'rec-stat--naranja' : 'rec-stat--verde'}`}>
              <IcoFuego />
              <div>
                <p className="rec-stat-valor">{caloriasHoy} kcal</p>
                <p className="rec-stat-label">consumidas hoy</p>
              </div>
            </div>
          )}
          {nutriPromedio?.protPromedio > 0 && (
            <div className="rec-stat rec-stat--gris">
              <IcoEjercicio />
              <div>
                <p className="rec-stat-valor">{nutriPromedio.protPromedio}g</p>
                <p className="rec-stat-label">proteína/día (prom.)</p>
              </div>
            </div>
          )}
          {hidratacion && (
            <div className="rec-stat rec-stat--azul">
              <IcoAgua />
              <div>
                <p className="rec-stat-valor">{hidratacion.litros}L</p>
                <p className="rec-stat-label">{hidratacion.vasos} vasos/día</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Barra de progreso calórico de hoy ─── */}
      {caloriasObjetivo && tieneConsumoHoy && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoHoy />Balance calórico de hoy</h3>
          <BarraProgreso
            calHoy={caloriasHoy}
            calObjetivo={caloriasObjetivo}
            progreso={progresoHoy}
          />
          <MacrosHoy macrosHoy={macrosHoy} />
        </div>
      )}

      {/* ─── Contexto horario en tiempo real ─── */}
      {contextoHorario.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoReloj />Ahora mismo</h3>
          {contextoHorario.map((a, i) => (
            <div key={i} className={`rec-alerta rec-alerta--${COLOR_NIVEL[a.nivel] || 'azul'}`}>
              {iconAlerta(a.nivel)}
              <p>{a.texto}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Alertas generales (perfil + histórico) ─── */}
      {alertas.length > 0 && (
        <div className="rec-seccion">
          {alertas.map((a, i) => (
            <div key={i} className={`rec-alerta rec-alerta--${COLOR_NIVEL[a.nivel] || 'azul'}`}>
              {iconAlerta(a.nivel)}
              <p>{a.mensaje}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Alertas de hoy (micronutrientes en tiempo real) ─── */}
      {alertasHoy.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoAlerta />Alertas nutricionales de hoy</h3>
          {alertasHoy.map((a, i) => (
            <div key={i} className={`rec-alerta rec-alerta--${COLOR_NIVEL[a.nivel] || 'azul'}`}>
              {iconAlerta(a.nivel)}
              <p>{a.mensaje}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Actividad física sugerida para hoy ─── */}
      {ejercicioHoy.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoEjercicio />Actividad recomendada para hoy</h3>
          <ul className="rec-lista">
            {ejercicioHoy.map((tip, i) => (
              <li key={i} className="rec-item rec-item--hoy">
                <IcoBulletBolt />{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Hidratación ─── */}
      {hidratacion && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoAgua />Hidratación</h3>
          <div className="rec-alerta rec-alerta--azul">
            <IcoAgua />
            <p>
              Tu objetivo de hidratación es <strong>{hidratacion.litros}L</strong> ({hidratacion.vasos} vasos) al día.{' '}
              {hidratacion.nota}
            </p>
          </div>
        </div>
      )}

      {/* ─── Comidas saltadas ─── */}
      {comidasSaltadas.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoCalendario />Hábitos de comida</h3>
          <ul className="rec-lista">
            {comidasSaltadas.map((c, i) => (
              <li key={i} className="rec-item rec-item--naranja">
                <IcoBulletAlarm />{c.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Momento del día activo ─── */}
      {categoriasActivas.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoReloj />Consejos para tu momento del día</h3>
          <p className="rec-cat-aviso">
            Tienes activo el filtro de: <strong>{categoriasActivas.map(c => LABEL_CATEGORIA[c] || c).join(', ')}</strong>.
            Las siguientes recomendaciones aplican específicamente para ese momento.
          </p>
        </div>
      )}

      {/* ─── Alimentación ─── */}
      <div className="rec-seccion">
        <h3 className="rec-sec-titulo"><IcoComida />Alimentación</h3>
        {coberturaAlimentacion && alimentacion.length > 0 ? (
          <ul className="rec-lista">
            {alimentacion.map((tip, i) => (
              <li key={i} className="rec-item"><IcoBulletPlato />{tip}</li>
            ))}
          </ul>
        ) : (
          <div className="rec-sin-cobertura">
            <IcoSinFiltro />
            <p>Selecciona tu tipo de dieta en el filtro de la página principal para recibir orientación alimentaria específica.</p>
          </div>
        )}
      </div>

      {/* ─── Ejercicio general (basado en condición + IMC) ─── */}
      <div className="rec-seccion">
        <h3 className="rec-sec-titulo"><IcoEjercicio />Actividad Física General</h3>
        {coberturaEjercicio && ejercicio.length > 0 ? (
          <ul className="rec-lista">
            {ejercicio.map((tip, i) => (
              <li key={i} className="rec-item"><IcoBulletBolt />{tip}</li>
            ))}
          </ul>
        ) : (
          <div className="rec-sin-cobertura">
            <IcoSinMancuerna />
            <p>Las recomendaciones de actividad física para tu perfil se mostrarán cuando selecciones tus condiciones de salud en el filtro de dieta.</p>
          </div>
        )}
      </div>

      <p className="rec-disclaimer">* Estas recomendaciones son orientativas y no reemplazan la consulta con un profesional de salud.</p>
    </div>
  );
};

export default PanelRecomendaciones;