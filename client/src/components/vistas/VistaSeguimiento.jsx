import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import DetalleReceta from '../recipe/DetalleReceta';
import ModalNutricionDetallada from '../recipe/ModalNutricionDetallada';
import ModalAgregarConsumo from './ModalAgregarConsumo';
import ResumenNutricional from './ResumenNutricional';
import PanelRecomendaciones from './PanelRecomendaciones';
import './VistaSeguimiento.css';

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

const IcoDesayuno = ({ className }) => (
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

const IcoAlmuerzo = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 10 C3 6 6 3.5 10 3.5 C14 3.5 17 6 17 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="1.5" y1="12.5" x2="18.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="10" y1="12.5" x2="10" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="7" y1="16.5" x2="13" y2="16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IcoCena = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M15.5 10.5 C15.5 14.09 12.59 17 9 17 C5.41 17 2.5 14.09 2.5 10.5 C2.5 6.91 5.41 4 9 4 C8.2 5.18 7.75 6.59 7.75 8.12 C7.75 12.09 10.91 15.25 14.88 15.25 C15.1 15.25 15.3 15.24 15.5 15.22 C15.5 15.22 15.5 10.5 15.5 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);

const IcoSnack = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2.5" y="5.5" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
    <line x1="2.5" y1="9" x2="17.5" y2="9" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="2.5" y1="12.5" x2="17.5" y2="12.5" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="7.5" y1="5.5" x2="7.5" y2="15.5" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="12.5" y1="5.5" x2="12.5" y2="15.5" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

const IcoPlato = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M4 10 C4 6.69 6.69 4 10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IcoLapiz = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13.5 3.5 L16.5 6.5 L7 16 L3.5 16.5 L4 13 L13.5 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <line x1="11" y1="6" x2="14" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const IcoBasura = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <line x1="3" y1="5.5" x2="17" y2="5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M7 5.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M5 5.5 L5.8 16a1 1 0 0 0 1 .97h6.4a1 1 0 0 0 1-.97L15 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

// ─── Metadata estática ────────────────────────────────────────────────────────

const TIPOS_META = {
  desayuno: { label: 'Desayuno',       Icon: IcoDesayuno, placeholder: 'Añadir desayuno'       },
  almuerzo: { label: 'Almuerzo',       Icon: IcoAlmuerzo, placeholder: 'Añadir almuerzo'       },
  cena:     { label: 'Cena',           Icon: IcoCena,     placeholder: 'Añadir cena'           },
  snack:    { label: 'Snack / Postre', Icon: IcoSnack,    placeholder: 'Añadir snack o postre' },
};

const TIPOS_LABEL = { desayuno: 'Desayuno', almuerzo: 'Almuerzo', cena: 'Cena', snack: 'Snack / Postre' };
const TIPOS_ORDEN = ['desayuno', 'almuerzo', 'cena', 'snack'];
const TIPOS_COLOR = { desayuno: '#f59e0b', almuerzo: '#06b6d4', cena: '#a855f7', snack: '#10b981' };
const MAX_SNACKS  = 3;

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
  const dia   = fecha.getDay();
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
  return `${inicio.toLocaleDateString('es-CO', opts)} - ${fin.toLocaleDateString('es-CO', opts)}`;
};

const sumarNutri = (consumos) => {
  const base = {};
  consumos.forEach(c => {
    if (!c.nutri) return;
    Object.entries(c.nutri).forEach(([k, v]) => {
      base[k] = (base[k] || 0) + (v || 0);
    });
  });
  Object.keys(base).forEach(k => { base[k] = Math.round(base[k] * 10) / 10; });
  return base;
};

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * VistaSeguimiento
 *
 * Ya NO recibe `filtros` como prop.
 * PanelRecomendaciones es completamente autónomo: se conecta directamente
 * a /api/recomendaciones que lee la BD sin pasar por el cliente.
 */
const VistaSeguimiento = ({ recetas, versionFiltros = 0 }) => {
  const [periodo,      setPeriodo]      = useState('dia');
  const [dias,         setDias]         = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [consumos,     setConsumos]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [editandoId,   setEditandoId]   = useState(null);

  const [vistaReceta,  setVistaReceta]  = useState(null);
  const [recetaSelec,  setRecetaSelec]  = useState(null);

  const [modalAgregar, setModalAgregar] = useState(null);

  const eliminandoRef = useRef(new Set());

  useEffect(() => { cargarDias(); }, []);

  const cargarDias = async () => {
    try {
      const { data } = await api.get('/consumos/dias');
      setDias(data.dias || []);
      if (data.dias?.length > 0) setSeleccionado(p => p || data.dias[0]);
    } catch {
      toast.error('Error cargando seguimiento');
    }
  };

  const opciones = useCallback(() => {
    if (periodo === 'dia')    return dias;
    if (periodo === 'semana') {
      const semanas = [...new Set(dias.map(lunesDeSemana))];
      return semanas.sort((a, b) => b.localeCompare(a));
    }
    const meses = [...new Set(dias.map(yearMesDe))];
    return meses.sort((a, b) => b.localeCompare(a));
  }, [dias, periodo]);

  const cargarConsumos = async (fechaSel = seleccionado, per = periodo) => {
    if (!fechaSel) { setConsumos([]); setCargando(false); return; }
    setCargando(true);
    try {
      let data;
      if (per === 'dia')    ({ data } = await api.get(`/consumos/dia/${fechaSel}`));
      if (per === 'semana') ({ data } = await api.get(`/consumos/semana/${fechaSel}`));
      if (per === 'mes')    ({ data } = await api.get(`/consumos/mes/${fechaSel}`));
      setConsumos(data.consumos || []);
    } catch {
      toast.error('Error cargando consumos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const ops = opciones();
    if (ops.length > 0 && !ops.includes(seleccionado)) {
      setSeleccionado(ops[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, dias]);

  useEffect(() => {
    if (seleccionado) cargarConsumos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionado, periodo]);

  const consumosPorFecha = useCallback(() => {
    const mapa = {};
    consumos.forEach(c => {
      if (!mapa[c.fechaBogota]) mapa[c.fechaBogota] = [];
      mapa[c.fechaBogota].push(c);
    });
    return mapa;
  }, [consumos]);

  const nutriAcumulado = sumarNutri(consumos);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleEditarTipo = async (consumoId, nuevoTipo) => {
    try {
      await api.put(`/consumos/${consumoId}/tipo`, { tipo: nuevoTipo });
      toast.success('Tipo actualizado');
      setEditandoId(null);
      cargarConsumos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al editar');
    }
  };

  const handleEliminar = async (id) => {
    if (eliminandoRef.current.has(id)) return;
    eliminandoRef.current.add(id);
    setConsumos(p => p.filter(c => c._id !== id));
    try {
      await api.delete(`/consumos/${id}`);
      cargarDias();
    } catch {
      toast.error('Error al eliminar');
      cargarConsumos();
    } finally {
      eliminandoRef.current.delete(id);
    }
  };

  const abrirReceta = (consumo) => {
    const recetaCompleta = recetas.find(
      r => r._id === consumo.recetaId?.toString?.() || r._id === consumo.recetaId
    );
    if (recetaCompleta) {
      setRecetaSelec(recetaCompleta);
      setVistaReceta('detalle');
    } else {
      toast.info('Receta no disponible en la lista actual');
    }
  };

  // ── Sub-componentes ────────────────────────────────────────────────────────

  const TarjetaConsumo = ({ consumo }) => (
    <div className="seg-consumo-card" onClick={() => abrirReceta(consumo)}>
      <div className="seg-consumo-img-wrap">
        <img src={consumo.recetaSnapshot?.img} alt={consumo.recetaSnapshot?.nombre} />
        <span
          className="seg-consumo-tipo-badge"
          style={{ background: TIPOS_COLOR[consumo.tipo] }}
        >
          {TIPOS_LABEL[consumo.tipo]}
        </span>
      </div>
      <div className="seg-consumo-info">
        <p className="seg-consumo-nombre">{consumo.recetaSnapshot?.nombre || 'Consumo manual'}</p>
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
            <button className="seg-tipo-cancelar" onClick={() => setEditandoId(null)}>x</button>
          </div>
        ) : (
          <div className="seg-acciones-row">
            <button className="seg-btn-editar" onClick={() => setEditandoId(consumo._id)}>
              <IcoLapiz className="seg-btn-ico" /> Editar tipo
            </button>
            <button className="seg-btn-eliminar" onClick={() => handleEliminar(consumo._id)}>
              <IcoBasura className="seg-btn-ico" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const SeccionTipo = ({ tipo, consumosDia, fecha }) => {
    const { label, Icon, placeholder } = TIPOS_META[tipo];
    const c = consumosDia.find(x => x.tipo === tipo);
    return (
      <div className="seg-tipo-seccion">
        <p className="seg-snacks-titulo"><Icon className="seg-tipo-ico" />{label}</p>
        {c ? (
          <TarjetaConsumo consumo={c} />
        ) : (
          <div className="seg-consumo-vacio">
            <span className="seg-vacio-label"><Icon className="seg-tipo-ico" />{placeholder}</span>
            <button
              className="seg-btn-agregar"
              onClick={() => setModalAgregar({ fecha, tipo })}
            >
              + Añadir
            </button>
          </div>
        )}
      </div>
    );
  };

  const SeccionSnacks = ({ consumosDia, fecha }) => {
    const snacks = consumosDia.filter(c => c.tipo === 'snack');
    const vacios = MAX_SNACKS - snacks.length;
    return (
      <div className="seg-tipo-seccion">
        <p className="seg-snacks-titulo"><IcoSnack className="seg-tipo-ico" />{TIPOS_LABEL.snack}</p>
        {snacks.map(c => <TarjetaConsumo key={c._id} consumo={c} />)}
        {vacios > 0 && (
          <div className="seg-consumo-vacio">
            <span className="seg-vacio-label">
              <IcoSnack className="seg-tipo-ico" />
              {snacks.length === 0 ? 'Añadir snack o postre' : `+ ${vacios} snack${vacios > 1 ? 's' : ''} más`}
            </span>
            <button
              className="seg-btn-agregar"
              onClick={() => setModalAgregar({ fecha, tipo: 'snack' })}
            >
              + Añadir
            </button>
          </div>
        )}
        {vacios === 0 && (
          <p className="seg-snacks-limite">Límite de {MAX_SNACKS} snacks alcanzado</p>
        )}
      </div>
    );
  };

  const BloquesDia = ({ fecha, consumosDia }) => (
    <div className="seg-dia-bloque">
      <h3 className="seg-dia-titulo">{fechaLegible(fecha)}</h3>
      <div className="seg-consumos-lista">
        {['desayuno', 'almuerzo', 'cena'].map(t => (
          <SeccionTipo key={t} tipo={t} consumosDia={consumosDia} fecha={fecha} />
        ))}
        <SeccionSnacks consumosDia={consumosDia} fecha={fecha} />
      </div>
    </div>
  );

  const BloquesDiaActual = () => (
    <div className="seg-dia-bloque">
      <div className="seg-consumos-lista">
        {['desayuno', 'almuerzo', 'cena'].map(t => (
          <SeccionTipo key={t} tipo={t} consumosDia={consumos} fecha={seleccionado} />
        ))}
        <SeccionSnacks consumosDia={consumos} fecha={seleccionado} />
      </div>
    </div>
  );

  const ops = opciones();

  return (
    <div className="vista-seguimiento">
      <h1>Mi Seguimiento</h1>

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
          <div className="seg-vacio-icono"><IcoPlato className="seg-plato-svg" /></div>
          <p>Aún no has registrado ningún consumo.</p>
          <p>Abre una receta y presiona <strong>"Registrar consumo"</strong> para empezar.</p>
        </div>
      ) : (
        <div className="seg-layout">
          <div className="seg-col seg-col-izq">
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

            {cargando ? (
              <p className="seg-estado">Cargando...</p>
            ) : consumos.length === 0 ? (
              <p className="seg-estado">Sin registros para este periodo.</p>
            ) : periodo === 'dia' ? (
              <BloquesDiaActual />
            ) : (
              Object.entries(consumosPorFecha())
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([fecha, consumosDia]) => (
                  <BloquesDia key={fecha} fecha={fecha} consumosDia={consumosDia} />
                ))
            )}
          </div>

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

      {/*
        PanelRecomendaciones es autónomo:
        - Se conecta directamente a /api/recomendaciones
        - Lee condiciones + categorias + nutrientes desde BD
        - No necesita props del padre
      */}
      <PanelRecomendaciones versionFiltros={versionFiltros} />

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