import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import ChatCore from './ChatCore';
import './RobotIA.css';

// 🤖 Robot IA — Integrado con backend /chat
// Envía historial de los últimos 10 mensajes para contexto
// La lógica de API vive aquí; ChatCore solo renderiza la UI

const RobotIA = ({ activo, toggleIA }) => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat]       = useState([]);
  const [cargando, setCargando] = useState(false);

  const irAChatCompleto = () => {
    toggleIA(); // cierra el flotante
    navigate('/chatbot');
  };

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

      setChat(prev => [...prev, {
        tipo: 'ia',
        texto: response.data.reply
      }]);

    } catch (error) {
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

      {/* Panel flotante — delega todo el render a ChatCore */}
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