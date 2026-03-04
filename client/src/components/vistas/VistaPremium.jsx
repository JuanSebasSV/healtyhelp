import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VistaPremium.css';

// ============ SVGs BENEFICIOS ============
const IconoIA = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
    <circle cx="9" cy="14" r="1" fill="currentColor"/>
    <circle cx="15" cy="14" r="1" fill="currentColor"/>
  </svg>
);

const IconoPlan = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M3 9h18M9 21V9M7 6h.01M12 6h.01M17 6h.01"/>
  </svg>
);

const IconoNotif = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconoPDF = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M9 13h6M9 17h4"/>
  </svg>
);

const IconoFiltro = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const IconoEstrella = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconoCandado = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{display:'inline',verticalAlign:'middle'}}>
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// ============ SVGs MÉTODOS DE PAGO (logos oficiales) ============
const LogoVisa = () => (
  <svg viewBox="0 0 80 26" width="56" height="20" aria-label="Visa">
    <rect width="80" height="26" rx="4" fill="white" opacity="0.15"/>
    <path fill="white" d="M30.6 1.3L19.9 24.7h-6.8L7.5 6.8C7.1 5.3 6.7 4.8 5.5 4.2 3.6 3.2 0.5 2.3 0 2.1L0.1 1.3h10.9c1.4 0 2.6 1 3 2.4l2.7 14.4L23.8 1.3h6.8zm26.8 15.7c0-6.6-9.1-7-9.1-9.9 0-.9.9-1.8 2.7-2.1 1.7-.2 3.5.1 5 .8l.9-4.2C55.5.8 53.4.3 51.2.3c-6.3 0-10.7 3.3-10.8 8.1-.1 3.5 3.1 5.5 5.5 6.7 2.4 1.2 3.2 2 3.2 3.1 0 1.6-1.9 2.4-3.7 2.4-3.1.1-4.9-.8-6.3-1.5l-1.1 5.2c1.4.7 4.1 1.2 6.8 1.3 6.7 0 11.1-3.3 11.1-8.6l.3-.3zm16.7 7.7H80L74.4 1.3h-5.5c-1.2 0-2.3.7-2.7 1.8L57.9 24.7h6.8l1.3-3.7h8.3l.8 3.7zm-7.2-8.8l3.4-9.4 2 9.4h-5.4zM37.9 1.3l-5.4 23.4h-6.4L31.4 1.3h6.5z"/>
  </svg>
);

const LogoMastercard = () => (
  <svg viewBox="0 0 48 30" width="48" height="30" aria-label="Mastercard">
    <rect width="48" height="30" rx="4" fill="#252525"/>
    <circle cx="18" cy="15" r="9" fill="#EB001B"/>
    <circle cx="30" cy="15" r="9" fill="#F79E1B"/>
    <path d="M24 8.3a9 9 0 0 1 0 13.4A9 9 0 0 1 24 8.3z" fill="#FF5F00"/>
  </svg>
);

const LogoPayPal = () => (
  <svg viewBox="0 0 90 28" width="80" height="26" aria-label="PayPal">
    <text x="0" y="21" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="22" fontWeight="800">
      <tspan fill="#60c8f5">Pay</tspan><tspan fill="white">Pal</tspan>
    </text>
  </svg>
);

const LogoNequi = () => (
  <svg viewBox="0 0 90 34" width="82" height="30" aria-label="Nequi">
    <rect width="90" height="34" rx="8" fill="#6B21A8"/>
    {/* N shape */}
    <path d="M10 8 L10 26 L15 26 L15 16 L22 26 L27 26 L27 8 L22 8 L22 18 L15 8 Z" fill="white"/>
    {/* equi text */}
    <text x="31" y="22" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="13"
      fontWeight="700" fill="white" letterSpacing="0.3">equi</text>
    {/* pink dot accent */}
    <circle cx="80" cy="10" r="4" fill="#F472B6"/>
  </svg>
);

const LogoMercadoPago = () => (
  <svg viewBox="0 0 130 34" width="110" height="30" aria-label="Mercado Pago">
    <circle cx="17" cy="17" r="15" fill="#009EE3"/>
    <path fill="white" d="M17 6a11 11 0 1 0 0 22A11 11 0 0 0 17 6zm0 3.5c1.8 0 3.5.7 4.7 1.8L10.2 22.8A7.5 7.5 0 0 1 17 9.5zm0 15c-1.8 0-3.5-.7-4.7-1.8l11.5-11.5A7.47 7.47 0 0 1 24.5 17c0 4.1-3.4 7.5-7.5 7.5z"/>
    <text x="36" y="14" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="9.5" fontWeight="700" fill="#009EE3" letterSpacing="0.2">mercado</text>
    <text x="36" y="26" fontFamily="'Helvetica Neue', Arial, sans-serif" fontSize="9.5" fontWeight="700" fill="#009EE3" letterSpacing="0.2">pago</text>
  </svg>
);

// ============ COMPONENTE PRINCIPAL ============
const VistaPremium = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('beneficios');
  const [metodoPago, setMetodoPago] = useState(null);
  const [form, setForm] = useState({ nombre: '', numero: '', vencimiento: '', cvv: '', email: '', telefono: '' });
  const [procesando, setProcesando] = useState(false);
  const [errores, setErrores] = useState({});

  const beneficios = [
    { icono: <IconoIA />,       titulo: 'Asistente IA sin límites',    desc: 'Consultas ilimitadas con IA para recetas 100% personalizadas según tu condición médica exacta.' },
    { icono: <IconoPlan />,     titulo: 'Plan nutricional semanal',     desc: 'Análisis completo de tus necesidades y un plan de 7 días adaptado a ti automáticamente.' },
    { icono: <IconoNotif />,    titulo: 'Recordatorios inteligentes',   desc: 'Notificaciones que te ayudan a mantener tus horarios de comida y medicación.' },
    { icono: <IconoPDF />,      titulo: 'Descarga de recetas en PDF',   desc: 'Exporta cualquier receta en PDF con información nutricional detallada.' },
    { icono: <IconoFiltro />,   titulo: 'Filtros avanzados exclusivos', desc: 'Combina múltiples condiciones de salud y preferencias con precisión quirúrgica.' },
    { icono: <IconoEstrella />, titulo: 'Acceso anticipado',            desc: 'Sé el primero en probar cada nueva función que lancemos antes que nadie.' },
  ];

  const metodos = [
    { id: 'visa',        nombre: 'Visa / Mastercard', logo: <><LogoVisa /><LogoMastercard /></>, logoHdr: <><LogoVisa /><LogoMastercard /></>, color: '#1a56db', campos: ['nombre', 'numero', 'vencimiento', 'cvv'] },
    { id: 'paypal',      nombre: 'PayPal',            logo: <LogoPayPal />,                     logoHdr: <LogoPayPal />,                    color: '#003087', campos: ['email'] },
    { id: 'nequi',       nombre: 'Nequi',             logo: <LogoNequi />,                      logoHdr: <LogoNequi />,                     color: '#6e2cb2', campos: ['telefono'] },
    { id: 'mercadopago', nombre: 'Mercado Pago',      logo: <LogoMercadoPago />,                logoHdr: <LogoMercadoPago />,               color: '#009ee3', campos: ['email'] },
  ];

  const metodoActual = metodos.find(m => m.id === metodoPago);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: '' });
  };

  const validar = () => {
    const errs = {};
    if (!metodoPago) return false;
    const campos = metodoActual.campos;
    if (campos.includes('nombre')      && !form.nombre.trim())                         errs.nombre = 'Requerido';
    if (campos.includes('numero')      && form.numero.replace(/\s/g,'').length < 16)   errs.numero = 'Número inválido';
    if (campos.includes('vencimiento') && !/^\d{2}\/\d{2}$/.test(form.vencimiento))    errs.vencimiento = 'Formato MM/AA';
    if (campos.includes('cvv')         && form.cvv.length < 3)                         errs.cvv = 'CVV inválido';
    if (campos.includes('email')       && !/\S+@\S+\.\S+/.test(form.email))            errs.email = 'Email inválido';
    if (campos.includes('telefono')    && form.telefono.replace(/\D/g,'').length < 10) errs.telefono = 'Teléfono inválido';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePagar = () => {
    if (!validar()) return;
    setProcesando(true);
    setTimeout(() => { setProcesando(false); setPaso('exito'); }, 2200);
  };

  const formatNumero     = (val) => val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatVencimiento = (val) => val.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2');

  return (
    <div className="vistaPremium">

      {/* ===== BENEFICIOS ===== */}
      {paso === 'beneficios' && (
        <>
          <div className="premium__hero">
            <div className="premium__hero-badge">✦ FUNCIÓN EXPERIMENTAL</div>
            <h1 className="premium__hero-titulo">
              Healthy Help <span className="premium__dorado">Premium</span>
            </h1>
            <p className="premium__hero-sub">
              Lleva tu salud al siguiente nivel con herramientas de IA y planes personalizados.
            </p>
            <div className="premium__precio">
              <span className="premium__precio-antes">$19.900</span>
              <span className="premium__precio-actual">$9.900</span>
              <span className="premium__precio-periodo">/ mes</span>
            </div>
          </div>

          <div className="premium__beneficios-grid">
            {beneficios.map((b, i) => (
              <div key={i} className="premium__beneficio-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="premium__beneficio-icono">{b.icono}</span>
                <div>
                  <h3>{b.titulo}</h3>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="premium__cta-wrap">
            <button className="premium__btn-principal" onClick={() => setPaso('metodo')}>
              <span>Quiero Premium</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="premium__btn-volver" onClick={() => navigate('/')}>Volver al inicio</button>
            <p className="premium__disclaimer"><IconoCandado /> Pago simulado · No se realizan cargos reales</p>
          </div>
        </>
      )}

      {/* ===== MÉTODO DE PAGO ===== */}
      {paso === 'metodo' && (
        <div className="premium__paso-wrap">
          <button className="premium__back" onClick={() => setPaso('beneficios')}>← Volver</button>
          <h2 className="premium__paso-titulo">Elige tu método de pago</h2>
          <p className="premium__paso-sub">Todos los métodos son simulados. No se realizan cargos reales.</p>

          <div className="premium__metodos-grid">
            {metodos.map(m => (
              <button
                key={m.id}
                className={`premium__metodo-card ${metodoPago === m.id ? 'activo' : ''}`}
                onClick={() => setMetodoPago(m.id)}
                style={{ '--metodo-color': m.color }}
              >
                <div className="premium__metodo-logos">{m.logo}</div>
                <span className="premium__metodo-nombre">{m.nombre}</span>
                {metodoPago === m.id && (
                  <span className="premium__metodo-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          <button className="premium__btn-principal" disabled={!metodoPago} onClick={() => setPaso('pago')}>
            Continuar →
          </button>
        </div>
      )}

      {/* ===== FORMULARIO PAGO ===== */}
      {paso === 'pago' && metodoActual && (
        <div className="premium__paso-wrap">
          <button className="premium__back" onClick={() => setPaso('metodo')}>← Cambiar método</button>

          <div className="premium__pago-header">
            <div className="premium__metodo-logos-lg">{metodoActual.logoHdr}</div>
            <div>
              <h2 className="premium__paso-titulo" style={{ marginBottom: '0.2rem' }}>
                Pagar con {metodoActual.nombre}
              </h2>
              <p className="premium__paso-sub">Total: <strong>$9.900 COP / mes</strong></p>
            </div>
          </div>

          <div className="premium__form">
            {metodoActual.campos.includes('nombre') && (
              <div className="premium__campo">
                <label>Nombre en la tarjeta</label>
                <input name="nombre" placeholder="Ej: Juan Pérez" value={form.nombre} onChange={handleChange} className={errores.nombre ? 'error' : ''} />
                {errores.nombre && <span className="premium__error">{errores.nombre}</span>}
              </div>
            )}
            {metodoActual.campos.includes('numero') && (
              <div className="premium__campo">
                <label>Número de tarjeta</label>
                <input name="numero" placeholder="0000 0000 0000 0000" value={form.numero}
                  onChange={e => setForm({ ...form, numero: formatNumero(e.target.value) })}
                  className={errores.numero ? 'error' : ''} maxLength={19} />
                {errores.numero && <span className="premium__error">{errores.numero}</span>}
              </div>
            )}
            {(metodoActual.campos.includes('vencimiento') || metodoActual.campos.includes('cvv')) && (
              <div className="premium__campo-row">
                {metodoActual.campos.includes('vencimiento') && (
                  <div className="premium__campo">
                    <label>Vencimiento</label>
                    <input name="vencimiento" placeholder="MM/AA" value={form.vencimiento}
                      onChange={e => setForm({ ...form, vencimiento: formatVencimiento(e.target.value) })}
                      className={errores.vencimiento ? 'error' : ''} maxLength={5} />
                    {errores.vencimiento && <span className="premium__error">{errores.vencimiento}</span>}
                  </div>
                )}
                {metodoActual.campos.includes('cvv') && (
                  <div className="premium__campo">
                    <label>CVV</label>
                    <input name="cvv" placeholder="123" value={form.cvv}
                      onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })}
                      className={errores.cvv ? 'error' : ''} maxLength={4} />
                    {errores.cvv && <span className="premium__error">{errores.cvv}</span>}
                  </div>
                )}
              </div>
            )}
            {metodoActual.campos.includes('email') && (
              <div className="premium__campo">
                <label>Correo de {metodoActual.nombre}</label>
                <input name="email" type="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={handleChange} className={errores.email ? 'error' : ''} />
                {errores.email && <span className="premium__error">{errores.email}</span>}
              </div>
            )}
            {metodoActual.campos.includes('telefono') && (
              <div className="premium__campo">
                <label>Número de celular</label>
                <input name="telefono" placeholder="300 000 0000" value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value.replace(/[^\d\s]/g,'').slice(0,12) })}
                  className={errores.telefono ? 'error' : ''} />
                {errores.telefono && <span className="premium__error">{errores.telefono}</span>}
              </div>
            )}

            <button className="premium__btn-pagar" onClick={handlePagar} disabled={procesando}>
              {procesando ? <span className="premium__spinner" /> : <><IconoCandado />&nbsp; Confirmar pago — $9.900</>}
            </button>
            <p className="premium__disclaimer"><IconoCandado /> Simulación educativa · No se procesan datos bancarios reales</p>
          </div>
        </div>
      )}

      {/* ===== ÉXITO ===== */}
      {paso === 'exito' && (
        <div className="premium__exito">
          <div className="premium__exito-icono">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <h2>¡Bienvenido a Premium!</h2>
          <p>Tu suscripción ha sido activada (simulación). Ahora tienes acceso a todas las funciones exclusivas.</p>
          <div className="premium__exito-beneficios">
            {beneficios.map((b, i) => (
              <span key={i} className="premium__exito-chip">
                <span className="chip-icono">{b.icono}</span>{b.titulo}
              </span>
            ))}
          </div>
          <button className="premium__btn-principal" onClick={() => navigate('/')}>
            Explorar Healthy Help →
          </button>
        </div>
      )}

    </div>
  );
};

export default VistaPremium;