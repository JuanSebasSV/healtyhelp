// components/recetas/SeccionResenas.jsx
// Componente independiente de reseñas/comentarios.
// Incluye: estrellas, votos, respuestas, y subida de imagen con aprobación admin.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './SeccionResenas.css';

/* ─────────────────────────────────────────────────────────────
   Utilidades
───────────────────────────────────────────────────────────── */
const formatFecha = (f) =>
  new Date(f).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

/* ─────────────────────────────────────────────────────────────
   Estrellas
───────────────────────────────────────────────────────────── */
const Estrellas = ({ valor, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={`sr-estrellas ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          className={`sr-estrella ${n <= (hover || valor) ? 'llena' : 'vacia'}`}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Imagen del comentario
   - Si está aprobada: muestra la imagen real.
   - Si está pendiente y es del propio usuario: muestra placeholder.
   - Si está pendiente y es de otro usuario: no muestra nada.
   - Si está rechazada: no muestra nada para nadie.

   IMPORTANTE: el backend devuelve imagen.estado ('aprobada' | 'pendiente')
   y imagen.url (null si pendiente, URL si aprobada).
───────────────────────────────────────────────────────────── */
const ImagenResena = ({ imagen, esPropia }) => {
  // Sin imagen o rechazada → nada
  if (!imagen) return null;
  if (imagen.estado === 'rechazada') return null;

  const aprobada  = imagen.estado === 'aprobada';
  const pendiente = imagen.estado === 'pendiente';

  // Pendiente y no es del propio usuario → nada
  if (pendiente && !esPropia) return null;

  return (
    <div className="sr-imagen-wrap">
      {aprobada ? (
        <img
          src={imagen.url}
          alt="Imagen del comentario"
          className="sr-imagen"
          loading="lazy"
        />
      ) : (
        /* Placeholder visible solo para el autor */
        <div className="sr-imagen-pendiente">
          <div className="sr-imagen-pendiente-icono">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p className="sr-imagen-pendiente-titulo">Imagen pendiente de aprobación</p>
          <p className="sr-imagen-pendiente-subtitulo">Tiempo aproximado: 3 días</p>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Selector de imagen (solo para comentarios principales nuevos)
───────────────────────────────────────────────────────────── */
const SelectorImagen = ({ imagen, onChange, onRemove }) => {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5 MB');
      return;
    }
    onChange(file);
  };

  return (
    <div className="sr-selector-imagen">
      {!imagen ? (
        <button
          type="button"
          className="sr-btn-adjuntar"
          onClick={() => inputRef.current?.click()}
          title="Adjuntar imagen (requiere aprobación)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Adjuntar imagen
        </button>
      ) : (
        <div className="sr-preview-wrap">
          <img
            src={URL.createObjectURL(imagen)}
            alt="Vista previa"
            className="sr-preview-img"
          />
          <button
            type="button"
            className="sr-btn-quitar-img"
            onClick={onRemove}
            title="Quitar imagen"
          >✕</button>
          <span className="sr-preview-aviso">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Requiere aprobación (≈3 días)
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Sección de respuestas (hilo de un comentario)
   Sin soporte de imagen — solo texto
───────────────────────────────────────────────────────────── */
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
    <div className="sr-resp-seccion">
      <div className="sr-resp-acciones-fila">
        {respuestas.length > 0 && (
          <button className="sr-btn-toggle-resp" onClick={() => setExpandido(v => !v)}>
            {expandido
              ? '▲ Ocultar respuestas'
              : `▼ ${respuestas.length} respuesta${respuestas.length !== 1 ? 's' : ''}`}
          </button>
        )}
        {isAuthenticated && (
          <button className="sr-btn-responder" onClick={() => setRespondiendo(true)}>
            ↩ Responder
          </button>
        )}
      </div>

      {expandido && respuestas.length > 0 && (
        <div className="sr-resp-lista">
          {respuestas.map(rp => (
            <div key={rp._id} className="sr-resp-item">
              <div className="sr-resp-avatar">{rp.userName.charAt(0).toUpperCase()}</div>
              <div className="sr-resp-cuerpo">
                <div className="sr-resp-meta">
                  <span className="sr-resp-nombre">{rp.userName}</span>
                  <span className="sr-resp-fecha">{formatFecha(rp.createdAt)}</span>
                  {isAuthenticated && user &&
                    (rp.userId?.toString() === user._id?.toString() ||
                     rp.userId?.toString() === user.id?.toString() ||
                     user.role === 'admin') && (
                      <button
                        className="sr-btn-borrar-resp"
                        onClick={() => handleBorrar(rp._id)}
                        title="Eliminar respuesta"
                      >🗑️</button>
                    )}
                </div>
                <p className="sr-resp-texto">{rp.texto}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {respondiendo && (
        <div className="sr-resp-form">
          <div className="sr-resp-avatar sr-resp-avatar--yo">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sr-resp-input-wrap">
            <textarea
              className="sr-resp-textarea"
              placeholder="Escribe una respuesta..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              rows={2}
              maxLength={500}
              lang="es"
              spellCheck="true"
              autoFocus
            />
            <div className="sr-resp-actions">
              <button
                className="sr-btn-cancelar-resp"
                onClick={() => { setTexto(''); setRespondiendo(false); }}
                disabled={enviando}
              >Cancelar</button>
              <button
                className="sr-btn-enviar-resp"
                onClick={handleEnviar}
                disabled={enviando || !texto.trim()}
              >{enviando ? '⏳' : '↩ Publicar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL — SeccionResenas
   Props:
     receta        → objeto receta completo
     user          → usuario autenticado (o null)
     isAuthenticated → boolean
───────────────────────────────────────────────────────────── */
const SeccionResenas = ({ receta, user, isAuthenticated }) => {
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
  const [formImagen,    setFormImagen]    = useState(null); // File | null
  const [enviando,      setEnviando]      = useState(false);

  /* ── Cargar reseñas ── */
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

  /* ── Publicar / editar reseña ── */
  const handleSubmitResena = async () => {
    // Validaciones
    if (!formEstrellas) {
      toast.error('Selecciona una puntuación');
      return;
    }
    // Si adjunta imagen, el texto es obligatorio
    if (formImagen && !formTexto.trim()) {
      toast.error('Escribe un comentario para acompañar la imagen');
      return;
    }

    setEnviando(true);
    try {
      let data;

      if (formImagen && !miResena) {
        // Nueva reseña con imagen → multipart/form-data
        const fd = new FormData();
        fd.append('estrellas', formEstrellas);
        fd.append('texto', formTexto.trim());
        fd.append('imagen', formImagen);
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }));
      } else if (miResena) {
        // Editar reseña existente
        ({ data } = await api.put(`/recipes/${receta._id}/resenas`, {
          estrellas: formEstrellas,
          texto:     formTexto.trim(),
        }));
      } else {
        // Nueva reseña sin imagen
        ({ data } = await api.post(`/recipes/${receta._id}/resenas`, {
          estrellas: formEstrellas,
          texto:     formTexto.trim(),
        }));
      }

      toast.success(miResena ? '✅ Reseña actualizada' : '✅ Reseña publicada');
      setPuntosProm(data.puntosProm);
      setTotalResenas(data.totalResenas);
      setMiResena(data.resena);
      setFormEstrellas(data.resena.estrellas);
      setFormTexto(data.resena.texto || '');
      setFormImagen(null);
      setEditando(false);
      cargarResenas(pagina, orden);
    } catch (error) {
      toast.error(`❌ ${error.response?.data?.error || 'Error al publicar la reseña'}`);
    } finally {
      setEnviando(false);
    }
  };

  /* ── Borrar reseña ── */
  const handleBorrarResena = async (resenaId) => {
    if (!window.confirm('¿Eliminar esta reseña? No se puede deshacer.')) return;
    try {
      await api.delete(`/recipes/${receta._id}/resenas/${resenaId}`);
      toast.success('Reseña eliminada');
      setMiResena(null);
      setFormEstrellas(5);
      setFormTexto('');
      setFormImagen(null);
      setEditando(false);
      cargarResenas(1, orden);
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al borrar'}`);
    }
  };

  /* ── Votar ── */
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

  /* ── Render ── */
  return (
    <div className="sr-seccion">

      {/* Resumen puntuación */}
      <div className="sr-resumen">
        <span className="sr-prom-numero">
          {puntosProm > 0 ? puntosProm : '—'}
        </span>
        <div className="sr-prom-detalle">
          <Estrellas valor={Math.round(puntosProm)} readonly />
          <span className="sr-total-txt">
            {totalResenas > 0
              ? `${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}`
              : 'Sin reseñas aún'}
          </span>
        </div>
      </div>

      {/* Formulario / mi reseña */}
      {isAuthenticated && (
        <div className="sr-form">
          {miResena && !editando ? (
            <div className="sr-mi-resena-card">
              <div className="sr-mi-resena-header">
                <span className="sr-mi-resena-label">Tu reseña</span>
                <div className="sr-mi-resena-acciones">
                  <button className="sr-btn-editar" onClick={() => setEditando(true)}>
                    ✏️ Editar
                  </button>
                  <button className="sr-btn-borrar" onClick={() => handleBorrarResena(miResena._id)}>
                    🗑️ Borrar
                  </button>
                </div>
              </div>
              <Estrellas valor={miResena.estrellas} readonly />
              {miResena.texto && (
                <p className="sr-mi-resena-texto">"{miResena.texto}"</p>
              )}
              {/* Imagen propia pendiente o aprobada */}
              <ImagenResena imagen={miResena.imagen} esPropia />
            </div>
          ) : (
            <>
              <h4 className="sr-form-titulo">
                {miResena ? 'Editar tu reseña' : '¿Qué te pareció esta receta?'}
              </h4>
              <Estrellas valor={formEstrellas} onChange={setFormEstrellas} />
              <textarea
                className="sr-textarea"
                placeholder={
                  formImagen
                    ? 'Escribe un comentario (obligatorio con imagen)...'
                    : 'Escribe un comentario (opcional)...'
                }
                value={formTexto}
                onChange={e => setFormTexto(e.target.value)}
                maxLength={500}
                rows={3}
                lang="es"
                spellCheck="true"
              />

              {/* Selector de imagen — solo en comentarios nuevos, no al editar */}
              {!miResena && (
                <SelectorImagen
                  imagen={formImagen}
                  onChange={setFormImagen}
                  onRemove={() => setFormImagen(null)}
                />
              )}

              {/* En modo editar: mostrar imagen existente (pendiente/aprobada) con opción de quitar */}
              {miResena && miResena.imagen && miResena.imagen.estado !== 'rechazada' && (
                <div className="sr-edit-imagen-wrap">
                  <ImagenResena imagen={miResena.imagen} esPropia />
                  <button
                    type="button"
                    className="sr-btn-quitar-img sr-btn-quitar-img-edit"
                    onClick={async () => {
                      if (!window.confirm('¿Quitar la imagen de esta reseña?')) return;
                      try {
                        await api.delete(`/recipes/${receta._id}/resenas/imagen`);
                        setMiResena(prev => ({ ...prev, imagen: null }));
                        toast.success('Imagen eliminada');
                      } catch (e) {
                        toast.error(`❌ ${e.response?.data?.error || 'Error al quitar imagen'}`);
                      }
                    }}
                  >
                    ✕ Quitar imagen
                  </button>
                  <p className="sr-preview-aviso" style={{marginTop:"6px"}}>
                    Para subir una nueva imagen, crea una nueva reseña.
                  </p>
                </div>
              )}

              <div className="sr-form-actions">
                {miResena && (
                  <button
                    className="sr-btn-cancelar"
                    onClick={() => {
                      setEditando(false);
                      setFormEstrellas(miResena.estrellas);
                      setFormTexto(miResena.texto || '');
                      setFormImagen(null);
                    }}
                    disabled={enviando}
                  >Cancelar</button>
                )}
                <button
                  className="sr-btn-enviar"
                  onClick={handleSubmitResena}
                  disabled={
                    enviando ||
                    !formEstrellas ||
                    // Si hay imagen adjunta, bloquear hasta que haya texto
                    (!!formImagen && !formTexto.trim())
                  }
                >
                  {enviando
                    ? '⏳ Guardando...'
                    : miResena ? '💾 Guardar cambios' : '📝 Publicar reseña'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!isAuthenticated && (
        <p className="sr-login-aviso">
          <span>🔒</span> Inicia sesión para dejar una reseña
        </p>
      )}

      {/* Filtro orden */}
      <div className="sr-filtro">
        <span className="sr-filtro-label">Ordenar por:</span>
        <div className="sr-filtro-btns">
          <button
            className={`sr-btn-orden ${orden === 'reciente' ? 'activo' : ''}`}
            onClick={() => cambiarOrden('reciente')}
          >🕐 Más recientes</button>
          <button
            className={`sr-btn-orden ${orden === 'relevancia' ? 'activo' : ''}`}
            onClick={() => cambiarOrden('relevancia')}
          >👍 Más relevantes</button>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="sr-lista">
        {cargandoRes ? (
          <p className="sr-estado">Cargando reseñas...</p>
        ) : resenas.length === 0 ? (
          <p className="sr-estado sr-vacio">Sé el primero en dejar una reseña ✨</p>
        ) : (
          resenas.map(r => {
            const esPropia = user && (
              r.userId?.toString() === user._id?.toString() ||
              r.userId?.toString() === user.id?.toString()
            );
            const esAdmin = user?.role === 'admin';
            return (
              <div key={r._id} className={`sr-item ${esPropia ? 'propia' : ''}`}>

                <div className="sr-item-header">
                  <div className="sr-avatar">
                    {r.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="sr-item-meta">
                    <span className="sr-nombre">{r.userName}</span>
                    <span className="sr-fecha">{formatFecha(r.createdAt)}</span>
                  </div>
                  <Estrellas valor={r.estrellas} readonly />
                  {isAuthenticated && (esPropia || esAdmin) && (
                    <button
                      className="sr-btn-borrar-lista"
                      onClick={() => handleBorrarResena(r._id)}
                      title="Eliminar reseña"
                    >🗑️</button>
                  )}
                </div>

                {r.texto && <p className="sr-texto">{r.texto}</p>}

                {/* Imagen del comentario */}
                <ImagenResena imagen={r.imagen} esPropia={!!esPropia} />

                {/* Votos */}
                <div className="sr-votos">
                  <span className="sr-votos-label">¿Te resultó útil?</span>
                  <button
                    className={`sr-btn-voto sr-like ${r.miVoto === 'like' ? 'activo' : ''}`}
                    onClick={() => handleVotar(r._id, 'like')}
                    title="Es útil"
                  >👍 <span>{r.likes}</span></button>
                  <button
                    className={`sr-btn-voto sr-dislike ${r.miVoto === 'dislike' ? 'activo' : ''}`}
                    onClick={() => handleVotar(r._id, 'dislike')}
                    title="No es útil"
                  >👎 <span>{r.dislikes}</span></button>
                </div>

                {/* Respuestas */}
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

      {/* Paginación */}
      {totalPags > 1 && (
        <div className="sr-paginacion">
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
  );
};

export default SeccionResenas;