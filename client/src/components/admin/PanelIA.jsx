import { useState, useEffect, useCallback, memo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './PanelIA.css';

const MetricCard = memo(({ num, lbl, accent = false }) => (
  <div className={`panel-ia__card${accent ? ' panel-ia__card--accent' : ''}`}>
    <div className="panel-ia__card-num">{num}</div>
    <div className="panel-ia__card-lbl">{lbl}</div>
  </div>
));
MetricCard.displayName = 'MetricCard';

const IcoRobot = memo(() => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(180,230,140,0.95)" strokeWidth="2">
    <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/><path d="M20 14h2"/>
    <path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
));
IcoRobot.displayName = 'IcoRobot';

const IcoInfo = memo(() => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
));
IcoInfo.displayName = 'IcoInfo';

const IcoSave = memo(() => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
));
IcoSave.displayName = 'IcoSave';

// PanelIA
const PanelIA = () => {
  const [prompt,        setPrompt]        = useState('');
  const [guardando,     setGuardando]     = useState(false);
  const [cargando,      setCargando]      = useState(true);
  const [totalUsuarios, setTotalUsuarios] = useState('–');

  useEffect(() => {
    let cancelled = false;

    const cargarPrompt = async () => {
      try {
        const res = await api.get('/chat/prompt');
        if (!cancelled) setPrompt(res.data.prompt || '');
      } catch {
        if (!cancelled) toast.error('Error cargando el prompt');
      }
    };

    const cargarUsuarios = async () => {
      try {
        const res  = await api.get('/users');
        const data = res.data;
        if (!cancelled) {
          const total = Array.isArray(data)
            ? data.length
            : (data.total ?? data.count ?? '–');
          setTotalUsuarios(total);
        }
      } catch {
        if (!cancelled) setTotalUsuarios('–');
      }
    };

    Promise.all([cargarPrompt(), cargarUsuarios()])
      .finally(() => { if (!cancelled) setCargando(false); });

    return () => { cancelled = true; };
  }, []);

  const guardarPrompt = useCallback(async () => {
    setGuardando(true);
    try {
      await api.put('/chat/prompt', { prompt });
      toast.success('Instrucciones de la IA actualizadas correctamente');
    } catch {
      toast.error('Error guardando el prompt');
    } finally {
      setGuardando(false);
    }
  }, [prompt]);

  const handlePromptChange = useCallback((e) => setPrompt(e.target.value), []);

  if (cargando) return (
    <div className="panel-ia__loading">Cargando...</div>
  );

  return (
    <div className="panel-ia">

      {/* Header */}
      <div className="panel-ia__header">
        <div className="panel-ia__icon"><IcoRobot /></div>
        <div>
          <h2 className="panel-ia__title">Asistente IA</h2>
          <p className="panel-ia__subtitle">Configuración del comportamiento de NutriBot</p>
        </div>
      </div>

      {/* Badge */}
      <div className="panel-ia__badge-wrapper">
        <span className="panel-ia__badge">
          <span className="panel-ia__badge-dot" />
          Gemini 2.5 Flash · Activo
        </span>
      </div>

      {/* Métricas */}
      <div className="panel-ia__metrics">
        <MetricCard num={totalUsuarios} lbl="Usuarios activos" accent />
        <MetricCard num="–" lbl="Mensajes hoy" />
        <MetricCard num="–" lbl="Tokens usados" />
      </div>

      <hr className="panel-ia__divider" />

      {/* Label editor */}
      <div className="panel-ia__editor-header">
        <span className="panel-ia__editor-label">
          Instrucciones del sistema (system prompt)
        </span>
        <span className="panel-ia__editor-count">
          {prompt.length.toLocaleString()} caracteres
        </span>
      </div>

      {/* Editor */}
      <textarea
        className="panel-ia__textarea"
        value={prompt}
        onChange={handlePromptChange}
        rows={13}
        placeholder="Escribe aquí las instrucciones para la IA..."
      />

      {/* Nota */}
      <div className="panel-ia__note">
        El perfil de salud de cada usuario (condiciones, alergias, preferencias) se añade
        automáticamente al final de este prompt.
      </div>

      <hr className="panel-ia__divider--sm" />

      {/* Footer */}
      <div className="panel-ia__footer">
        <span className="panel-ia__footer-hint">
          <IcoInfo />
          Los cambios aplican en el siguiente mensaje del usuario
        </span>
        <button type="button"
          className="panel-ia__btn-save"
          onClick={guardarPrompt}
          disabled={guardando}
        >
          <IcoSave />
          {guardando ? 'Guardando...' : 'Guardar instrucciones'}
        </button>
      </div>

    </div>
  );
};

export default PanelIA;