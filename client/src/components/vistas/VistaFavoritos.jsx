import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaReceta from '../recipe/TarjetaReceta';
import './VistaFavoritos.css';

const CATEGORIAS = [
  {
    id: 'desayuno',
    nombre: 'Desayuno',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
    ),
  },
  {
    id: 'almuerzo',
    nombre: 'Almuerzo',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/>
        <path d="M16 12a4 4 0 0 0-4-4m3-3-1.256 1.256M20 12h2"/>
      </svg>
    ),
  },
  {
    id: 'cena',
    nombre: 'Cena',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
      </svg>
    ),
  },
  {
    id: 'postres-snacks',
    nombre: 'Postres & Snacks',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 13H3M16 17H3m7.2-9.1-3.388 2.5A2 2 0 0 0 3 12.01V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-8.654c0-2-2.44-6.026-6.44-8.026a1 1 0 0 0-1.082.057L10.4 5.6"/>
        <circle cx="9" cy="7" r="2"/>
      </svg>
    ),
  },
];

const TIEMPOS = [
  { id: 'menos15', label: 'Menos de 15 min' },
  { id: '15a30',   label: '15 – 30 min' },
  { id: 'mas30',   label: 'Más de 30 min' },
];

const normalizarTexto = (texto) =>
  texto ? texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

const VistaFavoritos = ({ recetas, favoritos, toggleFav }) => {
  const navigate = useNavigate();
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [busqueda, setBusqueda]               = useState('');
  const [filtroTiempo, setFiltroTiempo]       = useState(null);

  const recetasFavoritas = useMemo(
    () => recetas.filter(r => favoritos.includes(r._id)),
    [recetas, favoritos]
  );

  const contarPorCategoria = (catId) =>
    recetasFavoritas.filter(r => r.cat === catId).length;

  const recetasFiltradas = useMemo(() => {
    if (!categoriaActiva) return [];
    let lista = recetasFavoritas.filter(r => r.cat === categoriaActiva);
    if (busqueda.trim()) {
      const b = normalizarTexto(busqueda);
      lista = lista.filter(r =>
        normalizarTexto(r.nombre || '').includes(b) ||
        normalizarTexto(r.desc   || '').includes(b)
      );
    }
    if (filtroTiempo) {
      const t = (r) => r.tiempoMinutos || 0;
      lista = lista.filter(r =>
        filtroTiempo === 'menos15' ? (t(r) > 0 && t(r) < 15) :
        filtroTiempo === '15a30'   ? (t(r) >= 15 && t(r) <= 30) :
        filtroTiempo === 'mas30'   ? (t(r) > 30) : true
      );
    }
    return lista;
  }, [recetasFavoritas, categoriaActiva, busqueda, filtroTiempo]);

  const totalFavoritos = recetasFavoritas.length;

  if (!categoriaActiva) {
    return (
      <div className="vf-wrap vista-favoritos">
        <div className="vf-header">
          <div className="vf-header-texto">
            <h1>Mis Favoritos</h1>
            {totalFavoritos > 0 && (
              <span className="vf-total-badge">
                {totalFavoritos} receta{totalFavoritos !== 1 ? 's' : ''} guardada{totalFavoritos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="vf-subtitulo">Selecciona una categoría para explorar tus recetas favoritas</p>
        </div>

        {totalFavoritos === 0 ? (
          <div className="vf-vacio">
            <div className="vf-vacio-icono">
              <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3>Aún no tienes favoritos</h3>
            <p>Explora las recetas y guarda las que más te gusten tocando el corazón.</p>
            <button className="vf-btn-explorar" onClick={() => navigate('/')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Explorar recetas
            </button>
          </div>
        ) : (
          <div className="vf-categorias-grid">
            {CATEGORIAS.map(cat => {
              const count = contarPorCategoria(cat.id);
              return (
                <button
                  key={cat.id}
                  className={`vf-cat-card${count === 0 ? ' vf-cat-card--vacia' : ''}`}
                  onClick={() => { setCategoriaActiva(cat.id); setBusqueda(''); setFiltroTiempo(null); }}
                  disabled={count === 0}
                >
                  <div className="vf-cat-icono">{cat.icono}</div>
                  <span className="vf-cat-nombre">{cat.nombre}</span>
                  <span className="vf-cat-count">
                    {count === 0 ? 'Sin favoritos' : `${count} receta${count !== 1 ? 's' : ''}`}
                  </span>
                  {count > 0 && (
                    <div className="vf-cat-arrow">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const catActual = CATEGORIAS.find(c => c.id === categoriaActiva);
  const countCategoria = recetasFavoritas.filter(r => r.cat === categoriaActiva).length;

  return (
    <div className="vf-wrap2 vista-favoritos">
      <div className="vf-header vf-header--inner">
        <button className="vf-back" onClick={() => { setCategoriaActiva(null); setBusqueda(''); setFiltroTiempo(null); }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Mis Favoritos
        </button>
      </div>

      <div className="barra">
        <div className="vf-header-texto">
          <div className="vf-cat-titulo">
            <span className="vf-cat-titulo-icono">{catActual.icono}</span>
            <h1>{catActual.nombre}</h1>
          </div>
        </div>

        <div className="vf-buscador">
          <div className="vf-buscador-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="vf-buscador-input"
              placeholder={`Buscar en ${catActual.nombre}...`}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="vf-buscador-clear" onClick={() => setBusqueda('')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
          {busqueda && (
            <span className="vf-conteo">
              {recetasFiltradas.length} resultado{recetasFiltradas.length !== 1 ? 's' : ''} para "{busqueda}"
            </span>
          )}
        </div>

        <span className="vf-total-badge">
          {countCategoria} receta{countCategoria !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="vf-tiempo-fila">
        {TIEMPOS.map(t => (
          <button
            key={t.id}
            className={`vf-tiempo-btn${filtroTiempo === t.id ? ' activo' : ''}`}
            onClick={() => setFiltroTiempo(prev => prev === t.id ? null : t.id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {t.label}
          </button>
        ))}
        {filtroTiempo && (
          <button className="vf-tiempo-btn vf-tiempo-limpiar" onClick={() => setFiltroTiempo(null)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Limpiar
          </button>
        )}
      </div>

      {recetasFiltradas.length === 0 ? (
        <div className="vf-vacio">
          <div className="vf-vacio-icono">
            {busqueda || filtroTiempo ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            )}
          </div>
          <h3>{busqueda || filtroTiempo ? 'Sin resultados' : `Sin favoritos en ${catActual.nombre}`}</h3>
          <p>
            {busqueda || filtroTiempo
              ? 'Intenta con otro término o filtro.'
              : 'Guarda recetas de esta categoría para verlas aquí.'}
          </p>
          {!busqueda && !filtroTiempo && (
            <button className="vf-btn-explorar" onClick={() => navigate('/')}>
              Explorar recetas
            </button>
          )}
        </div>
      ) : (
        <div className="grid">
          {recetasFiltradas.map(receta => (
            <TarjetaReceta
              key={receta._id}
              receta={receta}
              toggleFav={toggleFav}
              esFav={favoritos.includes(receta._id)}
              seleccionada={false}
              onSeleccionar={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VistaFavoritos;