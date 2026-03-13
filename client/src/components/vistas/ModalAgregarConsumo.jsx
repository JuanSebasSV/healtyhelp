import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './ModalAgregarConsumo.css';

const TIPOS_LABEL = { desayuno: '🌅 Desayuno', almuerzo: '☀️ Almuerzo', cena: '🌙 Cena' };

const ModalAgregarConsumo = ({ fecha, tipo, cerrar, onAgregado }) => {
  const [busqueda, setBusqueda]   = useState('');
  const [recetas, setRecetas]     = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [enviando, setEnviando]   = useState(false);
  const [tipoSel, setTipoSel]     = useState(tipo);

  useEffect(() => {
    const timer = setTimeout(() => buscarRecetas(busqueda), 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    buscarRecetas('');
  }, []);

  const buscarRecetas = async (q) => {
    setCargando(true);
    try {
      const url = q ? `/recipes?search=${encodeURIComponent(q)}&limit=20` : '/recipes?limit=20';
      const { data } = await api.get(url);
      setRecetas(data.recipes || []);
    } catch {
      setRecetas([]);
    } finally {
      setCargando(false);
    }
  };

  const handleAgregar = async (recetaId) => {
    setEnviando(true);
    try {
      await api.post('/consumos/manual', { recetaId, tipo: tipoSel, fecha });
      toast.success('✅ Consumo agregado');
      onAgregado();
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.error || 'Error al agregar'}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={cerrar}>
      <button className="modal-cerrar" onClick={cerrar}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <div className="modal-agregar-consumo" onClick={e => e.stopPropagation()}>
        <h2>Añadir consumo — {fecha}</h2>

        {/* Selector tipo */}
        <div className="agr-tipo-selector">
          {['desayuno', 'almuerzo', 'cena'].map(t => (
            <button
              key={t}
              className={`agr-tipo-btn ${tipoSel === t ? 'activo' : ''}`}
              onClick={() => setTipoSel(t)}
            >
              {TIPOS_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="agr-busqueda">
          <span className="agr-lupa">🔍</span>
          <input
            type="text"
            placeholder="Buscar receta..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            autoFocus
          />
        </div>

        {/* Lista de recetas */}
        <div className="agr-lista">
          {cargando ? (
            <p className="agr-estado">Buscando...</p>
          ) : recetas.length === 0 ? (
            <p className="agr-estado">Sin resultados</p>
          ) : (
            recetas.map(r => (
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
                  {enviando ? '⏳' : '+ Añadir'}
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