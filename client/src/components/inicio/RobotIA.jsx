import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ChatCore from './ChatCore';
import './RobotIA.css';

// ─── Palabras clave que indican pregunta sobre filtros activos ────────────────
const FILTRO_KEYWORDS = [
  'filtro', 'filtros', 'dieta', 'condición', 'condicion', 'condiciones',
  'alergia', 'alergias', 'preferencia', 'preferencias', 'categoría',
  'categoria', 'categorias', 'perfil', 'restriccion', 'restricción',
];

function esPreguntaDeFiltros(texto) {
  const lower = texto.toLowerCase();
  return FILTRO_KEYWORDS.some(k => lower.includes(k));
}

function formatearFiltrosLocales(filtros) {
  if (!filtros) return 'Aún no cargué tu perfil. Intenta en un momento.';
  const { condiciones, categorias, alergias, preferencias } = filtros;
  const fmt = arr => arr?.length ? arr.join(', ') : 'ninguna';
  return (
    `Tus filtros activos son:\n` +
    `• Condiciones / dieta: ${fmt(condiciones)}\n` +
    `• Tipo de comida: ${categorias?.length ? categorias.join(', ') : 'todas (sin restricción)'}\n` +
    `• Alergias: ${fmt(alergias)}\n` +
    `• Preferencias: ${fmt(preferencias)}`
  );
}

// ─── Construye historial leyendo el ref en el momento de la llamada ───────────
// Así el retry nunca usa un historial capturado por closure obsoleto (fix C1)
function buildHistory(chatRef) {
  return chatRef.current.slice(-10).map(msg => ({
    role: msg.tipo === 'usuario' ? 'user' : 'model',
    text: msg.texto,
  }));
}

// ─── Componente principal ─────────────────────────────────────────────────────

const RobotIA = ({ activo, toggleIA }) => {
  const navigate = useNavigate();
  const [mensaje, setMensaje]   = useState('');
  const [chat, setChat]         = useState([]);
  const [cargando, setCargando] = useState(false);
  const [filtros, setFiltros]   = useState(null);

  // FIX C1: chatRef siempre tiene el valor más reciente de chat.
  // El setTimeout del retry puede pasar hasta 4 s después — sin este ref,
  // el historial enviado sería el del cierre original (obsoleto).
  const chatRef        = useRef(chat);
  const enviandoRef    = useRef(false);
  const ultimoEnvioRef = useRef(0);

  // Mantener chatRef sincronizado con el estado
  useEffect(() => { chatRef.current = chat; }, [chat]);

  // Carga los filtros del usuario una sola vez al montar
  useEffect(() => {
    api.get('/chat/filtros')
      .then(r => setFiltros(r.data))
      .catch(() => {});
  }, []);

  const irAChatCompleto = () => {
    toggleIA();
    navigate('/chatbot');
  };

  // ── Lógica de llamada a la API, reutilizable para el retry ───────────────
  const llamarAPI = useCallback(async (texto) => {
    setCargando(true);
    try {
      const response = await api.post('/chat', {
        message: texto,
        history: buildHistory(chatRef), // lee chatRef.current en el momento exacto
      });
      setChat(prev => [...prev, { tipo: 'ia', texto: response.data.reply }]);
    } catch (error) {
      const esRateLimit =
        error.response?.status === 429 ||
        error.response?.data?.error === 'rate_limit';
      // Relanzar con flag para que el llamador decida si hace retry
      throw Object.assign(error, { esRateLimit });
    } finally {
      setCargando(false);
    }
  }, []);

  const enviarMensaje = async () => {
    const texto = mensaje.trim();
    if (!texto) return;

    // Throttle: bloquea si ya hay una request en vuelo o si pasaron < 800ms
    const ahora = Date.now();
    if (enviandoRef.current || ahora - ultimoEnvioRef.current < 800) return;

    enviandoRef.current    = true;
    ultimoEnvioRef.current = ahora;

    setChat(prev => [...prev, { tipo: 'usuario', texto }]);
    setMensaje('');

    // ── Respuesta local para preguntas sobre filtros (sin consumir API) ──────
    if (esPreguntaDeFiltros(texto)) {
      setChat(prev => [...prev, { tipo: 'ia', texto: formatearFiltrosLocales(filtros) }]);
      enviandoRef.current = false;
      return;
    }

    // ── Llamada principal ────────────────────────────────────────────────────
    try {
      await llamarAPI(texto);
      enviandoRef.current = false;
    } catch (error) {
      if (error.esRateLimit) {
        toast.info('Límite de consultas alcanzado. Reintentando en 4 s…', { autoClose: 3500 });

        // FIX C1: el setTimeout se ejecuta 4 s después.
        // chatRef.current tendrá el historial real de ese momento, no el del cierre.
        setTimeout(async () => {
          try {
            await llamarAPI(texto);
          } catch {
            setChat(prev => [...prev, {
              tipo: 'ia',
              texto: 'Sigo con alta demanda. Por favor espera unos segundos e intenta de nuevo.',
            }]);
          } finally {
            enviandoRef.current = false;
          }
        }, 4000);
        // No liberar enviandoRef aquí; lo hace el finally del setTimeout
        return;
      }

      // Error genérico (red, servidor, etc.)
      toast.error('Error al comunicarse con el asistente');
      enviandoRef.current = false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button className="robotBoton" onClick={toggleIA} title="Asistente IA">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" /><path d="M20 14h2" />
          <path d="M15 13v2" /><path d="M9 13v2" />
        </svg>
      </button>

      {/* Panel flotante */}
      {activo && (
        <div className="robotChat">
          <ChatCore
            modoExpandido={false}
            chat={chat}
            cargando={cargando}
            mensaje={mensaje}
            onMensajeChange={(e) => setMensaje(e.target.value)}
            onEnviar={enviarMensaje}
            onKeyPress={handleKeyPress}
            onExpandir={irAChatCompleto}
            onCerrar={toggleIA}
          />
        </div>
      )}
    </>
  );
};

export default RobotIA;