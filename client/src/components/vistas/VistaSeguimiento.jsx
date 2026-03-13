import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import DetalleReceta from '../recipe/DetalleReceta';
import ModalNutricionDetallada from '../recipe/ModalNutricionDetallada';
import ModalAgregarConsumo from './ModalAgregarConsumo';
import ResumenNutricional from './ResumenNutricional';
import './VistaSeguimiento.css';

const TIPOS_LABEL  = { desayuno: '🌅 Desayuno', almuerzo: '☀️ Almuerzo', cena: '🌙 Cena' };
const TIPOS_ORDEN  = ['desayuno', 'almuerzo', 'cena'];
const TIPOS_COLOR  = { desayuno: '#f59e0b', almuerzo: '#06b6d4', cena: '#a855f7' };

// ─── Utilidades de fecha ──────────────────────────────────────────────────────
const fechaLegible = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
};

const lunesDeSemana = (fechaStr) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  const dia   = fecha.getDay(); // 0=dom, 1=lun ...
  const diff  = dia === 0 ? -6 : 1 - dia;
  fecha.setDate(fecha.getDate() + diff);
  return fecha.toISOString().split('T')[0];
};

const yearMesDe = (fechaStr) => fechaStr.slice(0, 7);

const mesLegible = (yearMes) => {
  const [y, m] = yearMes.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
};

const semanaLegible = (lunes) => {
  const [y, m, d] = lunes.split('-').map(Number);
  const inicio = new Date(y, m - 1, d);
  const fin    = new Date(y, m - 1, d + 6);
  const opts   = { day: 'numeric', month: 'short' };
  return `${inicio.toLocaleDateString('es-CO', opts)} – ${fin.toLocaleDateString('es-CO', opts)}`;
};

// Sumar todos los campos nutricionales de un array de consumos
const sumarNutri = (consumos) => {
  const base = {};
  consumos.forEach(c => {
    if (!c.nutri) return;
    Object.entries(c.nutri).forEach(([k, v]) => {
      base[k] = (base[k] || 0) + (v || 0);
    });
  });
  // Redondear a 1 decimal
  Object.keys(base).forEach(k => { base[k] = Math.round(base[k] * 10) / 10; });
  return base;
};

// ─────────────────────────────────────────────────────────────────────────────
const VistaSeguimiento = ({ recetas }) => {
  const [periodo, setPeriodo]             = useState('dia');
  const [dias, setDias]                   = useState([]);       // todos los días con consumos
  const [seleccionado, setSeleccionado]   = useState(null);     // día/semana/mes activo
  const [consumos, setConsumos]           = useState([]);
  const [cargando, setCargando]           = useState(true);
  const [editandoId, setEditandoId]       = useState(null);

  // Modal detalle receta
  const [vistaReceta, setVistaReceta]     = useState(null); // null | 'detalle' | 'nutricion'
  const [recetaSelec, setRecetaSelec]     = useState(null);

  // Modal agregar manual
  const [modalAgregar, setModalAgregar]   = useState(null); // null | { fecha, tipo }

  // Cargar días disponibles al montar
  useEffect(() => {
    cargarDias();
  }, []);

  const cargarDias = async () => {
    try {
      const { data } = await api.get('/consumos/dias');
      setDias(data.dias || []);
      if (data.dias?.length > 0) setSeleccionado(data.dias[0]);
    } catch {
      toast.error('Error cargando seguimiento');
    }
  };

  // Opciones del selector según período
  const opciones = useCallback(() => {
    if (periodo === 'dia') return dias;
    if (periodo === 'semana') {
      const semanas = [...new Set(dias.map(lunesDeSemana))];
      return semanas.sort((a, b) => b.localeCompare(a));
    }
    const meses = [...new Set(dias.map(yearMesDe))];
    return meses.sort((a, b) => b.localeCompare(a));
  }, [dias, periodo]);

  // Cargar consumos del período seleccionado
  const cargarConsumos = useCallback(async () => {
    if (!seleccionado) { setConsumos([]); setCargando(false); return; }
    setCargando(true);
    try {
      let data;
      if (periodo === 'dia')    ({ data } = await api.get(`/consumos/dia/${seleccionado}`));
      if (periodo === 'semana') ({ data } = await api.get(`/consumos/semana/${seleccionado}`));
      if (periodo === 'mes')    ({ data } = await api.get(`/consumos/mes/${seleccionado}`));
      setConsumos(data.consumos || []);
    } catch {
      toast.error('Error cargando consumos');
    } finally {
      setCargando(false);
    }
  }, [seleccionado, periodo]);

  useEffect(() => {
    const ops = opciones();
    if (ops.length > 0 && !ops.includes(seleccionado)) {
      setSeleccionado(ops[0]);
    }
  }, [periodo]);

  useEffect(() => { cargarConsumos(); }, [cargarConsumos]);

  // Agrupar consumos por fecha para vista semana/mes
  const consumosPorFecha = useCallback(() => {
    const mapa = {};
    consumos.forEach(c => {
      if (!mapa[c.fechaBogota]) mapa[c.fechaBogota] = [];
      mapa[c.fechaBogota].push(c);
    });
    return mapa;
  }, [consumos]);

  const nutriAcumulado = sumarNutri(consumos);

  // Tipos faltantes en un día
  const tiposFaltantes = (fecha) => {
    const presentes = consumos
      .filter(c => c.fechaBogota === fecha)
      .map(c => c.tipo);
    return TIPOS_ORDEN.filter(t => !presentes.includes(t));
  };

  const handleEditarTipo = async (consumoId, nuevoTipo) => {
    try {
      await api.put(`/consumos/${consumoId}/tipo`, { tipo: nuevoTipo });
      toast.success('✅ Tipo actualizado');
      setEditandoId(null);
      cargarConsumos();
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.error || 'Error al editar'}`);
    }
  };

  const handleEliminar = async (consumoId) => {
    try {
      await api.delete(`/consumos/${consumoId}`);
      toast.success('✅ Consumo eliminado');
      cargarConsumos();
      cargarDias();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const abrirReceta = (consumo) => {
    const recetaCompleta = recetas.find(r => r._id === consumo.recetaId?.toString?.() || r._id === consumo.recetaId);
    if (recetaCompleta) {
      setRecetaSelec(recetaCompleta);
      setVistaReceta('detalle');
    } else {
      toast.info('Receta no disponible en la lista actual');
    }
  };

  // ── Render tarjeta consumo ──
  const TarjetaConsumo = ({ consumo }) => (
    <div className="seg-consumo-card" onClick={() => abrirReceta(consumo)}>
      <div className="seg-consumo-img-wrap">
        <img src={consumo.recetaSnapshot?.img} alt={consumo.recetaSnapshot?.nombre} />
        <span className="seg-consumo-tipo-badge" style={{ background: TIPOS_COLOR[consumo.tipo] }}>
          {TIPOS_LABEL[consumo.tipo]}
        </span>
      </div>
      <div className="seg-consumo-info">
        <p className="seg-consumo-nombre">{consumo.recetaSnapshot?.nombre}</p>
        <p className="seg-consumo-hora">{consumo.horaBogota}</p>
        <p className="seg-consumo-cal">{consumo.nutri?.cal || 0} kcal</p>
      </div>
      <div className="seg-consumo-acciones" onClick={e => e.stopPropagation()}>
        {editandoId === consumo._id ? (
          <div className="seg-tipo-selector">
            {TIPOS_ORDEN.map(t => (
              <button
                key={t}
                className={`seg-tipo-btn ${consumo.tipo === t ? 'activo' : ''}`}
                onClick={() => handleEditarTipo(consumo._id, t)}
              >
                {TIPOS_LABEL[t]}
              </button>
            ))}
            <button className="seg-tipo-cancelar" onClick={() => setEditandoId(null)}>✕</button>
          </div>
        ) : (
          <div className="seg-acciones-row">
            <button className="seg-btn-editar" onClick={() => setEditandoId(consumo._id)}>
              ✏️ Editar tipo
            </button>
            <button className="seg-btn-eliminar" onClick={() => handleEliminar(consumo._id)}>
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Render bloque de un día ──
  const BloquesDia = ({ fecha, consumosDia }) => {
    const faltantes = tiposFaltantes(fecha);
    return (
      <div className="seg-dia-bloque">
        <h3 className="seg-dia-titulo">{fechaLegible(fecha)}</h3>
        <div className="seg-consumos-lista">
          {TIPOS_ORDEN.map(tipo => {
            const c = consumosDia.find(x => x.tipo === tipo);
            if (c) return <TarjetaConsumo key={c._id} consumo={c} />;
            return (
              <div key={tipo} className="seg-consumo-vacio">
                <span className="seg-vacio-label">{TIPOS_LABEL[tipo]}</span>
                <button
                  className="seg-btn-agregar"
                  onClick={() => setModalAgregar({ fecha, tipo })}
                >
                  + Añadir
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const ops = opciones();

  return (
    <div className="vista-seguimiento">
      <h1>Mi Seguimiento</h1>

      {/* ── Selector de período ── */}
      <div className="seg-periodo-btns">
        {['dia', 'semana', 'mes'].map(p => (
          <button
            key={p}
            className={periodo === p ? 'activo' : ''}
            onClick={() => setPeriodo(p)}
          >
            {p === 'dia' ? 'Día' : p === 'semana' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>

      {ops.length === 0 ? (
        <div className="seg-vacio-total">
          <div className="seg-vacio-icono">🍽️</div>
          <p>Aún no has registrado ningún consumo.</p>
          <p>Abre una receta y presiona <strong>"Registrar consumo"</strong> para empezar.</p>
        </div>
      ) : (
        <div className="seg-layout">

          {/* ── Columna izquierda: recetas ── */}
          <div className="seg-col seg-col-izq">

            {/* Selector de día/semana/mes */}
            <div className="seg-selector-scroll">
              {ops.map(op => (
                <button
                  key={op}
                  className={`seg-selector-item ${seleccionado === op ? 'activo' : ''}`}
                  onClick={() => setSeleccionado(op)}
                >
                  {periodo === 'dia'
                    ? fechaLegible(op)
                    : periodo === 'semana'
                    ? `Sem. ${semanaLegible(op)}`
                    : mesLegible(op)}
                </button>
              ))}
            </div>

            {/* Contenido */}
            {cargando ? (
              <p className="seg-estado">Cargando...</p>
            ) : consumos.length === 0 ? (
              <p className="seg-estado">Sin registros para este período.</p>
            ) : periodo === 'dia' ? (
              <div className="seg-dia-bloque">
                <div className="seg-consumos-lista">
                  {TIPOS_ORDEN.map(tipo => {
                    const c = consumos.find(x => x.tipo === tipo);
                    if (c) return <TarjetaConsumo key={c._id} consumo={c} />;
                    return (
                      <div key={tipo} className="seg-consumo-vacio">
                        <span className="seg-vacio-label">{TIPOS_LABEL[tipo]}</span>
                        <button
                          className="seg-btn-agregar"
                          onClick={() => setModalAgregar({ fecha: seleccionado, tipo })}
                        >
                          + Añadir
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              Object.entries(consumosPorFecha())
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([fecha, consumosDia]) => (
                  <BloquesDia key={fecha} fecha={fecha} consumosDia={consumosDia} />
                ))
            )}
          </div>

          {/* ── Columna derecha: nutrición ── */}
          <div className="seg-col seg-col-der">
            <ResumenNutricional
              nutri={nutriAcumulado}
              periodo={periodo}
              seleccionado={seleccionado}
              totalConsumos={consumos.length}
            />
          </div>
        </div>
      )}

      {/* ── Modal detalle receta ── */}
      {vistaReceta === 'detalle' && recetaSelec && (
        <DetalleReceta
          receta={recetaSelec}
          cerrar={() => { setVistaReceta(null); setRecetaSelec(null); }}
          abrirNutricion={() => setVistaReceta('nutricion')}
        />
      )}
      {vistaReceta === 'nutricion' && recetaSelec && (
        <ModalNutricionDetallada
          nutri={recetaSelec.nutri}
          cerrar={() => { setVistaReceta(null); setRecetaSelec(null); }}
          volver={() => setVistaReceta('detalle')}
        />
      )}

      {/* ── Modal agregar consumo manual ── */}
      {modalAgregar && (
        <ModalAgregarConsumo
          fecha={modalAgregar.fecha}
          tipo={modalAgregar.tipo}
          cerrar={() => setModalAgregar(null)}
          onAgregado={() => { cargarConsumos(); cargarDias(); setModalAgregar(null); }}
        />
      )}
    </div>
  );
};

export default VistaSeguimiento;