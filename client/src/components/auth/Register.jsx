import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateRegisterForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './Register.css';

const EyeIcon = ({ open }) => (
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

// Modal aviso menores
const ModalMenor = ({ onCerrar }) => (
  <div className="modal-overlay" onClick={onCerrar}>
    <div className="modal-menor" onClick={e => e.stopPropagation()}>
      <div className="modal-menor__icono">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3>Acceso restringido</h3>
      <p>
        Healthy Help está diseñado para adultos mayores de 18 años.
        El contenido nutricional y los planes de alimentación requieren
        supervisión de un adulto o profesional de la salud para menores de edad.
      </p>
      <p className="modal-menor__sugerencia">
        Si eres menor de edad, consulta a un médico o nutricionista de confianza.
      </p>
      <button className="modal-menor__btn" onClick={onCerrar}>Entendido</button>
    </div>
  </div>
);


const NumeroInput = ({ name, value, onChange, placeholder, min, max, step, disabled }) => {
  const s = parseFloat(step) || 1;
  const increment = () => {
    const v = parseFloat(value) || (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({ target: { name, value: String(parseFloat((v + s).toFixed(4))) } });
  };
  const decrement = () => {
    const v = parseFloat(value) || (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({ target: { name, value: String(parseFloat((v - s).toFixed(4))) } });
  };
  return (
    <div className="numero-wrapper">
      <input className={''} type="number" name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        min={min} max={max} step={step} disabled={disabled}
        style={{width:'100%', paddingRight:'2.2rem'}}
      />
      <div className="numero-flechas">
        <button type="button" onClick={increment} disabled={disabled}>
          <svg viewBox="0 0 24 24" fill="none"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button type="button" onClick={decrement} disabled={disabled}>
          <svg viewBox="0 0 24 24" fill="none"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const STORAGE_KEY = 'register_form_draft';

  const [datos, setDatos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Nunca recuperar contraseñas
        return { ...parsed, pass: '', passConf: '' };
      }
    } catch {}
    return { nombre: '', email: '', pass: '', passConf: '', edad: '18', peso: '', altura: '' };
  });

  // Guardar borrador en localStorage (excepto contraseñas)
  useEffect(() => {
    const { pass, passConf, ...sinPass } = datos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sinPass));
  }, [datos]);

  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [showPass, setShowPass]         = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);
  const [mostrarModalMenor, setMostrarModalMenor] = useState(false);

  const manejarRegistro = async () => {
    const validationErrors = validateRegisterForm(
      datos.nombre, datos.email, datos.pass, datos.passConf, datos.edad
    );

    // Detectar menores
    if (validationErrors.edad === 'MINOR') {
      setMostrarModalMenor(true);
      setErrors({ ...validationErrors, edad: 'Debes ser mayor de 18 años' });
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await register({
      name: datos.nombre,
      email: datos.email,
      password: datos.pass,
      age: parseInt(datos.edad, 10),
      ...(datos.peso   && { weight: parseFloat(datos.peso) }),
      ...(datos.altura && { height: parseFloat(datos.altura) }),
    });

    if (result.success || result.needsVerification) {
      localStorage.removeItem(STORAGE_KEY);
      toast.success('¡Cuenta creada! Revisa tu correo para verificar.');
      navigate('/verificar-email', { state: { email: datos.email } });
    } else {
      toast.error(result.error || 'Error al crear la cuenta');
      setErrors({ general: result.error });
    }

    setLoading(false);
  };

  const handleChange = (field, value) => {
    setDatos({ ...datos, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="vistaAuth">
      {mostrarModalMenor && <ModalMenor onCerrar={() => setMostrarModalMenor(false)} />}

      <div className="authCard">
        {/* ── Header Healthy Help ── */}
        <div className="auth-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/>
          </svg>
          <span className="auth-brand-nombre">Healthy Help</span>
        </div>
        <h2>Crear cuenta</h2>
        <div className="authForm">

          <div className="formGroup">
            <input type="text" placeholder="Nombre completo" value={datos.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={errors.nombre ? 'inputError' : ''} disabled={loading}
            />
            {errors.nombre && <span className="errorMessage">{errors.nombre}</span>}
          </div>

          <div className="formGroup">
            <NumeroInput name="edad" value={datos.edad} placeholder="Edad"
              onChange={(e) => handleChange('edad', e.target.value)}
              min={18} max={100} step={1} disabled={loading} />
            {errors.edad && <span className="errorMessage">{errors.edad}</span>}
          </div>

          <div className="formGroup">
            <NumeroInput name="peso" value={datos.peso} placeholder="Peso (kg) — opcional"
              onChange={(e) => handleChange('peso', e.target.value)}
              min={40} max={150} step={0.1} disabled={loading} />
          </div>

          <div className="formGroup">
            <NumeroInput name="altura" value={datos.altura} placeholder="Altura (cm) — opcional"
              onChange={(e) => handleChange('altura', e.target.value)}
              min={50} max={210} step={1} disabled={loading} />
          </div>

          <div className="formGroup">
            <input type="email" placeholder="Correo electrónico" value={datos.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'inputError' : ''} disabled={loading}
            />
            {errors.email && <span className="errorMessage">{errors.email}</span>}
          </div>

          <div className="formGroup">
            {/* Requisitos de contraseña — visibles antes de escribir */}
            <div className="password-requisitos-previos">
              <p className="req-titulo">La contraseña debe tener:</p>
              <ul>
                <li className={datos.pass.length >= 8 ? 'req-ok' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Mínimo 8 caracteres
                </li>
                <li className={/[a-z]/.test(datos.pass) ? 'req-ok' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Una letra minúscula
                </li>
                <li className={/[A-Z]/.test(datos.pass) ? 'req-ok' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Una letra mayúscula
                </li>
                <li className={/\d/.test(datos.pass) ? 'req-ok' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Un número
                </li>
              </ul>
            </div>
            <div className="inputWrapper">
              <input type={showPass ? 'text' : 'password'} placeholder="Contraseña" value={datos.pass}
                onChange={(e) => handleChange('pass', e.target.value)}
                className={errors.password ? 'inputError' : ''} disabled={loading}
              />
              <button type="button" className="eyeButton" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                <EyeIcon open={showPass} />
              </button>
            </div>
            {errors.password && <span className="errorMessage">{errors.password}</span>}
          </div>

          <div className="formGroup">
            <div className="inputWrapper">
              <input type={showPassConf ? 'text' : 'password'} placeholder="Confirmar contraseña" value={datos.passConf}
                onChange={(e) => handleChange('passConf', e.target.value)}
                className={errors.passwordConf ? 'inputError' : ''} disabled={loading}
              />
              <button type="button" className="eyeButton" onClick={() => setShowPassConf(!showPassConf)} tabIndex={-1}>
                <EyeIcon open={showPassConf} />
              </button>
            </div>
            {errors.passwordConf && <span className="errorMessage">{errors.passwordConf}</span>}
          </div>

          {errors.general && (
            <div className="errorMessage" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}

          <button onClick={manejarRegistro} className="btn-primario" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </div>
        <p>¿Ya tienes cuenta? <Link to="/login" className="linkText">Inicia sesión</Link></p>
      </div>
    </div>
  );
};

export default Register;