import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const PanelIA = () => {
  const [prompt, setPrompt] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [totalUsuarios, setTotalUsuarios] = useState('–');

  useEffect(() => {
    cargarPrompt();
    cargarUsuarios();
  }, []);

  const cargarPrompt = async () => {
    try {
      const res = await api.get('/chat/prompt');
      setPrompt(res.data.prompt || '');
    } catch {
      toast.error('Error cargando el prompt');
    } finally {
      setCargando(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/users');
      const data = res.data;
      const total = Array.isArray(data) ? data.length : (data.total ?? data.count ?? '–');
      setTotalUsuarios(total);
    } catch {
      setTotalUsuarios('–');
    }
  };

  const guardarPrompt = async () => {
    setGuardando(true);
    try {
      await api.put('/chat/prompt', { prompt });
      toast.success('Instrucciones de la IA actualizadas correctamente');
    } catch {
      toast.error('Error guardando el prompt');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return (
    <div style={{ padding: '2rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
      Cargando...
    </div>
  );

  const card = (num, lbl, accent = false) => (
    <div key={lbl} style={{
      background: accent ? 'rgba(79,119,45,0.2)' : 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${accent ? 'rgba(79,119,45,0.45)' : 'rgba(255,255,255,0.12)'}`,
      borderRadius: '14px',
      padding: '1.1rem 1.25rem',
    }}>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
        {num}
      </div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{lbl}</div>
    </div>
  );

  return (
    <div style={{ padding: '1.5rem 0', maxWidth: '860px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '0.75rem' }}>
        <div style={{
          width: '46px', height: '46px',
          borderRadius: '13px',
          background: 'rgba(79,119,45,0.3)',
          border: '1.5px solid rgba(79,119,45,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(180,230,140,0.95)" strokeWidth="2">
            <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/><path d="M20 14h2"/>
            <path d="M15 13v2"/><path d="M9 13v2"/>
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
            Asistente IA
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            Configuración del comportamiento de NutriBot
          </p>
        </div>
      </div>

      {/* Badge */}
      <div style={{ margin: '1rem 0 1.5rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          fontSize: '12px', padding: '5px 13px', borderRadius: '99px',
          background: 'rgba(79,119,45,0.25)',
          color: 'rgba(180,230,140,0.95)',
          border: '1px solid rgba(79,119,45,0.5)',
          fontWeight: 600,
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7ec850' }}/>
          Gemini 2.5 Flash · Activo
        </span>
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.75rem' }}>
        {card(totalUsuarios, 'Usuarios activos', true)}
        {card('–', 'Mensajes hoy')}
        {card('–', 'Tokens usados')}
      </div>

      {/* Separador */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

      {/* Label editor */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
          Instrucciones del sistema (system prompt)
        </span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
          {prompt.length.toLocaleString()} caracteres
        </span>
      </div>

      {/* Editor */}
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={13}
        placeholder="Escribe aquí las instrucciones para la IA..."
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '1rem 1.1rem',
          fontSize: '13.5px',
          fontFamily: 'monospace',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.25)',
          color: 'rgba(255,255,255,0.9)',
          resize: 'vertical',
          lineHeight: 1.65,
          outline: 'none',
          transition: 'border-color 0.2s',
          marginBottom: '1rem',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(247,127,0,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
      />

      {/* Nota */}
      <div style={{
        background: 'rgba(79,119,45,0.13)',
        borderLeft: '2px solid rgba(120,180,70,0.6)',
        borderRadius: '0 10px 10px 0',
        padding: '0.8rem 1.1rem',
        marginBottom: '1.75rem',
        fontSize: '13px',
        color: 'rgba(180,230,140,0.8)',
        lineHeight: 1.5,
      }}>
        El perfil de salud de cada usuario (condiciones, alergias, preferencias) se añade automáticamente al final de este prompt.
      </div>

      {/* Separador */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }} />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          Los cambios aplican en el siguiente mensaje del usuario
        </span>
        <button
          onClick={guardarPrompt}
          disabled={guardando}
          style={{
            padding: '0.7rem 1.8rem',
            background: guardando ? 'rgba(247,127,0,0.15)' : 'rgba(247,127,0,0.25)',
            border: '1.5px solid rgba(247,127,0,0.55)',
            borderRadius: '50px',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: guardando ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'all 0.2s',
            opacity: guardando ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!guardando) e.currentTarget.style.background = 'rgba(247,127,0,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = guardando ? 'rgba(247,127,0,0.15)' : 'rgba(247,127,0,0.25)'; }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {guardando ? 'Guardando...' : 'Guardar instrucciones'}
        </button>
      </div>

    </div>
  );
};

export default PanelIA;