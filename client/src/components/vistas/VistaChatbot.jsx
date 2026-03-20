import { useNavigate } from 'react-router-dom';
import ChatCore from '../inicio/ChatCore';
import './VistaChatbot.css';

const VistaChatbot = ({ abrirFlotante }) => {
  const navigate = useNavigate();

  const handleMinimizar = () => {
    abrirFlotante();
    navigate(-1);
  };

  return (
    <div className="vistaChatbot">
      <ChatCore modoExpandido={true} onMinimizar={handleMinimizar} />
    </div>
  );
};

export default VistaChatbot;