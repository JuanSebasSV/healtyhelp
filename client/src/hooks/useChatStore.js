/*useChatStore*/
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

//  Estado global de módulo 
let _chat     = [];
let _cargando = false;

// Suscriptores: un Set de funciones que fuerzan re-render en cada componente activo
const _listeners = new Set();

function notificar() {
  _listeners.forEach(fn => fn());
}

//  Flags de control de envío 
let _enviando    = false;
let _ultimoEnvio = 0;

//  Mutadores de estado 

function setChat(updater) {
  _chat = typeof updater === 'function' ? updater(_chat) : updater;
  notificar();
}

function setCargando(valor) {
  _cargando = valor;
  notificar();
}

// Lee _chat directamente para que el historial siempre sea el más reciente,
async function llamarAPI(texto) {
  setCargando(true);
  try {
    const history = _chat.slice(-10).map(msg => ({
      role: msg.tipo === 'usuario' ? 'user' : 'model',
      text: msg.texto,
    }));

    const response = await api.post('/chat', { message: texto, history });
    setChat(prev => [...prev, { tipo: 'ia', texto: response.data.reply }]);
  } catch (error) {
    const esRateLimit =
      error.response?.status === 429 ||
      error.response?.data?.error === 'rate_limit';
    throw Object.assign(error, { esRateLimit });
  } finally {
    setCargando(false);
  }
}

//  Función de envío global 
async function enviarMensajeGlobal(texto) {
  if (!texto?.trim()) return;

  const ahora = Date.now();
  if (_enviando || ahora - _ultimoEnvio < 800) return;

  _enviando    = true;
  _ultimoEnvio = ahora;

  setChat(prev => [...prev, { tipo: 'usuario', texto }]);

  try {
    await llamarAPI(texto);
    _enviando = false;
  } catch (error) {
    if (error.esRateLimit) {
      toast.info('Límite de consultas alcanzado. Reintentando en 4 s…', { autoClose: 3500 });
      setTimeout(async () => {
        try {
          await llamarAPI(texto);
        } catch {
          setChat(prev => [...prev, {
            tipo: 'ia',
            texto: 'Sigo con alta demanda. Por favor espera unos segundos e intenta de nuevo.',
          }]);
        } finally {
          _enviando = false;
        }
      }, 4000);
      return;
    }

    toast.error('Error al comunicarse con el asistente');
    _enviando = false;
  }
}

//  Hook
const useChatStore = () => {
  const [, forceRender] = useState(0);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const listener = () => forceRender(n => n + 1);
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  }, []);

  const enviarMensaje = useCallback(async () => {
    const texto = mensaje.trim();
    if (!texto) return;
    setMensaje('');
    await enviarMensajeGlobal(texto);
  }, [mensaje]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  }, [enviarMensaje]);

  // Para chips de sugerencia: disparan mensaje sin pasar por el textarea
  const enviarTextoDirecto = useCallback(async (texto) => {
    setMensaje('');
    await enviarMensajeGlobal(texto);
  }, []);

  return {
    chat:     _chat,
    cargando: _cargando,
    mensaje,
    onMensajeChange:   (e) => setMensaje(e.target.value),
    onEnviar:          enviarMensaje,
    onKeyPress:        handleKeyPress,
    enviarTextoDirecto,
  };
};

export default useChatStore;
