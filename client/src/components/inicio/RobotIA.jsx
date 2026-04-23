import React from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../hooks/useChatStore';
import ChatCore from './ChatCore';
import './RobotIA.css';

// Componente principal 
const RobotIA = ({ activo, toggleIA }) => {
  const navigate = useNavigate();

  const {
    chat,
    cargando,
    mensaje,
    onMensajeChange,
    onEnviar,
    onKeyPress,
    enviarTextoDirecto,
  } = useChatStore();

  const irAChatCompleto = () => {
    navigate('/chatbot');
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
            onMensajeChange={onMensajeChange}
            onEnviar={onEnviar}
            onKeyPress={onKeyPress}
            onExpandir={irAChatCompleto}
            onCerrar={toggleIA}
            onSugerencia={enviarTextoDirecto}
          />
        </div>
      )}
    </>
  );
};

export default RobotIA;