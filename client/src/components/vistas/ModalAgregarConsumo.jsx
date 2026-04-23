import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './ModalAgregarConsumo.css';

const SvgDesayuno = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.6"/>
    <line x1="10" y1="1" x2="10" y2="3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="10" y1="16.5" x2="10" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="1" y1="10" x2="3.5" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="16.5" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3.22" y1="3.22" x2="5" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="15" y1="15" x2="16.78" y2="16.78" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="16.78" y1="3.22" x2="15" y2="5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="5" y1="15" x2="3.22" y2="16.78" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const SvgAlmuerzo = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 10 C3 6 6 3.5 10 3.5 C14 3.5 17 6 17 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="1.5" y1="12.5" x2="18.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="10" y1="12.5" x2="10" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="7" y1="16.5" x2="13" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const SvgCena = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13 3.5 C13 3.5 16 6.5 16 10.5 C16 13.5 14 16 11 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M11 3.5 C8 5.5 6 8 6 10.5 C6 13.5 8.5 16 11.5 16 C14.5 16 17 13.5 17 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M4 10.5 C4 7.5 6 5 8.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const SvgSnack = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M10 2.5 C10 2.5 7 5.5 7 8.5 C7 10.16 8.34 11.5 10 11.5 C11.66 11.5 13 10.16 13 8.5 C13 5.5 10 2.5 10 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M6.5 12 C4.8 13 3.5 14.6 3.5 16 C3.5 17.1 4.4 18 5.5 18 L14.5 18 C15.6 18 16.5 17.1 16.5 16 C16.5 14.6 15.2 13 13.5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const SvgTodas = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="2.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="11" y="2.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="2" y="11.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <rect x="11" y="11.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);

const TIPOS_META = {
  todas:    { label: 'Todas',          Icon: SvgTodas    },
  desayuno: { label: 'Desayuno',       Icon: SvgDesayuno },
  almuerzo: { label: 'Almuerzo',       Icon: SvgAlmuerzo },
  cena:     { label: 'Cena',           Icon: SvgCena     },
  snack:    { label: 'Snack / Postre', Icon: SvgSnack    },
};

const CAT_A_TIPO = {
  'desayunos':      'desayuno',
  'almuerzos':      'almuerzo',
  'cenas':          'cena',
  'postres-snacks': 'snack',
};

const ModalAgregarConsumo = ({ fecha, tipoSugerido, cerrar, onAgregado }) => {
  const [busqueda, setBusqueda] = useState('');
  const [recetas,  setRecetas]  = useState([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [filtroVista, setFiltroVista] = useState(tipoSugerido === 'snack' ? 'snack' : 'todas');

  const tipoDestino = tipoSugerido || 'desayuno';

  useEffect(() => {
    const timer = setTimeout(() => buscarRecetas(busqueda), 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => { buscarRecetas(''); }, []);

  const buscarRecetas = async (q) => {
    setCargando(true);
    try {
      const url = q
        ? `/recipes?search=${encodeURIComponent(q)}&limit=50`
        : '/recipes?limit=50';
      const { data } = await api.get(url);
      setRecetas(data.recipes || []);
    } catch {
      setRecetas([]);
    } finally {
      setCargando(false);
    }
  };

  const recetasFiltradas = filtroVista === 'todas'
    ? recetas
    : recetas.filter(r => CAT_A_TIPO[r.cat] === filtroVista || r.cat === filtroVista);

  const handleAgregar = async (recetaId) => {
    setEnviando(true);
    try {
      await api.post('/consumos/manual', { recetaId, tipo: tipoDestino, fecha });
      toast.success(`Añadido al ${TIPOS_META[tipoDestino].label}`);
      onAgregado();
    } catch (err) {
      const msg = err.response?.data?.error;
      if (err.response?.status === 409 && tipoDestino === 'snack') {
        toast.error('Ya tienes 3 snacks o postres registrados hoy');
      } else {
        toast.error(msg || 'Error al agregar');
      }
    } finally {
      setEnviando(false);
    }
  };

  const { Icon: IconDestino } = TIPOS_META[tipoDestino];

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <button className="modal-cerrar" onClick={cerrar}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div className="modal-agregar-consumo" onClick={e => e.stopPropagation()}>
        <h2>Añadir consumo — {fecha}</h2>

        <p className="agr-destino-label">
          <IconDestino className="agr-destino-icon" />
          Se guardará en: <strong>{TIPOS_META[tipoDestino].label}</strong>
        </p>

        {/* Selector filtro visual*/}
        {tipoDestino !== 'snack' && (
          <div className="agr-tipo-selector">
            {['todas', 'desayuno', 'almuerzo', 'cena'].map(t => {
              const { label, Icon } = TIPOS_META[t];
              return (
                <button
                  key={t}
                  className={`agr-tipo-btn ${filtroVista === t ? 'activo' : ''}`}
                  onClick={() => setFiltroVista(t)}
                >
                  <Icon className="agr-tipo-icon" />
                  <span className="agr-tipo-label">{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Buscador sin placeholder */}
        <p className="agr-busqueda-label">Buscar receta</p>
        <div className="agr-busqueda">
          <svg className="agr-lupa-svg" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
            <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            autoFocus
          />
        </div>

        <div className="agr-lista">
          {cargando ? (
            <p className="agr-estado">Buscando...</p>
          ) : recetasFiltradas.length === 0 ? (
            <p className="agr-estado">Sin resultados</p>
          ) : (
            recetasFiltradas.map(r => (
              <div key={r._id} className="agr-receta-item">
                <img src={r.img} alt={r.nombre} />
                <div className="agr-receta-info">
                  <p className="agr-receta-nombre">{r.nombre}</p>
                  <p className="agr-receta-cal">{r.nutri?.cal || 0} kcal</p>
                </div>
                <button
                  className="agr-btn-añadir"
                  onClick={() => handleAgregar(r._id)}
                  disabled={enviando}
                >
                  {enviando ? '...' : '+ Añadir'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarConsumo;