import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import './VistaContacto.css';

const DOMINIOS_PERMITIDOS = new Set([
  'gmail.com',
  'hotmail.com', 'hotmail.es', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de',
  'outlook.com', 'outlook.es', 'live.com', 'live.com.mx', 'live.co.uk',
  'msn.com',
  'yahoo.com', 'yahoo.es', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'yahoo.com.mx', 'yahoo.com.ar', 'yahoo.com.co',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me', 'pm.me',
  'tutanota.com', 'tuta.io',
  'zoho.com',
  'aol.com', 'aol.co.uk',
  'mail.com', 'email.com', 'gmx.com', 'gmx.de', 'gmx.net',
  'yandex.com', 'yandex.ru',
  'bol.com.br', 'ig.com.br', 'uol.com.br', 'terra.com.br',
  'hotmail.com.br',
]);

const esEmailPermitido = (email) => {
  const partes = email.split('@');
  if (partes.length !== 2) return false;
  return DOMINIOS_PERMITIDOS.has(partes[1].toLowerCase());
};

const VistaContacto = () => {
  const [datosForm, setDatosForm] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [infoAbierta, setInfoAbierta] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const validarYMostrarConfirmacion = () => {
    const { nombre, email, mensaje } = datosForm;

    if (!nombre || nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (!email) {
      toast.error('El correo es requerido');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('El correo no tiene un formato válido');
      return;
    }
    if (!esEmailPermitido(email)) {
      toast.error('Usa un proveedor reconocido (Gmail, Hotmail, Outlook, etc.)');
      return;
    }
    if (!mensaje || mensaje.trim().length < 10) {
      toast.error('El mensaje debe tener al menos 10 caracteres');
      return;
    }
    if (mensaje.trim().length > 1000) {
      toast.error('El mensaje es muy largo (máximo 1000 caracteres)');
      return;
    }

    setMostrarConfirmacion(true);
  };

  const confirmarYEnviar = async () => {
    setMostrarConfirmacion(false);
    setEnviando(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.post('/contacto', {
        nombre: datosForm.nombre,
        email: datosForm.email,
        asunto: datosForm.asunto,
        mensaje: datosForm.mensaje
      }, { headers });
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      setDatosForm({ nombre: '', email: '', asunto: '', mensaje: '' });
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al enviar el mensaje. Intenta de nuevo.';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="vista-contacto">

      {mostrarConfirmacion && (
        <div
          className="confirmacion-overlay"
          onClick={() => setMostrarConfirmacion(false)}
        >
          <div
            className="confirmacion-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirmacion-header">
              <div className="confirmacion-icono">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3>Confirma tu mensaje</h3>
              <p>Revisa que todo esté correcto antes de enviar</p>
            </div>

            <div className="confirmacion-cuerpo">
              <div className="confirmacion-fila">
                <span className="confirmacion-etiqueta">Nombre</span>
                <span className="confirmacion-valor">{datosForm.nombre}</span>
              </div>
              <div className="confirmacion-fila">
                <span className="confirmacion-etiqueta">Correo</span>
                <span className="confirmacion-valor confirmacion-email">{datosForm.email}</span>
              </div>
              {datosForm.asunto && (
                <div className="confirmacion-fila">
                  <span className="confirmacion-etiqueta">Asunto</span>
                  <span className="confirmacion-valor">{datosForm.asunto}</span>
                </div>
              )}
              <div className="confirmacion-fila confirmacion-fila--mensaje">
                <span className="confirmacion-etiqueta">Mensaje</span>
                <span className="confirmacion-valor confirmacion-mensaje">{datosForm.mensaje}</span>
              </div>
            </div>

            <div className="confirmacion-acciones">
              <button
                className="confirmacion-btn-editar"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Editar
              </button>
              <button
                className="confirmacion-btn-enviar"
                onClick={confirmarYEnviar}
              >
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="contacto-header" style={{ marginBottom: '3rem' }}>
        <h1>Contáctanos</h1>
        <p className="contacto-subtitulo">
          Estamos aquí para acompañarte en tu camino hacia una vida más saludable.
          Escríbenos, llámanos o visítanos — con gusto te orientamos.
        </p>
      </div>

      <div className="contacto-contenedor">

        <div className="contacto-info">
          <span className="contacto-hero-titulo">Contáctanos</span>

          <div className="info-item">
            <div className="info-icono">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3>Correo</h3>
              <p>healtyhelp@gmail.com</p>
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
              <p>+57 317 427 9162</p>
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
              <p>Carrera 10 No. 11 - 22, Garzón - Huila</p>
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
              <p>Lun - Vie: 12:00 PM - 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="contacto-acordeon">
          <button
            className="acordeon-trigger"
            onClick={() => setInfoAbierta(prev => !prev)}
            aria-expanded={infoAbierta}
          >
            <span className="acordeon-trigger-label">
              <span className="acordeon-punto" />
              Información de contacto
            </span>
            <svg
              className="acordeon-chevron"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
            >
              <polyline
                points="6 9 12 15 18 9"
                stroke="rgba(255,255,255,0.90)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

          <div className={`acordeon-contenido${infoAbierta ? ' abierto' : ''}`}>
            <div className="acordeon-inner">
              <div className="info-item">
                <div className="info-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div><h3>Correo</h3><p>healtyhelp@gmail.com</p></div>
              </div>
              <div className="info-item">
                <div className="info-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div><h3>Teléfono</h3><p>+57 317 427 9162</p></div>
              </div>
              <div className="info-item">
                <div className="info-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div><h3>Ubicación</h3><p>Carrera 10 No. 11 - 22, Garzón - Huila</p></div>
              </div>
              <div className="info-item">
                <div className="info-icono">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div><h3>Horario de Atención</h3><p>Lun - Vie: 12:00 PM - 6:00 PM</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="contacto-form">
          <h2>Envíanos un Mensaje</h2>

          <div className="campo-wrapper">
            <input
              type="text"
              placeholder="Nombre completo *"
              value={datosForm.nombre}
              onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })}
              disabled={enviando}
            />
          </div>

          <div className="campo-wrapper">
            <input
              type="email"
              placeholder="Correo electrónico *"
              value={datosForm.email}
              onChange={(e) => setDatosForm({ ...datosForm, email: e.target.value })}
              disabled={enviando}
            />
          </div>

          <div className="campo-wrapper">
            <input
              type="text"
              placeholder="Asunto"
              value={datosForm.asunto}
              onChange={(e) => setDatosForm({ ...datosForm, asunto: e.target.value })}
              disabled={enviando}
            />
          </div>

          <div className="campo-wrapper campo-textarea">
            <textarea
              placeholder="Mensaje *"
              rows="5"
              value={datosForm.mensaje}
              onChange={(e) => setDatosForm({ ...datosForm, mensaje: e.target.value })}
              disabled={enviando}
            />
          </div>

          <button
            onClick={validarYMostrarConfirmacion}
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