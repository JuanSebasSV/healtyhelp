import React, { useState, useEffect, useCallback, memo } from 'react';
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

const FAQS_FALLBACK = [
  { _id: '1', pregunta: '¿Cómo funciona Healthy Help?', respuesta: 'Es una plataforma de recetas saludables que se adapta a ti: filtra por condición médica, tipo de dieta, tiempo de preparación o alergias, y te muestra solo las recetas que realmente puedes comer.' },
  { _id: '2', pregunta: '¿Cómo elijo la mejor dieta para mí?', respuesta: 'En la página principal puedes activar el filtro de "Tipo de Dieta" y marcar tus condiciones (diabetes, hipertensión, vegano, keto, sin gluten, entre otras). El sistema solo mostrará recetas que cumplan con todas las condiciones seleccionadas a la vez.' },
  { _id: '3', pregunta: '¿Las recetas incluyen información nutricional?', respuesta: 'Sí, cada receta muestra calorías, proteínas, carbohidratos, grasas y micronutrientes, además de los ingredientes, pasos de preparación y el costo aproximado por porción en pesos colombianos.' },
  { _id: '4', pregunta: '¿Cómo registro mis alergias para que se filtren automáticamente?', respuesta: 'En tu perfil puedes escribir tus alergias alimentarias (por ejemplo "maní, banano"). El sistema oculta automáticamente cualquier receta que contenga esos ingredientes, incluso si están escritos con otro nombre o sinónimo.' },
  { _id: '5', pregunta: '¿Puedo guardar mis recetas favoritas?', respuesta: 'Sí, con tu cuenta puedes marcar recetas como favoritas tocando el ícono de corazón. Quedan guardadas en tu perfil, así que las verás disponibles sin importar desde qué dispositivo inicies sesión.' },
  { _id: '6', pregunta: '¿Puedo pedirle recomendaciones al asistente de IA?', respuesta: 'Sí, el chatbot puede sugerirte recetas o sustitutos de ingredientes según tus condiciones de salud, alergias o preferencias, basándose en la información de tu perfil.' },
  { _id: '7', pregunta: '¿Cómo puedo sugerir una nueva receta?', respuesta: 'Puedes escribirnos desde la sección de Contáctanos. Revisamos cada sugerencia y, si cumple con nuestros estándares nutricionales, la agregamos al catálogo.' },
  { _id: '8', pregunta: '¿Mis datos personales y de salud están protegidos?', respuesta: 'Sí, tu información se almacena de forma segura en nuestra base de datos y solo se usa para personalizar tu experiencia, como filtrar recetas según tus condiciones de salud o alergias.' },
];

const FORM_VACIO = { nombre: '', email: '', asunto: '', mensaje: '' };

const INFO = [
  {
    id: 'correo',
    titulo: 'Correo',
    valor: 'healtyhelp@gmail.com',
    href: 'mailto:healtyhelp@gmail.com',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    id: 'telefono',
    titulo: 'Teléfono',
    valor: '+57 317 427 9162',
    href: 'tel:+573174279162',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    id: 'ubicacion',
    titulo: 'Ubicación',
    valor: 'Cl. 11 #875, Garzón - Huila',
    href: 'https://maps.google.com/?q=Cl.+11+%23875+Garzon+Huila',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'horario',
    titulo: 'Horario de Atención',
    valor: 'Lun - Vie · 12:00 PM – 6:00 PM',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const InfoItem = memo(({ info, variante = 'liquid' }) => {
  const inner = (
    <>
      <span className="info-icono" aria-hidden="true">{info.icono}</span>
      <div className="info-texto">
        <h3>{info.titulo}</h3>
        <p>{info.valor}</p>
      </div>
    </>
  );
  const className = `info-item ${variante === 'solid' ? 'info-item--solid' : ''}`;
  return info.href ? (
    <a className={className} href={info.href} target={info.href.startsWith('http') ? '_blank' : undefined} rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
});
InfoItem.displayName = 'InfoItem';

const VistaContacto = () => {
  const [datosForm, setDatosForm]               = useState(FORM_VACIO);
  const [enviando, setEnviando]                 = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [faqs, setFaqs]                         = useState([]);

  useEffect(() => {
    setFaqs(FAQS_FALLBACK);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setDatosForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const cerrarConfirmacion = useCallback(() => setMostrarConfirmacion(false), []);

  const validarYMostrarConfirmacion = useCallback(() => {
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
  }, [datosForm]);

  const confirmarYEnviar = useCallback(async () => {
    setMostrarConfirmacion(false);
    setEnviando(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.post('/contacto', datosForm, { headers });
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      setDatosForm(FORM_VACIO);
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al enviar el mensaje. Intenta de nuevo.';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  }, [datosForm]);

  return (
    <div className="vista-contacto">

      {mostrarConfirmacion && (
        <div className="confirmacion-overlay" onClick={cerrarConfirmacion}>
          <div className="confirmacion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmacion-header">
              <div className="confirmacion-icono" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <button type="button" className="confirmacion-btn-editar" onClick={cerrarConfirmacion}>
                Editar
              </button>
              <button type="button" className="confirmacion-btn-enviar" onClick={confirmarYEnviar}>
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="contacto-header">
        <h1>Contáctanos</h1>
        <p className="contacto-subtitulo">
          Estamos aquí para acompañarte en tu camino hacia una vida más saludable.
          Escríbenos, llámanos o visítanos — con gusto te orientamos.
        </p>
      </header>

      <div className="contacto-contenedor">

        <aside className="contacto-info" aria-label="Información de contacto">
          {INFO.map(info => (
            <InfoItem key={info.id} info={info} />
          ))}
        </aside>

        <section className="contacto-form" aria-labelledby="contacto-form-titulo">
          <h2 id="contacto-form-titulo">Envíanos un Mensaje</h2>

          <div className="campo-wrapper">
            <label htmlFor="contacto-nombre" className="sr-only">Nombre completo</label>
            <input
              id="contacto-nombre"
              type="text"
              name="nombre"
              placeholder="Nombre completo *"
              value={datosForm.nombre}
              onChange={handleChange}
              disabled={enviando}
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>

          <div className="campo-wrapper">
            <label htmlFor="contacto-email" className="sr-only">Correo electrónico</label>
            <input
              id="contacto-email"
              type="email"
              name="email"
              placeholder="Correo electrónico *"
              value={datosForm.email}
              onChange={handleChange}
              disabled={enviando}
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              required
            />
          </div>

          <div className="campo-wrapper">
            <label htmlFor="contacto-asunto" className="sr-only">Asunto</label>
            <input
              id="contacto-asunto"
              type="text"
              name="asunto"
              placeholder="Asunto"
              value={datosForm.asunto}
              onChange={handleChange}
              disabled={enviando}
              maxLength={120}
            />
          </div>

          <div className="campo-wrapper campo-textarea">
            <label htmlFor="contacto-mensaje" className="sr-only">Mensaje</label>
            <textarea
              id="contacto-mensaje"
              name="mensaje"
              placeholder="Mensaje *"
              rows={5}
              value={datosForm.mensaje}
              onChange={handleChange}
              disabled={enviando}
              maxLength={1000}
              required
            />
            <span className="campo-contador" aria-live="polite">{datosForm.mensaje.length}/1000</span>
          </div>

          <button
            type="button"
            className="btn-primario"
            onClick={validarYMostrarConfirmacion}
            disabled={enviando}
          >
            {enviando ? 'Enviando…' : 'Enviar Mensaje'}
          </button>
        </section>

      </div>

      <section className="seccion-faq-unificada" aria-labelledby="contacto-faq-titulo">
        <h2 id="contacto-faq-titulo" className="faq-titulo">Preguntas Frecuentes</h2>
        <div className="faq-tabla">
          {faqs.map((faq, index) => (
            <details key={faq._id} className="faq-fila">
              <summary>
                <span className="faq-numero">{String(index + 1).padStart(2, '0')}</span>
                <span className="faq-pregunta">{faq.pregunta}</span>
                <span className="faq-flecha" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="faq-respuesta">
                <p>{faq.respuesta}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
};

export default VistaContacto;