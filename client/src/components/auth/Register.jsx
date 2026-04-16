import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAge,
  validateRegisterForm,
} from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './Register.css';

/* ─── Iconos ─────────────────────────────────────────────── */
const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

/* ─── Aviso inline reutilizable ───────────────────────────── */
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: '1px' }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const AvisoInline = ({ titulo, mensaje, variante = 'naranja' }) => (
  <div className={`aviso-inline aviso-inline--${variante}`}>
    <InfoIcon />
    <span><strong>{titulo}</strong> {mensaje}</span>
  </div>
);

/* ─── Definición de avisos por campo ──────────────────────── */
const AVISOS = {
  nombre_caracteres: { titulo: 'Solo letras.',          mensaje: 'El nombre no puede contener números ni símbolos.',                                                    variante: 'naranja' },
  email_invalido:    { titulo: 'Formato incorrecto.',   mensaje: 'Escribe un correo válido, por ejemplo: usuario@correo.com.',                                          variante: 'naranja' },
  pass_debil:        { titulo: 'Contraseña débil.',     mensaje: 'Usa al menos 8 caracteres combinando mayúsculas, minúsculas y un número.',                            variante: 'naranja' },
  passConf_mismatch: { titulo: 'No coinciden.',         mensaje: 'Las contraseñas ingresadas son distintas. Verifícalas.',                                              variante: 'rojo'    },
  edad_menor:        { titulo: 'Acceso restringido.',   mensaje: 'Healthy Help está diseñado para mayores de 18 años. Si eres menor, consulta a un médico de confianza.', variante: 'naranja' },
  edad_invalida:     { titulo: 'Edad inválida.',        mensaje: 'Ingresa una edad entre 1 y 120 años.',                                                                variante: 'rojo'    },
  peso_bajo:         { titulo: 'Peso mínimo 40 kg.',    mensaje: 'Healthy Help requiere al menos 40 kg para calcular recomendaciones seguras.',                         variante: 'naranja' },
  peso_alto:         { titulo: 'Peso fuera de rango.',  mensaje: 'El valor máximo aceptado es 500 kg.',                                                                 variante: 'rojo'    },
  altura_baja:       { titulo: 'Altura mínima 50 cm.',  mensaje: 'Ingresa una altura válida entre 50 y 300 cm.',                                                        variante: 'naranja' },
  altura_alta:       { titulo: 'Altura fuera de rango.', mensaje: 'El valor máximo aceptado es 300 cm.',                                                                variante: 'rojo'    },
};

/* ─── Calcula qué aviso mostrar para cada campo ───────────── */
const calcularAviso = (field, value, datos) => {
  switch (field) {
    case 'nombre': {
      if (!value) return null;
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) return 'nombre_caracteres';
      return null;
    }
    case 'email': {
      if (!value) return null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email_invalido';
      return null;
    }
    case 'pass': {
      if (!value) return null;
      const fuerte = value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
      return fuerte ? null : 'pass_debil';
    }
    case 'passConf': {
      if (!value) return null;
      return value !== datos.pass ? 'passConf_mismatch' : null;
    }
    case 'edad': {
      if (!value) return null;
      const n = parseInt(value, 10);
      if (isNaN(n) || n < 1 || n > 120) return 'edad_invalida';
      if (n < 18) return 'edad_menor';
      return null;
    }
    case 'peso': {
      if (!value) return null;
      const n = parseFloat(value);
      if (isNaN(n) || n <= 0) return null;
      if (n < 40) return 'peso_bajo';
      if (n > 500) return 'peso_alto';
      return null;
    }
    case 'altura': {
      if (!value) return null;
      const n = parseFloat(value);
      if (isNaN(n) || n <= 0) return null;
      if (n < 50) return 'altura_baja';
      if (n > 300) return 'altura_alta';
      return null;
    }
    default:
      return null;
  }
};

/* ─── Input numérico con flechas ──────────────────────────── */
const NumeroInput = ({ name, value, onChange, onBlur, placeholder, min, max, step, disabled }) => {
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
      <input
        className=""
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        style={{ width: '100%', paddingRight: '2.2rem' }}
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

/* ─── Helpers de validación en tiempo real ────────────────── */
const validarCampo = (field, value, datos) => {
  switch (field) {
    case 'nombre': {
      const r = validateName(value);
      return r.isValid ? '' : r.error;
    }
    case 'email': {
      if (!value) return 'El correo es requerido';
      return validateEmail(value) ? '' : 'Correo inválido';
    }
    case 'pass': {
      const r = validatePassword(value);
      return r.isValid ? '' : r.errors[0];
    }
    case 'passConf': {
      if (!value) return 'Confirma tu contraseña';
      return value === datos.pass ? '' : 'Las contraseñas no coinciden';
    }
    case 'edad': {
      if (value === '' || value === undefined) return 'La edad es requerida';
      const r = validateAge(value);
      if (!r.isValid) return r.error === 'MINOR' ? 'Debes ser mayor de 18 años' : r.error;
      return '';
    }
    case 'peso': {
      if (value === '' || value === undefined) return '';
      const n = parseFloat(value);
      if (isNaN(n) || n < 40 || n > 500) return 'Ingresa un peso válido (40–500 kg)';
      return '';
    }
    case 'altura': {
      if (value === '' || value === undefined) return '';
      const n = parseFloat(value);
      if (isNaN(n) || n < 50 || n > 300) return 'Ingresa una altura válida (50–300 cm)';
      return '';
    }
    default:
      return '';
  }
};

/* ─── Hint de campo: muestra estado visual mientras escribe ── */
const FieldHint = ({ field, value, datos, touched }) => {
  if (!touched) return null;

  const hints = {
    nombre: [
      { ok: value && value.trim().length >= 2, label: 'Mínimo 2 caracteres' },
      { ok: value && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim()), label: 'Solo letras y espacios' },
    ],
    email: [
      { ok: value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), label: 'Formato válido (ejemplo@correo.com)' },
    ],
    pass: [
      { ok: value && value.length >= 8,        label: 'Mínimo 8 caracteres' },
      { ok: value && /[a-z]/.test(value),       label: 'Una letra minúscula' },
      { ok: value && /[A-Z]/.test(value),       label: 'Una letra mayúscula' },
      { ok: value && /\d/.test(value),          label: 'Un número' },
    ],
    passConf: [
      { ok: value && value === datos.pass, label: 'Las contraseñas coinciden' },
    ],
    edad: [
      { ok: value && parseInt(value, 10) >= 18 && parseInt(value, 10) <= 120, label: 'Entre 18 y 120 años' },
    ],
    peso: value ? [
      { ok: parseFloat(value) >= 40,  label: 'Mínimo 40 kg' },
      { ok: parseFloat(value) <= 500, label: 'Máximo 500 kg' },
    ] : [],
    altura: value ? [
      { ok: parseFloat(value) >= 50 && parseFloat(value) <= 300, label: 'Entre 50 y 300 cm' },
    ] : [],
  };

  const items = hints[field] || [];
  if (items.length === 0) return null;

  const allOk = items.every(i => i.ok);
  if (allOk && field !== 'pass') return null;

  return (
    <ul className="field-hints">
      {items.map((item, idx) => (
        <li key={idx} className={item.ok ? 'hint-ok' : 'hint-pending'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
            {item.ok
              ? <polyline points="20 6 9 17 4 12"/>
              : <circle cx="12" cy="12" r="9"/>
            }
          </svg>
          {item.label}
        </li>
      ))}
    </ul>
  );
};

/* ─── Componente principal ────────────────────────────────── */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const STORAGE_KEY = 'register_form_draft';

  const [datos, setDatos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, pass: '', passConf: '' };
      }
    } catch {}
    return { nombre: '', email: '', pass: '', passConf: '', edad: '', peso: '', altura: '' };
  });

  // Guardar borrador (sin contraseñas)
  useEffect(() => {
    const { pass, passConf, ...sinPass } = datos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sinPass));
  }, [datos]);

  const [errors, setErrors]             = useState({});
  const [touched, setTouched]           = useState({});
  const [loading, setLoading]           = useState(false);
  const [showPass, setShowPass]         = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);

  // Avisos inline en tiempo real — una clave por campo
  const [avisos, setAvisos] = useState({});

  /* Cambio con validación en tiempo real */
  const handleChange = (field, value) => {
    const nuevosDatos = { ...datos, [field]: value };
    setDatos(nuevosDatos);

    // Validar siempre una vez que el campo fue tocado
    if (touched[field]) {
      const error = validarCampo(field, value, nuevosDatos);
      const extraErrors = {};
      if (field === 'pass' && touched['passConf']) {
        extraErrors.passConf = validarCampo('passConf', nuevosDatos.passConf, nuevosDatos);
      }
      setErrors((prev) => ({ ...prev, [field]: error, ...extraErrors }));
    }

    // Actualizar aviso inline en tiempo real para todos los campos
    const avisoKey = calcularAviso(field, value, nuevosDatos);
    const extraAvisos = {};
    // Si cambia la contraseña, recalcular también el aviso de confirmación
    if (field === 'pass') {
      extraAvisos.passConf = calcularAviso('passConf', nuevosDatos.passConf, nuevosDatos);
    }
    setAvisos((prev) => ({ ...prev, [field]: avisoKey, ...extraAvisos }));
  };

  /* Marcar campo como tocado al salir */
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validarCampo(field, datos[field], datos);
    setErrors((prev) => ({ ...prev, [field]: error }));
    // Asegurar aviso al salir aunque no haya escrito
    const avisoKey = calcularAviso(field, datos[field], datos);
    setAvisos((prev) => ({ ...prev, [field]: avisoKey }));
  };

  /* Envío */
  const manejarRegistro = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(datos).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    const validationErrors = validateRegisterForm(
      datos.nombre, datos.email, datos.pass, datos.passConf, datos.edad
    );

    if (validationErrors.edad === 'MINOR') {
      setAvisos((prev) => ({ ...prev, edad: 'edad_menor' }));
      setErrors({ ...validationErrors, edad: 'Debes ser mayor de 18 años' });
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await register({
      name:     datos.nombre,
      email:    datos.email,
      password: datos.pass,
      age:      parseInt(datos.edad, 10),
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

  // Helper para renderizar el aviso de un campo
  const renderAviso = (field) => {
    const key = avisos[field];
    if (!key || !AVISOS[key]) return null;
    const { titulo, mensaje, variante } = AVISOS[key];
    return <AvisoInline titulo={titulo} mensaje={mensaje} variante={variante} />;
  };

  return (
    <div className="vistaAuth">

      <div className="authCard">
        {/* ── Header ── */}
        <div className="auth-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353
              a3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05
              a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69
              4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1
              3.926 19.743 3.014 20.732 2 22"/>
          </svg>
          <span className="auth-brand-nombre">Healthy Help</span>
        </div>

        <h2>Crear cuenta</h2>

        <form className="authForm" onSubmit={manejarRegistro} noValidate>

          {/* Nombre */}
          <div className="formGroup">
            <input
              type="text"
              placeholder="Nombre completo"
              value={datos.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              onBlur={() => handleBlur('nombre')}
              className={touched.nombre && errors.nombre ? 'inputError' : touched.nombre && !errors.nombre && datos.nombre ? 'inputOk' : ''}
              disabled={loading}
              autoComplete="name"
            />
            <FieldHint field="nombre" value={datos.nombre} datos={datos} touched={touched.nombre} />
            {renderAviso('nombre')}
            {touched.nombre && errors.nombre && <span className="errorMessage">{errors.nombre}</span>}
          </div>

          {/* Edad */}
          <div className="formGroup">
            <NumeroInput
              name="edad"
              value={datos.edad}
              placeholder="Edad"
              onChange={(e) => handleChange('edad', e.target.value)}
              onBlur={() => handleBlur('edad')}
              min={1}
              max={120}
              step={1}
              disabled={loading}
            />
            <FieldHint field="edad" value={datos.edad} datos={datos} touched={touched.edad} />
            {renderAviso('edad')}
            {touched.edad && errors.edad && <span className="errorMessage">{errors.edad}</span>}
          </div>

          {/* Peso (opcional) */}
          <div className="formGroup">
            <NumeroInput
              name="peso"
              value={datos.peso}
              placeholder="Peso (kg) — opcional"
              onChange={(e) => handleChange('peso', e.target.value)}
              onBlur={() => handleBlur('peso')}
              min={1}
              max={500}
              step={0.1}
              disabled={loading}
            />
            <FieldHint field="peso" value={datos.peso} datos={datos} touched={touched.peso} />
            {renderAviso('peso')}
            {touched.peso && errors.peso && <span className="errorMessage">{errors.peso}</span>}
          </div>

          {/* Altura (opcional) */}
          <div className="formGroup">
            <NumeroInput
              name="altura"
              value={datos.altura}
              placeholder="Altura (cm) — opcional"
              onChange={(e) => handleChange('altura', e.target.value)}
              onBlur={() => handleBlur('altura')}
              min={50}
              max={300}
              step={1}
              disabled={loading}
            />
            <FieldHint field="altura" value={datos.altura} datos={datos} touched={touched.altura} />
            {renderAviso('altura')}
            {touched.altura && errors.altura && <span className="errorMessage">{errors.altura}</span>}
          </div>

          {/* Email */}
          <div className="formGroup">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={datos.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={touched.email && errors.email ? 'inputError' : touched.email && !errors.email && datos.email ? 'inputOk' : ''}
              disabled={loading}
              autoComplete="email"
            />
            <FieldHint field="email" value={datos.email} datos={datos} touched={touched.email} />
            {renderAviso('email')}
            {touched.email && errors.email && <span className="errorMessage">{errors.email}</span>}
          </div>

          {/* Contraseña */}
          <div className="formGroup">
            <div className="inputWrapper">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Contraseña"
                value={datos.pass}
                onChange={(e) => handleChange('pass', e.target.value)}
                onBlur={() => handleBlur('pass')}
                className={touched.pass && errors.pass ? 'inputError' : touched.pass && !errors.pass && datos.pass ? 'inputOk' : ''}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eyeButton"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            <FieldHint field="pass" value={datos.pass} datos={datos} touched={touched.pass} />
            {renderAviso('pass')}
            {touched.pass && errors.pass && <span className="errorMessage">{errors.pass}</span>}
          </div>

          {/* Confirmar contraseña */}
          <div className="formGroup">
            <div className="inputWrapper">
              <input
                type={showPassConf ? 'text' : 'password'}
                placeholder="Confirmar contraseña"
                value={datos.passConf}
                onChange={(e) => handleChange('passConf', e.target.value)}
                onBlur={() => handleBlur('passConf')}
                className={touched.passConf && errors.passConf ? 'inputError' : touched.passConf && !errors.passConf && datos.passConf ? 'inputOk' : ''}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eyeButton"
                onClick={() => setShowPassConf(!showPassConf)}
                tabIndex={-1}
              >
                <EyeIcon open={showPassConf} />
              </button>
            </div>
            <FieldHint field="passConf" value={datos.passConf} datos={datos} touched={touched.passConf} />
            {renderAviso('passConf')}
            {touched.passConf && errors.passConf && <span className="errorMessage">{errors.passConf}</span>}
          </div>

          {/* Error general (ej: sin conexión al servidor) */}
          {errors.general && (
            <div className="errorMessage errorGeneral">
              ⚠️ {errors.general}
            </div>
          )}

          <button type="submit" className="btn-primario" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="linkText">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;