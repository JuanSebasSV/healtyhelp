import React, { useEffect, useState, useCallback } from 'react';
import NutricionGrafico from './NutricionGrafico';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import './DetalleReceta.css';

const Estrellas = ({ valor, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`estrellas-input ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`estrella-ico ${n <= (hover || valor) ? 'llena' : 'vacia'}`}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
    </div>
  );
};

const DetalleReceta = ({ receta, cerrar, abrirNutricion }) => {
  const { user, isAuthenticated } = useAuth();

  const [resenas,       setResenas]       = useState([]);
  const [puntosProm,    setPuntosProm]    = useState(receta.puntosProm   || 0);
  const [totalResenas,  setTotalResenas]  = useState(receta.totalResenas || 0);
  const [cargandoRes,   setCargandoRes]   = useState(true);
  const [pagina,        setPagina]        = useState(1);
  const [totalPags,     setTotalPags]     = useState(1);

  const [miResena,      setMiResena]      = useState(null);
  const [editando,      setEditando]      = useState(false);
  const [formEstrellas, setFormEstrellas] = useState(5);
  const [formTexto,     setFormTexto]     = useState('');
  const [enviando,      setEnviando]      = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const cargarResenas = useCallback(async (pag = 1) => {
    setCargandoRes(true);
    try {
      const { data } = await api.get(`/recipes/${receta._id}/resenas?page=${pag}&limit=5`);
      setResenas(data.resenas);
      setPuntosProm(data.puntosProm);
      setTotalResenas(data.totalResenas);
      setTotalPags(data.pagination.pages);

      if (user) {
        const mia = data.resenas.find(r => r.userId === user._id);
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
      toast.error(`❌ ${error.response?.data?.error || 'Error al publicar la reseña'}`);
    } finally {
      setEnviando(false);
    }
  };

  const formatFecha = (f) => new Date(f).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <div className="modalContenedorReceta" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={cerrar} aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* ── Columna izquierda ── */}
        <div className="modalCol modalIzq">
          <img src={receta.img} alt={receta.nombre} className="modalImg" />
          <h2>{receta.nombre}</h2>
          <p className="modalDesc">{receta.desc}</p>

          <div className="modalSeccion">
            <h3>Ingredientes</h3>
            <ul>
              {receta.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>

          <div className="modalSeccion">
            <h3>Preparación</h3>
            <ol>
              {receta.pasos.map((paso, i) => <li key={i}>{paso}</li>)}
            </ol>
          </div>

          {/* ── Sección reseñas ── */}
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
                      <button className="btn-editar-resena" onClick={() => setEditando(true)}>
                        ✏️ Editar
                      </button>
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

            <div className="resenas-lista">
              {cargandoRes ? (
                <p className="resenas-estado">Cargando reseñas...</p>
              ) : resenas.length === 0 ? (
                <p className="resenas-estado resenas-vacio">
                  Sé el primero en dejar una reseña ✨
                </p>
              ) : (
                resenas.map(r => (
                  <div
                    key={r._id}
                    className={`resena-item ${user && r.userId === user._id ? 'propia' : ''}`}
                  >
                    <div className="resena-item-header">
                      <div className="resena-avatar">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="resena-item-meta">
                        <span className="resena-nombre">{r.userName}</span>
                        <span className="resena-fecha">{formatFecha(r.createdAt)}</span>
                      </div>
                      <Estrellas valor={r.estrellas} readonly />
                    </div>
                    {r.texto && <p className="resena-texto">{r.texto}</p>}
                  </div>
                ))
              )}
            </div>

            {totalPags > 1 && (
              <div className="resenas-paginacion">
                <button
                  disabled={pagina === 1}
                  onClick={() => { const p = pagina - 1; setPagina(p); cargarResenas(p); }}
                >← Anterior</button>
                <span>{pagina} / {totalPags}</span>
                <button
                  disabled={pagina === totalPags}
                  onClick={() => { const p = pagina + 1; setPagina(p); cargarResenas(p); }}
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