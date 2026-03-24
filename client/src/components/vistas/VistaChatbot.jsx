import ChatCore from '../inicio/ChatCore';
import './VistaChatbot.css';

const VistaChatbot = () => {
  return (
    <div className="vistaChatbot">
      <ChatCore modoExpandido={true} />
    </div>
  );
};

export default VistaChatbot;