import React, { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './RobotIA.css';

// 🤖 Robot IA - Preparado para integración con Claude API
// 🔒 TODO: Integrar con Anthropic API cuando esté listo

const RobotIA = ({ activo, toggleIA }) => {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([]);
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    // Agregar mensaje del usuario
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
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </button>
      
      {/* Panel de chat */}
      {activo && (
        <div className="robotChat">
          <div className="robotHeader">
            <h3>🤖 Asistente IA</h3>
            <button onClick={toggleIA} aria-label="Cerrar">✕</button>
          </div>

          <div className="robotMensajes">
            {chat.length === 0 && (
              <div className="robotBienvenida">
                <p>¡Hola! 👋</p>
                <p>Pregúntame sobre:</p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                  <li>🥗 Recetas saludables</li>
                  <li>🎃 Ingredientes y nutrición</li>
                  <li>💪 Consejos para tu dieta</li>
                  <li>🍽️ Sustitutos de alimentos</li>
                </ul>
              </div>
            )}

            {chat.map((msg, i) => (
              <div key={i} className={`robotMensaje ${msg.tipo}`}>
                <div className="robotMensajeAvatar">
                  {msg.tipo === 'usuario' ? '👤' : '🤖'}
                </div>
                <div className="robotMensajeTexto">
                  {msg.texto}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="robotMensaje ia">
                <div className="robotMensajeAvatar">🤖</div>
                <div className="robotMensajeTexto">
                  <span className="typingIndicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="robotInput">
            <textarea
              placeholder="Escribe tu pregunta..."  
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={cargando}
              rows="1"
            />
            <button 
              onClick={enviarMensaje}
              disabled={cargando || !mensaje.trim()}
              title="Enviar mensaje"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* 📝 Nota de desarrollo */}
          <div className="robotFooter">
            <small style={{ opacity: 0.6 }}>
              💡 Próximamente: Integración con Claude AI
            </small>
          </div>
        </div>
      )}
    </>
  );
};

export default RobotIA;
