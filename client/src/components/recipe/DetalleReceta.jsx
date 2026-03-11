import React, { useEffect, useState, useCallback } from 'react';
import NutricionGrafico from './NutricionGrafico';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import './DetalleReceta.css';

// ── Estrellas interactivas ──
const Estrellas = ({ valor, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`estrellas-input ${readonly ? 'readonly' : ''}`}>
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`estrella ${n <= (hover || valor) ? 'llena' : 'vacia'}`}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
    </div>
  );
};

const DetalleReceta = ({ receta, cerrar }) => {
  const { user, isAuthenticated } = useAuth();
  // isAuthenticated puede ser función o booleano según el hook — normalizamos
  const estaAutenticado = typeof isAuthenticated === 'function' ? isAuthenticated() : (isAuthenticated || !!user);
  const [verNutriDetalle, setVerNutriDetalle] = useState(false);

  // ── Datos seguros — nunca undefined ──
  const ingredientes = receta.ingredientes || [];
  const pasos        = receta.pasos        || [];
  const nutri        = receta.nutri        || {};
  const img          = receta.img          || '';
  const nombre       = receta.nombre       || 'Sin nombre';
  const desc         = receta.desc         || '';

  // ── Reseñas ──
  const [resenas,       setResenas]       = useState([]);
  const [puntosProm,    setPuntosProm]    = useState(receta.puntosProm   || 0);
  const [totalResenas,  setTotalResenas]  = useState(receta.totalResenas || 0);
  const [cargandoRes,   setCargandoRes]   = useState(true);
  const [pagina,        setPagina]        = useState(1);
  const [totalPags,     setTotalPags]     = useState(1);

  // ── Mi reseña ──
  const [miResena,      setMiResena]      = useState(null);
  const [editando,      setEditando]      = useState(false);
  const [formEstrellas, setFormEstrellas] = useState(5);
  const [formTexto,     setFormTexto]     = useState('');
  const [enviando,      setEnviando]      = useState(false);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // ── Cargar reseñas ──
  const cargarResenas = useCallback(async (pag = 1) => {
    setCargandoRes(true);
    try {
      const { data } = await api.get(`/recipes/${receta._id}/resenas?page=${pag}&limit=5`);
      setResenas(data.resenas || []);
      setPuntosProm(data.puntosProm   || 0);
      setTotalResenas(data.totalResenas || 0);
      setTotalPags(data.pagination?.pages || 1);

      if (user) {
        const mia = (data.resenas || []).find(r => r.userId === user._id);
        if (mia) {
          setMiResena(mia);
          setFormEstrellas(mia.estrellas);
          setFormTexto(mia.texto || '');
        }
      }
    } catch {
      toast.error('Error cargando reseñas');
    } finally {
      setCargandoRes(false);
    }
  }, [receta._id, user]);

  useEffect(() => { cargarResenas(1); }, [cargarResenas]);

  // ── Enviar / editar reseña ──
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
      setEditando(false);
      cargarResenas(1);
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al publicar la reseña';
      toast.error(`❌ ${msg}`);
    } finally {
      setEnviando(false);
    }
  };

  const formatFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return ''; }
  };

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modalContenedorReceta" onClick={(e) => e.stopPropagation()}>
        {!verNutriDetalle && (
          <button className="modal-cerrar" onClick={cerrar}>✕</button>
        )}

        {/* ── Columna izquierda ── */}
        <div className="modalCol modalIzq">

          {/* Imagen — solo si existe */}
          {img && (
            <img
              src={img}
              alt={nombre}
              className="modalImg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}

          <h2>{nombre}</h2>
          {desc && <p className="modalDesc">{desc}</p>}

          {/* Ingredientes */}
          {ingredientes.length > 0 && (
            <div className="modalSeccion">
              <h3>Ingredientes</h3>
              <ul>
                {ingredientes.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pasos */}
          {pasos.length > 0 && (
            <div className="modalSeccion">
              <h3>Preparación</h3>
              <ol>
                {pasos.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </div>
          )}

          {/* ── Reseñas ── */}
          <div className="modalSeccion resenas-seccion">

            <div className="resenas-resumen">
              <div className="resenas-prom-grande">
                <span className="prom-numero">{puntosProm > 0 ? puntosProm : '—'}</span>
                <div className="prom-detalle">
                  <Estrellas valor={Math.round(puntosProm)} readonly />
                  <span className="prom-total">
                    {totalResenas > 0
                      ? `${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}`
                      : 'Sin reseñas aún'}
                  </span>
                </div>
              </div>
            </div>

            {estaAutenticado && (
              <div className="resena-form">
                {miResena && !editando ? (
                  <div className="mi-resena">
                    <div className="mi-resena-header">
                      <span className="mi-resena-label">Tu reseña</span>
                      <button className="btn-editar-resena" onClick={() => setEditando(true)}>
                        ✏️ Editar
                      </button>
                    </div>
                    <Estrellas valor={miResena.estrellas} readonly />
                    {miResena.texto && <p className="mi-resena-texto">"{miResena.texto}"</p>}
                  </div>
                ) : (
                  <>
                    <h4>{miResena ? 'Editar tu reseña' : '¿Qué te pareció esta receta?'}</h4>
                    <Estrellas valor={formEstrellas} onChange={setFormEstrellas} />
                    <textarea
                      className="resena-textarea"
                      placeholder="Escribe un comentario (opcional)..."
                      value={formTexto}
                      onChange={(e) => setFormTexto(e.target.value)}
                      maxLength={500}
                      rows={3}
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
                        >
                          Cancelar
                        </button>
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

            {!estaAutenticado && (
              <p className="resena-login-aviso">Inicia sesión para dejar una reseña</p>
            )}

            {/* Lista de reseñas */}
            <div className="resenas-lista">
              {cargandoRes ? (
                <p className="resenas-cargando">Cargando reseñas...</p>
              ) : resenas.length === 0 ? (
                <p className="resenas-vacio">Sé el primero en dejar una reseña</p>
              ) : (
                resenas.map((r) => (
                  <div key={r._id} className={`resena-item ${user && r.userId === user._id ? 'propia' : ''}`}>
                    <div className="resena-item-header">
                      <div className="resena-avatar">
                        {(r.userName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="resena-item-meta">
                        <span className="resena-nombre">{r.userName || 'Usuario'}</span>
                        <span className="resena-fecha">{formatFecha(r.createdAt)}</span>
                      </div>
                      <Estrellas valor={r.estrellas} readonly />
                    </div>
                    {r.texto && <p className="resena-texto">{r.texto}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Paginación */}
            {totalPags > 1 && (
              <div className="resenas-paginacion">
                <button
                  disabled={pagina === 1}
                  onClick={() => { setPagina(p => p - 1); cargarResenas(pagina - 1); }}
                >← Anterior</button>
                <span>{pagina} / {totalPags}</span>
                <button
                  disabled={pagina === totalPags}
                  onClick={() => { setPagina(p => p + 1); cargarResenas(pagina + 1); }}
                >Siguiente →</button>
              </div>
            )}

          </div>
        </div>

        {/* ── Columna derecha: nutrición ── */}
        <div className="modalCol modalDer">
          <NutricionGrafico nutri={nutri} onModalChange={setVerNutriDetalle} />
        </div>

      </div>
    </div>
  );
};

export default DetalleReceta;