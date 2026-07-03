import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../hooks/useChatStore';
import ChatCore from './ChatCore';
import './RobotIA.css';

const IcoRobotBtn = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
    fill="none" stroke="white" strokeWidth="2">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" /><path d="M20 14h2" />
    <path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
));
IcoRobotBtn.displayName = 'IcoRobotBtn';

const RobotIA = memo(({ activo, toggleIA }) => {
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

  const irAChatCompleto = () => navigate('/chatbot');

  return (
    <>
      <button className="robotBoton" onClick={toggleIA} title="Asistente IA">
        <IcoRobotBtn />
      </button>

      {activo && (
        <div className="robotChat" data-modal="true">
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
});

RobotIA.displayName = 'RobotIA';

export default RobotIA;