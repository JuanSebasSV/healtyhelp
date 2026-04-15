// hooks/useChat.js
import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const useChat = () => {
  const [mensaje,  setMensaje]  = useState('');
  const [chat,     setChat]     = useState([]);
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje = { tipo: 'usuario', texto: mensaje };
    setChat(prev => [...prev, nuevoMensaje]);
    setMensaje('');
    setCargando(true);

    try {
      const response = await api.post('/chat', {
        message: mensaje,
        history: chat.slice(-10).map(msg => ({
          role: msg.tipo === 'usuario' ? 'user' : 'model',
          text: msg.texto
        }))
      });
      setChat(prev => [...prev, { tipo: 'ia', texto: response.data.reply }]);
    } catch {
      toast.error('Error al comunicarse con el asistente');
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return {
    mensaje,
    chat,
    cargando,
    onMensajeChange: (e) => setMensaje(e.target.value),
    onEnviar: enviarMensaje,
    onKeyPress: handleKeyPress,
  };
};

export default useChat;
