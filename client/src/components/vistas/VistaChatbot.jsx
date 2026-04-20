import { useNavigate } from 'react-router-dom';
import useChatStore from '../../hooks/useChatStore';
import ChatCore from '../inicio/ChatCore';
import './VistaChatbot.css';

// ─── CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR ───────────────────────────────────
//
// Ya no depende de chatProps pasado desde App.
// Ahora llama directamente a useChatStore, que comparte el mismo estado de
// módulo que RobotIA. El historial es idéntico en ambas vistas — al expandir
// o minimizar, la conversación continúa exactamente donde estaba.

/* ── SVGs del panel lateral ───────────────────────────────── */
const IconoHoja = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
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

const IconoSemilla = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/>
    <path d="M2 22 17 7"/>
  </svg>
);

const IconoZanahoria = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7zM8.64 14l-2.05-2.04M15.34 15l-2.46-2.46"/>
    <path d="M22 9s-1.33-2-3.5-2C16.86 7 15 9 15 9s1.33 2 3.5 2S22 9 22 9z"/>
    <path d="M15 2s-2 1.33-2 3.5S15 9 15 9s2-1.84 2-3.5C17 3.33 15 2 15 2z"/>
  </svg>
);

const IconoEscudo = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
);

const IconoChispa = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  </svg>
);

const capacidades = [
  { icono: <IconoCorazon size={14}/>, titulo: 'Condiciones crónicas',      desc: 'Diabetes, hipertensión, colesterol' },
  { icono: <IconoSemilla size={14}/>, titulo: 'Dietas especiales',         desc: 'Vegano, keto, paleo, celíaco' },
  { icono: <IconoZanahoria size={14}/>, titulo: 'Recetas adaptadas',       desc: 'Ingredientes y sustitutos' },
  { icono: <IconoEscudo size={14}/>, titulo: 'Alergias e intolerancias',   desc: 'Gluten, lactosa, frutos secos' },
  { icono: <IconoChispa size={14}/>, titulo: 'Consejos nutricionales',     desc: 'Basados en tu perfil de salud' },
];

/* ── Componente ──────────────────────────────────────────── */

const VistaChatbot = ({ abrirFlotante }) => {
  const navigate = useNavigate();

  // Mismo store que RobotIA — historial compartido automáticamente
  const {
    chat,
    cargando,
    mensaje,
    onMensajeChange,
    onEnviar,
    onKeyPress,
    enviarTextoDirecto,
  } = useChatStore();

  const handleMinimizar = () => {
    abrirFlotante?.();
    navigate(-1);
  };

  return (
    <div className="vistaChatbot">
      <div className="vistaChatbot__inner">

        <aside className="vistaChatbot__panel">
          <div className="vistaChatbot__marca">
            <div className="vistaChatbot__marcaIcono">
              <IconoHoja size={22}/>
            </div>
            <h2 className="vistaChatbot__marcaTitulo">
              Asistente <span>Nutricional</span>
            </h2>
            <p className="vistaChatbot__marcaSub">Powered by IA · Gemini</p>
          </div>

          <div className="vistaChatbot__divisor" />

          <div className="vistaChatbot__caps">
            <p className="vistaChatbot__capsTitle">Puedo ayudarte con</p>
            {capacidades.map((cap, i) => (
              <div key={i} className="vistaChatbot__cap">
                <div className="vistaChatbot__capIcono">{cap.icono}</div>
                <div className="vistaChatbot__capTexto">
                  <strong>{cap.titulo}</strong>
                  {cap.desc}
                </div>
              </div>
            ))}
          </div>
<<<<<<< HEAD

=======
>>>>>>> 502ba8216358b974f48b87efcd4d77883296f685
        </aside>

        <div className="vistaChatbot__chat">
          <ChatCore
            modoExpandido={true}
            chat={chat}
            cargando={cargando}
            mensaje={mensaje}
            onMensajeChange={onMensajeChange}
            onEnviar={onEnviar}
            onKeyPress={onKeyPress}
            onMinimizar={handleMinimizar}
            onSugerencia={enviarTextoDirecto}
          />
        </div>

      </div>
    </div>
  );
};

export default VistaChatbot;