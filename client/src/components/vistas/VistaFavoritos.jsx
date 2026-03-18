import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './VistaContacto.css';

const VistaContacto = () => {
  const [datosForm, setDatosForm] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);

  const enviarMensaje = async () => {
    if (!datosForm.nombre || !datosForm.email || !datosForm.mensaje) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    setEnviando(true);
    try {
      // await api.post('/contact', datosForm);
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      setDatosForm({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch (error) {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="vista-contacto">

      {/* ── Header fuera de la tarjeta ── */}
      <div className="contacto-header">
        <h1>Contáctanos</h1>
        <p className="contacto-subtitulo">
          Estamos aquí para acompañarte en tu camino hacia una vida más saludable.
          Escríbenos, llámanos o visítanos — con gusto te orientamos.
        </p>
      </div>

      {/* ── Tarjeta principal: foto + formulario ── */}
      <div className="contacto-contenedor">

        {/* Panel izquierdo — foto de fondo + info items abajo */}
        <div className="contacto-info">
          <div className="info-item">
            <div className="info-icono">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3>Correo</h3>
              <p>support@healthyhelp.com</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icono">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <div>
              <h3>Teléfono</h3>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icono">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3>Ubicación</h3>
              <p>123 Health Street, Wellness City</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icono">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3>Horario de Atención</h3>
              <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="contacto-form">
          <h2>Envíanos un Mensaje</h2>
          <input
            type="text"
            placeholder="Nombre completo *"
            value={datosForm.nombre}
            onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })}
            disabled={enviando}
          />
          <input
            type="email"
            placeholder="Correo electrónico *"
            value={datosForm.email}
            onChange={(e) => setDatosForm({ ...datosForm, email: e.target.value })}
            disabled={enviando}
          />
          <input
            type="text"
            placeholder="Asunto"
            value={datosForm.asunto}
            onChange={(e) => setDatosForm({ ...datosForm, asunto: e.target.value })}
            disabled={enviando}
          />
          <textarea
            placeholder="Mensaje *"
            rows="5"
            value={datosForm.mensaje}
            onChange={(e) => setDatosForm({ ...datosForm, mensaje: e.target.value })}
            disabled={enviando}
          />
          <button
            onClick={enviarMensaje}
            className="btn-primario"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VistaContacto;