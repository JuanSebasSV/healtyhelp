import React, { useRef, useEffect } from 'react';

/* ── Iconos ── */
const IconoRobot = ({ size = 20, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/>
    <rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/><path d="M20 14h2"/>
    <path d="M15 13v2"/><path d="M9 13v2"/>
  </svg>
);

const IconoUsuario = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const IconoEnviar = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-9a.498.498 0 0 0 0-.895z"/>
    <path d="M6 12h16"/>
  </svg>
);

const IconoExpandir = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
  </svg>
);

const IconoMinimizar = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
    <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
  </svg>
);

const IconoCerrar = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const IconoHoja = ({ size = 16, className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const IconoCorazon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const IconoZanahoría = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/>
    <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/>
    <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/>
  </svg>
);

const IconoManzana = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20.94c1.5 0 4.71-1.76 4.71-6.36 0-2.23-1.15-3.73-2.06-4.52-.53-.46-1.06-.99-1.76-1.31"/>
    <path d="M7.29 14.58C7.29 19.18 10.5 20.94 12 20.94"/>
    <path d="M9.5 6.17C9.5 4.1 11.07 2 12 2c.94 0 2.5 2.1 2.5 4.17"/>
    <path d="M7.29 14.58c0-2.23 1.15-3.73 2.06-4.52C10.21 9.22 11 8.5 12 8.34"/>
  </svg>
);

const IconoSemilla = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/>
    <path d="M2 22 17 7"/>
  </svg>
);

/* ── Sugerencias ── */
const sugerencias = [
  { icono: <IconoZanahoría size={13}/>, texto: 'Recetas para diabéticos' },
  { icono: <IconoCorazon size={13}/>,   texto: 'Menú bajo en sodio' },
  { icono: <IconoSemilla size={13}/>,   texto: 'Opciones veganas' },
  { icono: <IconoManzana size={13}/>,   texto: 'Sin gluten' },
];

/* ── Componente ── */
const ChatCore = ({
  modoExpandido = false,
  chat = [],
  cargando = false,
  mensaje = '',
  onMensajeChange,
  onEnviar,
  onKeyPress,
  onExpandir,
  onCerrar,
  onMinimizar,
  // onSugerencia: dispara el mensaje de la sugerencia directamente (sin pasar
  // por el textarea). Si no se pasa, cae al comportamiento anterior de poner
  // el texto en el textarea para que el usuario lo envíe manualmente.
  onSugerencia,
}) => {
  const mensajesRef = useRef(null);
  const prevChatLen = useRef(chat.length);

  const setMensajesRef = (el) => {
    if (el) el.scrollTop = 0;
    mensajesRef.current = el;
  };

  useEffect(() => {
    const el = mensajesRef.current;
    if (!el) return;

    const creció = chat.length > prevChatLen.current;
    prevChatLen.current = chat.length;

    if (creció || (cargando && chat.length > 0)) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chat, cargando]);

  // Al hacer clic en una sugerencia:
  // - Si existe onSugerencia (nuevo comportamiento): envía el mensaje directamente.
  // - Si no (compatibilidad hacia atrás): pone el texto en el textarea.
  const handleSugerencia = (texto) => {
    if (onSugerencia) {
      onSugerencia(texto);
    } else {
      onMensajeChange?.({ target: { value: texto } });
    }
  };

  return (
    <div className={`chatCore ${modoExpandido ? 'chatCore--expandido' : ''}`}>

      {!modoExpandido && (
        <div className="chatOrbes" aria-hidden="true">
          <div className="chatOrbe chatOrbe--1" />
          <div className="chatOrbe chatOrbe--2" />
          <div className="chatOrbe chatOrbe--3" />
        </div>
      )}

      <div className="robotHeader">
        <div className="robotHeader__izq">
          <div className="robotHeader__avatar">
            <IconoRobot size={18} color="#fff" />
            <span className="robotHeader__pulse" />
          </div>
          <div className="robotHeader__info">
            <h3>Asistente Nutricional</h3>
            <span className="robotHeader__estado">
              <span className="robotHeader__dot" />
              En línea
            </span>
          </div>
        </div>

        <div className="robotHeader__acciones">
          {modoExpandido ? (
            <button className="robotHeader__btn" onClick={onMinimizar} title="Minimizar">
              <IconoMinimizar size={16}/>
            </button>
          ) : (
            onExpandir && (
              <button className="robotHeader__btn" onClick={onExpandir} title="Pantalla completa">
                <IconoExpandir size={16}/>
              </button>
            )
          )}
          {!modoExpandido && (
            <button className="robotHeader__btn robotHeader__btn--cerrar" onClick={onCerrar} aria-label="Cerrar">
              <IconoCerrar size={15}/>
            </button>
          )}
        </div>
      </div>

      <div className="robotMensajes" ref={setMensajesRef}>
        {chat.length === 0 && (
          <div className="chatBienvenida">
            <div className="chatBienvenida__icono">
              <IconoHoja size={28} className="chatBienvenida__hoja" />
            </div>
            <p className="chatBienvenida__titulo">¿En qué te ayudo hoy?</p>
            <p className="chatBienvenida__sub">
              Soy tu asistente especializado en nutrición y condiciones alimentarias.
            </p>
            <div className="chatSugerencias">
              {sugerencias.map((s, i) => (
                <button
                  key={i}
                  className="chatSugerencia"
                  onClick={() => handleSugerencia(s.texto)}
                >
                  <span className="chatSugerencia__icono">{s.icono}</span>
                  {s.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.map((msg, i) => (
          <div key={i} className={`robotMensaje ${msg.tipo}`}>
            <div className="robotMensajeAvatar">
              {msg.tipo === 'usuario'
                ? <IconoUsuario size={14}/>
                : <IconoRobot size={14} color="currentColor"/>
              }
            </div>
            <div className="robotMensajeTexto">{msg.texto}</div>
          </div>
        ))}
        {cargando && (
          <div className="robotMensaje ia">
            <div className="robotMensajeAvatar"><IconoRobot size={14} color="currentColor"/></div>
            <div className="robotMensajeTexto">
              <span className="typingIndicator">
                <span/><span/><span/>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="robotInput">
        <div className="robotInput__wrap">
          <textarea
            placeholder="Pregunta sobre tu dieta o condición..."
            value={mensaje}
            onChange={onMensajeChange}
            onKeyDown={onKeyPress}
            disabled={cargando}
            rows="1"
          />
          <button
            className="robotInput__enviar"
            onClick={onEnviar}
            disabled={cargando || !mensaje?.trim()}
            title="Enviar"
          >
            <IconoEnviar size={16}/>
          </button>
        </div>
      </div>

      <div className="robotFooter">
        <IconoHoja size={11} />
        <small>Potenciado por IA · Solo orientación nutricional</small>
      </div>

    </div>
  );
};

export default ChatCore;