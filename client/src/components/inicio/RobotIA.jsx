import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatCore from './ChatCore';
import './RobotIA.css';

const RobotIA = ({ activo, toggleIA }) => {
  const navigate = useNavigate();

  const irAChatCompleto = () => {
    toggleIA(); // cierra el flotante
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
          <ChatCore onExpandir={irAChatCompleto} 
          onCerrar={toggleIA}/>
        </div>
      )}
    </>
  );
};

export default RobotIA;