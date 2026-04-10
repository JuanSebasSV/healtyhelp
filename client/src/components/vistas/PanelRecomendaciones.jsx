/**
 * PanelRecomendaciones.jsx
 *
 * Se monta debajo del contenido de VistaSeguimiento.
 * Llama a GET /api/recomendaciones al cargar y muestra las recomendaciones
 * organizadas en secciones: alertas, alimentación, ejercicio, comidas saltadas.
 *
 * Uso en VistaSeguimiento.jsx:
 *   import PanelRecomendaciones from './PanelRecomendaciones';
 *   ...
 *   // Al final del return, fuera del seg-layout pero dentro del wrapper principal:
 *   <PanelRecomendaciones />
 */

import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import './PanelRecomendaciones.css';

// ─── Íconos SVG internos ──────────────────────────────────────────────────────

const IcoAlerta = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-ico">
    <path d="M10 2L18.5 17H1.5L10 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <line x1="10" y1="8" x2="10" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="10" cy="14.5" r="0.8" fill="currentColor"/>
  </svg>
);

const IcoOk = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-ico">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M6 10.5L8.5 13L14 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoInfo = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-ico">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/>
    <line x1="10" y1="9" x2="10" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="10" cy="6.5" r="0.8" fill="currentColor"/>
  </svg>
);

const IcoComida = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-sec-ico">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M4 10C4 6.69 6.69 4 10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IcoEjercicio = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-sec-ico">
    <path d="M3 10h2l2-5 3 10 2-7 1.5 2H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IcoCalendario = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-sec-ico">
    <rect x="2.5" y="4" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <line x1="2.5" y1="8" x2="17.5" y2="8" stroke="currentColor" strokeWidth="1.6"/>
    <line x1="6.5" y1="2" x2="6.5" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="13.5" y1="2" x2="13.5" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IcoIMC = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rec-sec-ico">
    <path d="M3 16L8 9L12 12L16 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const PanelRecomendaciones = () => {
  const [datos,    setDatos]    = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    cargarRecomendaciones();
  }, []);

  const cargarRecomendaciones = async () => {
    setCargando(true);
    setError(null);
    try {
      const { data } = await api.get('/recomendaciones');
      setDatos(data);
    } catch (err) {
      setError('No se pudieron cargar las recomendaciones.');
    } finally {
      setCargando(false);
    }
  };

  // ── Render estados ──
  if (cargando) {
    return (
      <div className="rec-panel">
        <div className="rec-header">
          <h2 className="rec-titulo">Recomendaciones Personalizadas</h2>
        </div>
        <div className="rec-cargando">
          <div className="rec-spinner" />
          <p>Analizando tu perfil y consumos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rec-panel">
        <div className="rec-header">
          <h2 className="rec-titulo">Recomendaciones Personalizadas</h2>
        </div>
        <p className="rec-error">{error}</p>
      </div>
    );
  }

  if (!datos) return null;

  const { nombre, recomendaciones: rec } = datos;
  const {
    imc,
    caloriasObjetivo,
    alertas = [],
    alimentacion = [],
    ejercicio = [],
    comidasSaltadas = [],
    condicionesDetectadas = [],
    nutriPromedio,
    coberturaAlimentacion = false,
    coberturaEjercicio = false,
  } = rec;

  const nivelColor = { ok: 'verde', advertencia: 'amarillo', atencion: 'naranja', info: 'azul' };

  return (
    <div className="rec-panel">

      {/* ── Encabezado ── */}
      <div className="rec-header">
        <h2 className="rec-titulo">
          Recomendaciones para{' '}
          <span className="rec-nombre">{nombre?.split(' ')[0] || 'ti'}</span>
        </h2>
        {condicionesDetectadas.length > 0 && (
          <p className="rec-subtitulo">
            Basadas en tu perfil:{' '}
            {condicionesDetectadas.map(c => (
              <span key={c} className="rec-tag">{c.replace(/-/g, ' ')}</span>
            ))}
          </p>
        )}
      </div>

      {/* ── Resumen IMC + Calorías ── */}
      {(imc || caloriasObjetivo || nutriPromedio) && (
        <div className="rec-stats">
          {imc && (
            <div className={`rec-stat rec-stat--${nivelColor[imc.categoria === 'normal' ? 'ok' : 'atencion']}`}>
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

      {/* ── Alertas ── */}
      {alertas.length > 0 && (
        <div className="rec-seccion">
          {alertas.map((alerta, i) => (
            <div key={i} className={`rec-alerta rec-alerta--${nivelColor[alerta.nivel] || 'azul'}`}>
              {alerta.nivel === 'ok' ? <IcoOk /> : alerta.nivel === 'advertencia' ? <IcoAlerta /> : <IcoInfo />}
              <p>{alerta.mensaje}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Comidas saltadas ── */}
      {comidasSaltadas.length > 0 && (
        <div className="rec-seccion">
          <h3 className="rec-sec-titulo">
            <IcoCalendario />
            Hábitos de comida
          </h3>
          <ul className="rec-lista">
            {comidasSaltadas.map((c, i) => (
              <li key={i} className="rec-item rec-item--naranja">
                <span className="rec-bullet">⏰</span>
                {c.mensaje}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Alimentación ── */}
      <div className="rec-seccion">
        <h3 className="rec-sec-titulo">
          <IcoComida />
          Alimentación
        </h3>
        {coberturaAlimentacion && alimentacion.length > 0 ? (
          <ul className="rec-lista">
            {alimentacion.map((tip, i) => (
              <li key={i} className="rec-item">
                <span className="rec-bullet">🥗</span>
                {tip}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rec-sin-cobertura">
            <span className="rec-sin-cobertura-ico">🔬</span>
            <p>
              Estamos ampliando continuamente nuestra base de recomendaciones nutricionales.
              Pronto contaremos con orientación alimentaria específica adaptada a tu perfil.
              Por ahora, te invitamos a consultar con un profesional de nutrición para una
              guía personalizada.
            </p>
          </div>
        )}
      </div>

      {/* ── Ejercicio ── */}
      <div className="rec-seccion">
        <h3 className="rec-sec-titulo">
          <IcoEjercicio />
          Actividad Física
        </h3>
        {coberturaEjercicio && ejercicio.length > 0 ? (
          <ul className="rec-lista">
            {ejercicio.map((tip, i) => (
              <li key={i} className="rec-item">
                <span className="rec-bullet">🏃</span>
                {tip}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rec-sin-cobertura">
            <span className="rec-sin-cobertura-ico">🏗️</span>
            <p>
              Las recomendaciones de actividad física para tu caso particular están en
              desarrollo. Nuestro equipo trabaja para ampliar la cobertura a cada vez más
              perfiles y condiciones. Mientras tanto, un profesional de salud o deporte
              podrá orientarte con mayor precisión.
            </p>
          </div>
        )}
      </div>

      <p className="rec-disclaimer">
        * Estas recomendaciones son orientativas y no reemplazan la consulta con un profesional de salud.
      </p>
    </div>
  );
};

export default PanelRecomendaciones;
