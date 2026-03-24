// ChatCore.jsx - Lógica compartida entre flotante y página expandida
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

const ChatCore = ({ modoExpandido = false, onExpandir, onCerrar, onMinimizar}) => {
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState([]);
  const [cargando, setCargando] = useState(false);
  const mensajesRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [chat]);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;
    const nuevoMensaje = { tipo: 'usuario', texto: mensaje };
    setChat(prev => [...prev, nuevoMensaje]);
    setMensaje('');
    setCargando(true);

    try {
      setTimeout(() => {
        setChat(prev => [...prev, {
          tipo: 'ia',
          texto: '¡Hola! Soy tu asistente culinario. Estoy aquí para ayudarte con recetas, ingredientes y consejos nutricionales. ¿En qué puedo ayudarte hoy?'
        }]);
        setCargando(false);
      }, 800);
    } catch (error) {
      toast.error('Error al comunicarse con el asistente');
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
    <div className={`chatCore ${modoExpandido ? 'chatCore--expandido' : ''}`}>
      {/* Header */}
      <div className="robotHeader">
        {/* Botón minimizar: solo en modo expandido */}
      {modoExpandido && (
        <button onClick={onMinimizar} title="Minimizar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
            <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
            <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
          </svg>
        </button>
      )}
  
        {/* Botón expandir: solo en modo flotante */}     
        {!modoExpandido && onExpandir && (
          <button onClick={onExpandir} title="Abrir en pantalla completa">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 15 6 6"/><path d="m15 9 6-6"/>
              <path d="M21 16v5h-5"/><path d="M21 8V3h-5"/>
              <path d="M3 16v5h5"/><path d="m3 21 6-6"/>
              <path d="M3 8V3h5"/><path d="M9 9 3 3"/>
            </svg>
          </button>
        )}
        <h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot-message-square-icon lucide-bot-message-square"><path d="M12 6V2H8"/><path d="M15 11v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/><path d="M9 11v2"/></svg>Asistente IA</h3>

        {/* Botón cerrar: solo en modo flotante */}
        {!modoExpandido && (
          <button onClick={onCerrar} aria-label="Cerrar">✕</button>
        )}
      </div>

      {/* Mensajes */}
      <div className="robotMensajes" ref={mensajesRef}>
        <div className="">
          <div className="robotSaludo">
            <p className="hola">¡Hola! 👋</p>
            <p>Pregúntame sobre:</p>
          </div>
          {chat.length === 0 && (

            <div className="robotBienvenida">         
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                <li>🥗 Recetas saludables</li>
                <li>🎃 Ingredientes y nutrición</li>
                <li>💪 Consejos para tu dieta</li>
                <li>🍽️ Sustitutos de alimentos</li>             
              </ul>
            </div>
          )}
        </div>

        {chat.map((msg, i) => (
          <div key={i} className={`robotMensaje ${msg.tipo}`}>
            <div className="robotMensajeAvatar">{msg.tipo === 'usuario' ? '👤' : '🤖'}</div>
            <div className="robotMensajeTexto">{msg.texto}</div>
          </div>
        ))}
        {cargando && (
          <div className="robotMensaje ia">
            <div className="robotMensajeAvatar">🤖</div>
            <div className="robotMensajeTexto">
              <span className="typingIndicator">
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="robotInput">
        <textarea
          placeholder="Escribe tu pregunta..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={cargando}
          rows="1"
        />
        <button onClick={enviarMensaje} disabled={cargando || !mensaje.trim()} title="Enviar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <div className="robotFooter">
        <small style={{ opacity: 0.6 }}>💡¡Integración con Gemini! </small>
      </div>
    </div>
  );
};

export default ChatCore;