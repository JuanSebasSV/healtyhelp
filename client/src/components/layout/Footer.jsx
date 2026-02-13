import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="footerContenido">
        <div className="footerSeccion">
          <h3>Healthy Help</h3>
          <p>Tu compañero en el camino hacia una alimentación más saludable y balanceada.</p>
        </div>
        <div className="footerSeccion">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li onClick={() => onNavigate('inicio')}>Inicio</li>
            <li onClick={() => onNavigate('historial')}>Historial</li>
            <li onClick={() => onNavigate('favoritos')}>Favoritos</li>
          </ul>
        </div>
        <div className="footerSeccion">
          <h4>Contacto</h4>
          <p>Email: info@healthyhelp.com</p>
          <p>Teléfono: +1 (555) 123-4567</p>
        </div>
      </div>
      <div className="footerCopy">
        © 2024 Healthy Help. Todos los derechos reservados. | Powered by Readdy
      </div>
    </footer>
  );
};

export default Footer;
