import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VistaPremium.css';

const VistaPremium = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState('beneficios'); // beneficios | metodo | pago | exito
  const [metodoPago, setMetodoPago] = useState(null);
  const [form, setForm] = useState({ nombre: '', numero: '', vencimiento: '', cvv: '', email: '', telefono: '' });
  const [procesando, setProcesando] = useState(false);
  const [errores, setErrores] = useState({});

  const beneficios = [
    { icono: '🤖', titulo: 'Asistente IA sin límites', desc: 'Consultas ilimitadas con IA para recetas 100% personalizadas según tu condición médica exacta.' },
    { icono: '📊', titulo: 'Plan nutricional semanal', desc: 'Análisis completo de tus necesidades y un plan de 7 días adaptado a ti automáticamente.' },
    { icono: '🔔', titulo: 'Recordatorios inteligentes', desc: 'Notificaciones que te ayudan a mantener tus horarios de comida y medicación.' },
    { icono: '📥', titulo: 'Descarga de recetas en PDF', desc: 'Exporta cualquier receta en PDF con información nutricional detallada.' },
    { icono: '🎯', titulo: 'Filtros avanzados exclusivos', desc: 'Combina múltiples condiciones de salud y preferencias con precisión quirúrgica.' },
    { icono: '⭐', titulo: 'Acceso anticipado', desc: 'Sé el primero en probar cada nueva función que lancemos antes que nadie.' },
  ];

  const metodos = [
    { id: 'visa',        nombre: 'Tarjeta Visa / Mastercard', icono: '💳', color: '#1a56db', campos: ['nombre', 'numero', 'vencimiento', 'cvv'] },
    { id: 'paypal',      nombre: 'PayPal',                    icono: '🅿️', color: '#003087', campos: ['email'] },
    { id: 'nequi',       nombre: 'Nequi',                     icono: '📱', color: '#6e2cb2', campos: ['telefono'] },
    { id: 'mercadopago', nombre: 'Mercado Pago',              icono: '💰', color: '#009ee3', campos: ['email'] },
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
    if (campos.includes('nombre')     && !form.nombre.trim())      errs.nombre = 'Requerido';
    if (campos.includes('numero')     && form.numero.replace(/\s/g,'').length < 16) errs.numero = 'Número inválido';
    if (campos.includes('vencimiento')&& !/^\d{2}\/\d{2}$/.test(form.vencimiento)) errs.vencimiento = 'Formato MM/AA';
    if (campos.includes('cvv')        && form.cvv.length < 3)      errs.cvv = 'CVV inválido';
    if (campos.includes('email')      && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido';
    if (campos.includes('telefono')   && form.telefono.replace(/\D/,'').length < 10) errs.telefono = 'Teléfono inválido';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePagar = () => {
    if (!validar()) return;
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      setPaso('exito');
    }, 2200);
  };

  const formatNumero = (val) => {
    return val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  };

  const formatVencimiento = (val) => {
    return val.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2');
  };

  return (
    <div className="vistaPremium">

      {/* ===== BENEFICIOS ===== */}
      {paso === 'beneficios' && (
        <>
          <div className="premium__hero">
            <div className="premium__hero-badge">✨ FUNCIÓN EXPERIMENTAL</div>
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
            <button className="premium__btn-volver" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
            <p className="premium__disclaimer">
              🔒 Pago simulado · No se realizan cargos reales · Datos de prueba
            </p>
          </div>
        </>
      )}

      {/* ===== MÉTODO DE PAGO ===== */}
      {paso === 'metodo' && (
        <div className="premium__paso-wrap">
          <button className="premium__back" onClick={() => setPaso('beneficios')}>
            ← Volver
          </button>
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
                <span className="premium__metodo-icono">{m.icono}</span>
                <span className="premium__metodo-nombre">{m.nombre}</span>
                {metodoPago === m.id && <span className="premium__metodo-check">✓</span>}
              </button>
            ))}
          </div>

          <button
            className="premium__btn-principal"
            disabled={!metodoPago}
            onClick={() => setPaso('pago')}
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ===== FORMULARIO PAGO ===== */}
      {paso === 'pago' && metodoActual && (
        <div className="premium__paso-wrap">
          <button className="premium__back" onClick={() => setPaso('metodo')}>
            ← Cambiar método
          </button>

          <div className="premium__pago-header">
            <span className="premium__metodo-icono-lg">{metodoActual.icono}</span>
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
                      onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/,'').slice(0,4) })}
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
                <label>Número de celular (Nequi)</label>
                <input name="telefono" placeholder="300 000 0000" value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value.replace(/[^\d\s]/g,'').slice(0,12) })}
                  className={errores.telefono ? 'error' : ''} />
                {errores.telefono && <span className="premium__error">{errores.telefono}</span>}
              </div>
            )}

            <button className="premium__btn-pagar" onClick={handlePagar} disabled={procesando}>
              {procesando ? (
                <span className="premium__spinner" />
              ) : (
                <>🔐 Confirmar pago — $9.900</>
              )}
            </button>

            <p className="premium__disclaimer">
              🔒 Simulación educativa · No se procesan datos bancarios reales
            </p>
          </div>
        </div>
      )}

      {/* ===== ÉXITO ===== */}
      {paso === 'exito' && (
        <div className="premium__exito">
          <div className="premium__exito-icono">🎉</div>
          <h2>¡Bienvenido a Premium!</h2>
          <p>Tu suscripción ha sido activada (simulación). Ahora tienes acceso a todas las funciones exclusivas.</p>
          <div className="premium__exito-beneficios">
            {beneficios.map((b, i) => (
              <span key={i} className="premium__exito-chip">{b.icono} {b.titulo}</span>
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