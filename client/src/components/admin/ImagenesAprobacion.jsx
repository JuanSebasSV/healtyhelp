// components/admin/ImagenesAprobacion.jsx
// Panel administrativo para gestión de imágenes subidas en reseñas.
// Permite ver, aprobar y rechazar imágenes pendientes de moderación.

import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './ImagenesAprobacion.css';

const ESTADOS = {
  pendiente: { label: 'Pendientes',  color: 'naranja' },
  aprobada:  { label: 'Aprobadas',   color: 'verde'   },
  rechazada: { label: 'Rechazadas',  color: 'rojo'    },
};

const ImagenesAprobacion = () => {
  const [imagenes,     setImagenes]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [filtro,       setFiltro]       = useState('pendiente');
  const [totalPorEstado, setTotalPorEstado] = useState({ pendiente: 0, aprobada: 0, rechazada: 0 });
  const [procesando,   setProcesando]   = useState(null); // id en proceso
  const [imagenModal,  setImagenModal]  = useState(null); // imagen a ver en grande

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [pendRes, aprobRes, rechRes] = await Promise.all([
        api.get('/admin/imagenes-resenas?estado=pendiente&limit=100'),
        api.get('/admin/imagenes-resenas?estado=aprobada&limit=100'),
        api.get('/admin/imagenes-resenas?estado=rechazada&limit=100'),
      ]);

      setTotalPorEstado({
        pendiente: pendRes.data.pagination?.total ?? 0,
        aprobada:  aprobRes.data.pagination?.total ?? 0,
        rechazada: rechRes.data.pagination?.total ?? 0,
      });

      const mapaItems = {
        pendiente: pendRes.data.items  ?? [],
        aprobada:  aprobRes.data.items ?? [],
        rechazada: rechRes.data.items  ?? [],
      };

      // Normalizar campos para que coincidan con lo que espera el JSX
      setImagenes(
        (mapaItems[filtro] ?? []).map(img => ({
          _id:             `${img.recipeId}_${img.resenaId}`,
          recipeId:        img.recipeId,
          resenaId:        img.resenaId,
          url:             img.imagenUrl,
          estado:          img.imagenEstado,
          userName:        img.userName,
          recetaNombre:    img.recipeNombre,
          comentarioTexto: img.texto,
          creadoEn:        img.createdAt,
        }))
      );
    } catch (error) {
      toast.error('Error cargando imágenes');
      console.error(error);
    } finally {
      setCargando(false);
    }
  }, [filtro]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleAprobar = async (id) => {
    const img = imagenes.find(i => i._id === id);
    if (!img) return;
    setProcesando(id);
    try {
      await api.put(`/admin/imagenes-resenas/${img.recipeId}/${img.resenaId}/aprobar`);
      toast.success('✅ Imagen aprobada');
      cargar();
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al aprobar'}`);
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm('¿Rechazar esta imagen? Se eliminará de Cloudinary.')) return;
    const img = imagenes.find(i => i._id === id);
    if (!img) return;
    setProcesando(id);
    try {
      await api.put(`/admin/imagenes-resenas/${img.recipeId}/${img.resenaId}/rechazar`);
      toast.success('Imagen rechazada y eliminada');
      cargar();
    } catch (e) {
      toast.error(`❌ ${e.response?.data?.error || 'Error al rechazar'}`);
    } finally {
      setProcesando(null);
    }
  };

  const formatFecha = (f) =>
    new Date(f).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="ia-contenedor">

      {/* Cabecera con contadores */}
      <div className="ia-cabecera">
        <div className="ia-titulo-wrap">
          <h2 className="ia-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Aprobación de imágenes
          </h2>
          <p className="ia-subtitulo">
            Modera las imágenes subidas por usuarios en sus reseñas
          </p>
        </div>

        {/* Badges de conteo */}
        <div className="ia-contadores">
          <div className="ia-contador ia-contador--naranja">
            <span className="ia-contador-num">{totalPorEstado.pendiente}</span>
            <span className="ia-contador-label">Pendientes</span>
          </div>
          <div className="ia-contador ia-contador--verde">
            <span className="ia-contador-num">{totalPorEstado.aprobada}</span>
            <span className="ia-contador-label">Aprobadas</span>
          </div>
          <div className="ia-contador ia-contador--rojo">
            <span className="ia-contador-num">{totalPorEstado.rechazada}</span>
            <span className="ia-contador-label">Rechazadas</span>
          </div>
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="ia-filtros">
        {Object.entries(ESTADOS).map(([key, { label }]) => (
          <button
            key={key}
            className={`ia-filtro-btn ia-filtro-btn--${ESTADOS[key].color} ${filtro === key ? 'activo' : ''}`}
            onClick={() => setFiltro(key)}
          >
            {label}
            {totalPorEstado[key] > 0 && (
              <span className="ia-badge">{totalPorEstado[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {cargando ? (
        <div className="ia-loading">
          <div className="ia-spinner" />
          <p>Cargando imágenes...</p>
        </div>
      ) : imagenes.length === 0 ? (
        <div className="ia-vacio">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>No hay imágenes {ESTADOS[filtro].label.toLowerCase()} en este momento</p>
        </div>
      ) : (
        <div className="ia-grid">
          {imagenes.map(img => (
            <div key={img._id} className={`ia-card ia-card--${ESTADOS[img.estado]?.color || 'naranja'}`}>

              {/* Imagen */}
              <div
                className="ia-card-img-wrap"
                onClick={() => setImagenModal(img)}
                title="Ver imagen completa"
              >
                <img
                  src={img.url}
                  alt="Imagen de reseña"
                  className="ia-card-img"
                  loading="lazy"
                />
                <div className="ia-card-img-overlay">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                  Ver imagen
                </div>
              </div>

              {/* Info */}
              <div className="ia-card-info">
                <div className="ia-card-meta">
                  <span className="ia-card-usuario">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {img.userName}
                  </span>
                  <span className="ia-card-fecha">{formatFecha(img.creadoEn)}</span>
                </div>

                {img.recetaNombre && (
                  <p className="ia-card-receta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
                      <path d="M7 2v20"/>
                    </svg>
                    {img.recetaNombre}
                  </p>
                )}

                {img.comentarioTexto && (
                  <p className="ia-card-comentario">"{img.comentarioTexto}"</p>
                )}

                {/* Estado badge */}
                <span className={`ia-estado-badge ia-estado-badge--${ESTADOS[img.estado]?.color || 'naranja'}`}>
                  {img.estado === 'pendiente' && '⏳ Pendiente'}
                  {img.estado === 'aprobada'  && '✅ Aprobada'}
                  {img.estado === 'rechazada' && '❌ Rechazada'}
                </span>
              </div>

              {/* Acciones */}
              {img.estado === 'pendiente' && (
                <div className="ia-card-acciones">
                  <button
                    className="ia-btn-aprobar"
                    onClick={() => handleAprobar(img._id)}
                    disabled={procesando === img._id}
                  >
                    {procesando === img._id ? '⏳' : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Aprobar
                      </>
                    )}
                  </button>
                  <button
                    className="ia-btn-rechazar"
                    onClick={() => handleRechazar(img._id)}
                    disabled={procesando === img._id}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    Rechazar
                  </button>
                </div>
              )}

              {img.estado !== 'pendiente' && (
                <div className="ia-card-acciones">
                  <button
                    className="ia-btn-revertir"
                    onClick={() => handleAprobar(img._id)}
                    disabled={procesando === img._id}
                    title={img.estado === 'aprobada' ? 'Ya está aprobada' : 'Aprobar de todas formas'}
                  >
                    ↩ Cambiar estado
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal imagen completa */}
      {imagenModal && (
        <div className="ia-modal-overlay" onClick={() => setImagenModal(null)}>
          <div className="ia-modal-contenido" onClick={e => e.stopPropagation()}>
            <button className="ia-modal-cerrar" onClick={() => setImagenModal(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <img src={imagenModal.url} alt="Vista completa" className="ia-modal-img" />
            <div className="ia-modal-info">
              <span className="ia-card-usuario">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {imagenModal.userName}
              </span>
              {imagenModal.recetaNombre && (
                <span className="ia-card-receta"> — {imagenModal.recetaNombre}</span>
              )}
            </div>
            {imagenModal.estado === 'pendiente' && (
              <div className="ia-modal-acciones">
                <button
                  className="ia-btn-aprobar"
                  onClick={() => { handleAprobar(imagenModal._id); setImagenModal(null); }}
                  disabled={procesando === imagenModal._id}
                >
                  ✅ Aprobar imagen
                </button>
                <button
                  className="ia-btn-rechazar"
                  onClick={() => { handleRechazar(imagenModal._id); setImagenModal(null); }}
                  disabled={procesando === imagenModal._id}
                >
                  ❌ Rechazar imagen
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ImagenesAprobacion;
