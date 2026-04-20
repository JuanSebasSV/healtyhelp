import React, { useEffect, useState, useRef } from 'react';
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

  // Recarga cada vez que versionFiltros cambia (incluye la carga inicial con 0)
  useEffect(() => {
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionFiltros]);

  const cargar = async () => {
    if (!montadoRef.current) return;
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/recomendaciones');
      if (montadoRef.current) setDatos(data);
    } catch {
      if (montadoRef.current) setError('No se pudieron cargar las recomendaciones.');
    } finally {
      if (montadoRef.current) setCargando(false);
    }
  };

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
    alertas            = [],
    alimentacion       = [],
    ejercicio          = [],
    comidasSaltadas    = [],
    condicionesDetectadas = [],
    categoriasActivas  = [],
    nutriPromedio,
    coberturaAlimentacion = false,
    coberturaEjercicio    = false,
  } = rec;

  const todasEtiquetas = [
    ...condicionesDetectadas.map(c => ({ id: c, label: c.replace(/-/g, ' '), tipo: 'condicion' })),
    ...categoriasActivas.map(c => ({ id: c, label: LABEL_CATEGORIA[c] || c, tipo: 'categoria' })),
  ];

  const tienePerfil = todasEtiquetas.length > 0;

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
          {nutriPromedio?.calPromedio > 0 && (
            <div className="rec-stat rec-stat--gris">
              <IcoIMC />
              <div>
                <p className="rec-stat-valor">{nutriPromedio.calPromedio} kcal</p>
                <p className="rec-stat-label">promedio consumido</p>
              </div>
            </div>
          )}
          {nutriPromedio?.protPromedio > 0 && (
            <div className="rec-stat rec-stat--gris">
              <IcoEjercicio />
              <div>
                <p className="rec-stat-valor">{nutriPromedio.protPromedio}g</p>
                <p className="rec-stat-label">proteína/día</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Alertas ─── */}
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

      {/* ─── Comidas saltadas ─── */}
      {comidasSaltadas.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo"><IcoCalendario />Hábitos de comida</h3>
          <ul className="rec-lista">
            {comidasSaltadas.map((c, i) => (
              <li key={i} className="rec-item rec-item--naranja">
                <span className="rec-bullet">⏰</span>{c.mensaje}
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
              <li key={i} className="rec-item"><span className="rec-bullet">🥗</span>{tip}</li>
            ))}
          </ul>
        ) : (
          <div className="rec-sin-cobertura">
            <span className="rec-sin-cobertura-ico">🔬</span>
            <p>Selecciona tu tipo de dieta en el filtro de la página principal para recibir orientación alimentaria específica.</p>
          </div>
        )}
      </div>

      {/* ─── Ejercicio ─── */}
      <div className="rec-seccion">
        <h3 className="rec-sec-titulo"><IcoEjercicio />Actividad Física</h3>
        {coberturaEjercicio && ejercicio.length > 0 ? (
          <ul className="rec-lista">
            {ejercicio.map((tip, i) => (
              <li key={i} className="rec-item"><span className="rec-bullet">🏃</span>{tip}</li>
            ))}
          </ul>
        ) : (
          <div className="rec-sin-cobertura">
            <span className="rec-sin-cobertura-ico">🏗️</span>
            <p>Las recomendaciones de actividad física para tu perfil se mostrarán cuando selecciones tus condiciones de salud en el filtro de dieta.</p>
          </div>
        )}
      </div>

      <p className="rec-disclaimer">* Estas recomendaciones son orientativas y no reemplazan la consulta con un profesional de salud.</p>
    </div>
  );
};

export default PanelRecomendaciones;