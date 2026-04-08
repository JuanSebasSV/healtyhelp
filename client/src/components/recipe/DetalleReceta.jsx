import React, { useEffect, useState, useCallback } from 'react';
import NutricionGrafico from './NutricionGrafico';
import BtnConsumo from './BtnConsumo';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import './DetalleReceta.css';

/* ─── Helper costo ──────────────────────────────────────── */
const formatearCosto = (costo, moneda = 'COP') => {
  if (!costo || costo <= 0) return null;
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: moneda === 'COP' ? 0 : 2,
      maximumFractionDigits: moneda === 'COP' ? 0 : 2,
    }).format(costo);
  } catch {
    return `${moneda} ${costo.toFixed(2)}`;
  }
};

/* ─── Estrellas ─────────────────────────────────────────── */
const Estrellas = ({ valor, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`estrellas-input ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`estrella-ico ${n <= (hover || valor) ? 'llena' : 'vacia'}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
    </div>
  );
};

const formatFecha = (f) => new Date(f).toLocaleDateString('es-ES', {
  year: 'numeric', month: 'short', day: 'numeric'
});

/* ─── Sección de respuestas ─────────────────────────────── */
const SeccionRespuestas = ({ recetaId, resenaId, respuestas: respInit, user, isAuthenticated }) => {
  const [respuestas,   setRespuestas]   = useState(respInit || []);
  const [texto,        setTexto]        = useState('');
  const [enviando,     setEnviando]     = useState(false);
  const [expandido,    setExpandido]    = useState(false);
  const [respondiendo, setRespondiendo] = useState(false);

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const { data } = await api.post(
        `/recipes/${recetaId}/resenas/${resenaId}/respuestas`,
        { texto }
      );
      setRespuestas(prev => [...prev, data.respuesta]);
      setTexto('');
      setRespondiendo(false);
      setExpandido(true);
      toast.success('✅ Respuesta publicada');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al responder'}`);
    } finally {
      setEnviando(false);
    }
  };

  const handleBorrar = async (respId) => {
    if (!window.confirm('¿Eliminar esta respuesta?')) return;
    try {
      await api.delete(`/recipes/${recetaId}/resenas/${resenaId}/respuestas/${respId}`);
      setRespuestas(prev => prev.filter(r => r._id !== respId));
      toast.success('Respuesta eliminada');
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al borrar'}`);
    }
  };

  return (
    <div className="resp-seccion">
      <div className="resp-acciones-fila">
        {respuestas.length > 0 && (
          <button className="btn-toggle-resp" onClick={() => setExpandido(v => !v)}>
            {expandido
              ? '▲ Ocultar respuestas'
              : `▼ ${respuestas.length} respuesta${respuestas.length !== 1 ? 's' : ''}`}
          </button>
        )}
        {isAuthenticated && (
          <button className="btn-responder" onClick={() => setRespondiendo(true)}>
            ↩ Responder
          </button>
        )}
      </div>

      {expandido && respuestas.length > 0 && (
        <div className="resp-lista">
          {respuestas.map(rp => (
            <div key={rp._id} className="resp-item">
              <div className="resp-avatar">{rp.userName.charAt(0).toUpperCase()}</div>
              <div className="resp-cuerpo">
                <div className="resp-meta">
                  <span className="resp-nombre">{rp.userName}</span>
                  <span className="resp-fecha">{formatFecha(rp.createdAt)}</span>
                  {isAuthenticated && user &&
                    (rp.userId?.toString() === user._id?.toString() ||
                    rp.userId?.toString() === user.id?.toString() ||
                    user.role === 'admin') && (
                      <button
                        className="btn-borrar-resp"
                        onClick={() => handleBorrar(rp._id)}
                        title="Eliminar respuesta"
                      >🗑️</button>
                    )}
                </div>
                <p className="resp-texto">{rp.texto}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {respondiendo && (
        <div className="resp-form">
          <div className="resp-avatar resp-avatar--yo">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="resp-input-wrap">
            <textarea
              className="resp-textarea"
              placeholder="Escribe una respuesta..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={2}
              maxLength={500}
              lang="es"
              spellCheck="true"
              autoFocus
            />
            <div className="resp-actions">
              <button className="btn-cancelar-resp" onClick={() => { setTexto(''); setRespondiendo(false); }} disabled={enviando}>
                Cancelar
              </button>
              <button className="btn-enviar-resp" onClick={handleEnviar} disabled={enviando || !texto.trim()}>
                {enviando ? '⏳' : '↩ Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Componente principal ───────────────────────────────── */
const DetalleReceta = ({ receta, cerrar, abrirNutricion }) => {
  const { user, isAuthenticated } = useAuth();

  const [resenas,       setResenas]       = useState([]);
  const [puntosProm,    setPuntosProm]    = useState(receta.puntosProm   || 0);
  const [totalResenas,  setTotalResenas]  = useState(receta.totalResenas || 0);
  const [cargandoRes,   setCargandoRes]   = useState(true);
  const [pagina,        setPagina]        = useState(1);
  const [totalPags,     setTotalPags]     = useState(1);
  const [orden,         setOrden]         = useState('reciente');

  const [miResena,      setMiResena]      = useState(null);
  const [editando,      setEditando]      = useState(false);
  const [formEstrellas, setFormEstrellas] = useState(5);
  const [formTexto,     setFormTexto]     = useState('');
  const [enviando,      setEnviando]      = useState(false);

  // Costo
  const costoFormato = formatearCosto(receta.costoPorcion, receta.moneda || 'COP');

  // ── Bloquear scroll del body ──
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position  = 'fixed';
    document.body.style.top       = `-${scrollY}px`;
    document.body.style.left      = '0';
    document.body.style.right     = '0';
    document.body.style.overflowY = 'scroll';
    return () => {
      document.body.style.position  = '';
      document.body.style.top       = '';
      document.body.style.left      = '';
      document.body.style.right     = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // ── Cargar reseñas ──
  const cargarResenas = useCallback(async (pag = 1, ord = orden) => {
    setCargandoRes(true);
    try {
      const { data } = await api.get(
        `/recipes/${receta._id}/resenas?page=${pag}&limit=5&orden=${ord}`
      );
      setResenas(data.resenas);
      setPuntosProm(data.puntosProm);
      setTotalResenas(data.totalResenas);
      setTotalPags(data.pagination.pages);

      if (user) {
        const mia = data.resenas.find(
          r => r.userId?.toString() === user._id?.toString() ||
              r.userId?.toString() === user.id?.toString()
        );
        if (mia) {
          setMiResena(mia);
          setFormEstrellas(mia.estrellas);
          setFormTexto(mia.texto || '');
        } else if (pag === 1) {
          const totalPaginas = data.pagination.pages;
          let encontrada = false;
          for (let p = 2; p <= totalPaginas && !encontrada; p++) {
            const { data: d2 } = await api.get(
              `/recipes/${receta._id}/resenas?page=${p}&limit=5&orden=${ord}`
            );
            const mia2 = d2.resenas.find(
              r => r.userId?.toString() === user._id?.toString() ||
                  r.userId?.toString() === user.id?.toString()
            );
            if (mia2) {
              encontrada = true;
              setMiResena(mia2);
              setFormEstrellas(mia2.estrellas);
              setFormTexto(mia2.texto || '');
            }
          }
          if (!encontrada) {
            setMiResena(null);
            setFormEstrellas(5);
            setFormTexto('');
          }
        }
      }
    } catch {
      toast.error('Error cargando reseñas');
    } finally {
      setCargandoRes(false);
    }
  }, [receta._id, user, orden]);

  useEffect(() => { cargarResenas(1, orden); }, [orden]);

  const cambiarOrden = (nuevoOrden) => {
    setOrden(nuevoOrden);
    setPagina(1);
  };

  // ── Publicar / editar reseña ──
  const handleSubmitResena = async () => {
    if (!formEstrellas) { toast.error('Selecciona una puntuación'); return; }
    setEnviando(true);
    try {
      const payload = { estrellas: formEstrellas, texto: formTexto };
      let data;
      if (miResena) {
        ({ data } = await api.put(`/recipes/${receta._id}/resenas`, payload));
        toast.success('✅ Reseña actualizada');
      } else {
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, payload));
        toast.success('✅ Reseña publicada');
      }
      setPuntosProm(data.puntosProm);
      setTotalResenas(data.totalResenas);
      setMiResena(data.resena);
      setFormEstrellas(data.resena.estrellas);
      setFormTexto(data.resena.texto || '');
      setEditando(false);
      cargarResenas(pagina, orden);
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.error || 'Error al publicar la reseña'}`);
    } finally {
      setEnviando(false);
    }
  };

  // ── Borrar reseña ──
  const handleBorrarResena = async (resenaId) => {
    if (!window.confirm('¿Eliminar esta reseña? No se puede deshacer.')) return;
    try {
      await api.delete(`/recipes/${receta._id}/resenas/${resenaId}`);
      toast.success('Reseña eliminada');
      setMiResena(null);
      setFormEstrellas(5);
      setFormTexto('');
      setEditando(false);
      cargarResenas(1, orden);
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al borrar'}`);
    }
  };

  // ── Votar ──
  const handleVotar = async (resenaId, tipo) => {
    if (!isAuthenticated) { toast.info('Inicia sesión para votar'); return; }
    try {
      const { data } = await api.post(
        `/recipes/${receta._id}/resenas/${resenaId}/voto`,
        { tipo }
      );
      setResenas(prev => prev.map(r =>
        r._id === resenaId
          ? { ...r, likes: data.likes, dislikes: data.dislikes, miVoto: data.miVoto }
          : r
      ));
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al votar'}`);
    }
  };

  return (
    <div className="modal-overlay modal-overlay--receta" onClick={cerrar}>
      <div className="modalContenedorReceta" onClick={e => e.stopPropagation()}>

        <button className="btn-cerrar-modal" onClick={cerrar} aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* ── Columna izquierda ── */}
        <div className="modalCol modalIzq">

          {/* Imagen con badge de costo */}
          <div style={{ position: 'relative', display: 'block', width: '100%', overflow: 'hidden', borderRadius: '12px' }}>
            <img src={receta.img} alt={receta.nombre} className="modalImg" />
            {costoFormato && (
              <div style={{
                position:       'absolute',
                bottom:         '12px',
                left:           '12px',
                display:        'flex',
                alignItems:     'center',
                gap:            '5px',
                background:     'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                color:          '#fff',
                borderRadius:   '20px',
                padding:        '6px 14px 6px 10px',
                fontSize:       '0.9rem',
                fontWeight:     '600',
                pointerEvents:  'none',
              }}>
                <span style={{ fontSize: '1rem' }}>🍽️</span>
                <span>{costoFormato}</span>
                <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '0.8rem' }}>/porción</span>
              </div>
            )}
          </div>

          <h2>{receta.nombre}</h2>
          <p className="modalDesc">{receta.desc}</p>

          <div className="modalSeccion">
            <h3>Ingredientes</h3>
            <ul>{receta.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
          </div>

          <div className="modalSeccion">
            <h3>Preparación</h3>
            <ol>{receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}</ol>
          </div>

          <BtnConsumo recetaId={receta._id} />

          {/* ══════════ RESEÑAS ══════════ */}
          <div className="modalSeccion resenas-seccion">

            <div className="resenas-resumen">
              <span className="resenas-prom-numero">
                {puntosProm > 0 ? puntosProm : '—'}
              </span>
              <div className="resenas-prom-detalle">
                <Estrellas valor={Math.round(puntosProm)} readonly />
                <span className="resenas-total-txt">
                  {totalResenas > 0
                    ? `${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}`
                    : 'Sin reseñas aún'}
                </span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="resena-form">
                {miResena && !editando ? (
                  <div className="mi-resena-card">
                    <div className="mi-resena-header">
                      <span className="mi-resena-label">Tu reseña</span>
                      <div className="mi-resena-acciones">
                        <button className="btn-editar-resena" onClick={() => setEditando(true)}>
                          ✏️ Editar
                        </button>
                        <button className="btn-borrar-resena" onClick={() => handleBorrarResena(miResena._id)}>
                          🗑️ Borrar
                        </button>
                      </div>
                    </div>
                    <Estrellas valor={miResena.estrellas} readonly />
                    {miResena.texto && (
                      <p className="mi-resena-texto">"{miResena.texto}"</p>
                    )}
                  </div>
                ) : (
                  <>
                    <h4 className="resena-form-titulo">
                      {miResena ? 'Editar tu reseña' : '¿Qué te pareció esta receta?'}
                    </h4>
                    <Estrellas valor={formEstrellas} onChange={setFormEstrellas} />
                    <textarea
                      className="resena-textarea"
                      placeholder="Escribe un comentario (opcional)..."
                      value={formTexto}
                      onChange={e => setFormTexto(e.target.value)}
                      maxLength={500}
                      rows={3}
                      lang="es"
                      spellCheck="true"
                    />
                    <div className="resena-form-actions">
                      {miResena && (
                        <button
                          className="btn-cancelar-resena"
                          onClick={() => {
                            setEditando(false);
                            setFormEstrellas(miResena.estrellas);
                            setFormTexto(miResena.texto || '');
                          }}
                          disabled={enviando}
                        >Cancelar</button>
                      )}
                      <button
                        className="btn-enviar-resena"
                        onClick={handleSubmitResena}
                        disabled={enviando || !formEstrellas}
                      >
                        {enviando ? '⏳ Guardando...' : miResena ? '💾 Guardar cambios' : '📝 Publicar reseña'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <p className="resena-login-aviso">
                <span>🔒</span> Inicia sesión para dejar una reseña
              </p>
            )}

            <div className="resenas-filtro">
              <span className="resenas-filtro-label">Ordenar por:</span>
              <div className="resenas-filtro-btns">
                <button
                  className={`btn-orden ${orden === 'reciente' ? 'activo' : ''}`}
                  onClick={() => cambiarOrden('reciente')}
                >🕐 Más recientes</button>
                <button
                  className={`btn-orden ${orden === 'relevancia' ? 'activo' : ''}`}
                  onClick={() => cambiarOrden('relevancia')}
                >👍 Más relevantes</button>
              </div>
            </div>

            <div className="resenas-lista">
              {cargandoRes ? (
                <p className="resenas-estado">Cargando reseñas...</p>
              ) : resenas.length === 0 ? (
                <p className="resenas-estado resenas-vacio">
                  Sé el primero en dejar una reseña ✨
                </p>
              ) : (
                resenas.map(r => {
                  const esPropia = user && (
                    r.userId?.toString() === user._id?.toString() ||
                    r.userId?.toString() === user.id?.toString()
                  );
                  const esAdmin  = user?.role === 'admin';
                  return (
                    <div key={r._id} className={`resena-item ${esPropia ? 'propia' : ''}`}>
                      <div className="resena-item-header">
                        <div className="resena-avatar">
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="resena-item-meta">
                          <span className="resena-nombre">{r.userName}</span>
                          <span className="resena-fecha">{formatFecha(r.createdAt)}</span>
                        </div>
                        <Estrellas valor={r.estrellas} readonly />
                        {isAuthenticated && (esPropia || esAdmin) && (
                          <button
                            className="btn-borrar-resena-lista"
                            onClick={() => handleBorrarResena(r._id)}
                            title="Eliminar reseña"
                          >🗑️</button>
                        )}
                      </div>

                      {r.texto && <p className="resena-texto">{r.texto}</p>}

                      <div className="resena-votos">
                        <span className="votos-label">¿Te resultó útil?</span>
                        <button
                          className={`btn-voto btn-like ${r.miVoto === 'like' ? 'activo' : ''}`}
                          onClick={() => handleVotar(r._id, 'like')}
                          title="Es útil"
                        >👍 <span>{r.likes}</span></button>
                        <button
                          className={`btn-voto btn-dislike ${r.miVoto === 'dislike' ? 'activo' : ''}`}
                          onClick={() => handleVotar(r._id, 'dislike')}
                          title="No es útil"
                        >👎 <span>{r.dislikes}</span></button>
                      </div>

                      <SeccionRespuestas
                        recetaId={receta._id}
                        resenaId={r._id}
                        respuestas={r.respuestas || []}
                        user={user}
                        isAuthenticated={isAuthenticated}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {totalPags > 1 && (
              <div className="resenas-paginacion">
                <button
                  disabled={pagina === 1}
                  onClick={() => { const p = pagina - 1; setPagina(p); cargarResenas(p, orden); }}
                >← Anterior</button>
                <span>{pagina} / {totalPags}</span>
                <button
                  disabled={pagina === totalPags}
                  onClick={() => { const p = pagina + 1; setPagina(p); cargarResenas(p, orden); }}
                >Siguiente →</button>
              </div>
            )}

          </div>
        </div>

        {/* ── Columna derecha ── */}
        <div className="modalCol modalDer">
          <NutricionGrafico nutri={receta.nutri} abrirNutricion={abrirNutricion} />
        </div>

      </div>
    </div>
  );
};

export default DetalleReceta;