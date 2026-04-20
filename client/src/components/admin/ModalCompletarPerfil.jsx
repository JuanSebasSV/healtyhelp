import { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './ModalCompletarPerfil.css';

/* ═══════════════════════════════════════════════════════════════
   AVISOS — misma estructura que Register.jsx
   ═══════════════════════════════════════════════════════════════ */
const AVISOS = {
  age_menor:    { titulo: 'Edad mínima.',          mensaje: 'Debes tener al menos 18 años.',                                        variante: 'naranja' },
  age_invalida: { titulo: 'Edad inválida.',         mensaje: 'Ingresa una edad entre 18 y 100 años.',                               variante: 'rojo'    },
  weight_bajo:  { titulo: 'Peso mínimo 40 kg.',     mensaje: 'Healthy Help requiere al menos 40 kg para calcular recomendaciones.', variante: 'naranja' },
  weight_alto:  { titulo: 'Peso fuera de rango.',   mensaje: 'El valor máximo aceptado es 300 kg.',                                 variante: 'rojo'    },
  height_baja:  { titulo: 'Altura mínima 50 cm.',   mensaje: 'Ingresa una altura válida entre 50 y 210 cm.',                       variante: 'naranja' },
  height_alta:  { titulo: 'Altura fuera de rango.', mensaje: 'El valor máximo aceptado es 210 cm.',                                variante: 'rojo'    },
};

/* ── Calcula qué aviso mostrar por campo ── */
const calcularAviso = (field, value) => {
  const n = parseFloat(value);
  switch (field) {
    case 'age': {
      if (!value) return null;
      const edad = parseInt(value, 10);
      if (isNaN(edad) || edad < 1 || edad > 100) return 'age_invalida';
      if (edad < 18) return 'age_menor';
      return null;
    }
    case 'weight': {
      if (!value) return null;
      if (isNaN(n) || n <= 0) return null;
      if (n < 40)  return 'weight_bajo';
      if (n > 300) return 'weight_alto';
      return null;
    }
    case 'height': {
      if (!value) return null;
      if (isNaN(n) || n <= 0) return null;
      if (n < 50)  return 'height_baja';
      if (n > 210) return 'height_alta';
      return null;
    }
    default:
      return null;
  }
};

/* ── Validación de error por campo ── */
const validarCampo = (field, value) => {
  const n = parseFloat(value);
  switch (field) {
    case 'age': {
      if (!value) return 'La edad es requerida';
      const edad = parseInt(value, 10);
      if (isNaN(edad) || edad < 18 || edad > 100) return 'Edad válida entre 18 y 100 años';
      return '';
    }
    case 'weight': {
      if (!value) return 'El peso es requerido';
      if (isNaN(n) || n < 40 || n > 300) return 'Peso válido entre 40 y 300 kg';
      return '';
    }
    case 'height': {
      if (!value) return 'La altura es requerida';
      if (isNaN(n) || n < 50 || n > 210) return 'Altura válida entre 50 y 210 cm';
      return '';
    }
    default:
      return '';
  }
};

/* ═══════════════════════════════════════════════════════════════
   FIELD HINT — checks en tiempo real (igual que Register)
   ═══════════════════════════════════════════════════════════════ */
const FieldHint = ({ field, value, touched }) => {
  if (!touched) return null;

  const hints = {
    age: [
      { ok: value && parseInt(value, 10) >= 18,  label: 'Mínimo 18 años' },
      { ok: value && parseInt(value, 10) <= 100, label: 'Máximo 100 años' },
    ],
    weight: value ? [
      { ok: parseFloat(value) >= 40,  label: 'Mínimo 40 kg' },
      { ok: parseFloat(value) <= 300, label: 'Máximo 300 kg' },
    ] : [],
    height: value ? [
      { ok: parseFloat(value) >= 50,  label: 'Mínimo 50 cm' },
      { ok: parseFloat(value) <= 210, label: 'Máximo 210 cm' },
    ] : [],
  };

  const items = hints[field] || [];
  if (items.length === 0) return null;
  if (items.every(i => i.ok)) return null;

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

/* ═══════════════════════════════════════════════════════════════
   AVISO INLINE — idéntico al de Register
   ═══════════════════════════════════════════════════════════════ */
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
  <div className={`completar-aviso completar-aviso--${variante}`}>
    <InfoIcon />
    <span><strong>{titulo}</strong> {mensaje}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   NUMERO INPUT — igual que Register
   ═══════════════════════════════════════════════════════════════ */
const NumeroInput = ({ name, value, onChange, onBlur, placeholder, min, max, step }) => {
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
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{ width: '100%', paddingRight: '2.4rem' }}
      />
      <div className="numero-flechas">
        <button type="button" onClick={increment}>
          <svg viewBox="0 0 24 24" fill="none"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button type="button" onClick={decrement}>
          <svg viewBox="0 0 24 24" fill="none"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
const ModalCompletarPerfil = ({ onCompletado, user }) => {
  const [form, setForm]       = useState({ age: String(user?.age || ''), weight: '', height: '' });
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [avisos, setAvisos]   = useState({});
  const [cargando, setCargando] = useState(false);

  /* ── Cambio en tiempo real ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validarCampo(name, value) }));
    }
    setAvisos(prev => ({ ...prev, [name]: calcularAviso(name, value) }));
  };

  /* ── Blur: marcar como tocado y validar ── */
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validarCampo(name, form[name]) }));
    setAvisos(prev => ({ ...prev, [name]: calcularAviso(name, form[name]) }));
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    setTouched({ age: true, weight: true, height: true });

    const errs = {
      age:    validarCampo('age',    form.age),
      weight: validarCampo('weight', form.weight),
      height: validarCampo('height', form.height),
    };
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    setCargando(true);
    try {
      const { data } = await api.post('/auth/complete-profile', {
        age:    parseInt(form.age, 10),
        weight: parseFloat(form.weight),
        height: parseFloat(form.height),
      });
      toast.success('¡Perfil completado!');
      onCompletado(data.user);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setCargando(false);
    }
  };

  /* ── Helper aviso ── */
  const renderAviso = (field) => {
    const key = avisos[field];
    if (!key || !AVISOS[key]) return null;
    const { titulo, mensaje, variante } = AVISOS[key];
    return <AvisoInline titulo={titulo} mensaje={mensaje} variante={variante} />;
  };

  return (
    <div className="completar-overlay">
      <div className="completar-modal">

        {/* ── Brand — idéntico a Register ── */}
        <div className="completar-header">
          <div className="completar-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5
                4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8
                3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373
                3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155
                C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/>
            </svg>
            <span className="completar-brand-nombre">Healthy Help</span>
          </div>

          <div className="completar-icono">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>

          <h2>Completa tu perfil</h2>
          <p>
            Hola {user?.name?.split(' ')[0]} — necesitamos algunos datos para
            personalizar tus recomendaciones
          </p>
        </div>

        {/* ── Campos ── */}
        <div className="completar-body">

          {/* Edad */}
          <div className="completar-grupo">
            <label>Edad *</label>
            <NumeroInput
              name="age" value={form.age}
              onChange={handleChange} onBlur={() => handleBlur('age')}
              placeholder="Tu edad" min={18} max={100} step={1}
            />
            <FieldHint field="age" value={form.age} touched={touched.age} />
            {renderAviso('age')}
            {touched.age && errors.age && <span className="completar-error">{errors.age}</span>}
          </div>

          {/* Peso */}
          <div className="completar-grupo">
            <label>Peso (kg) *</label>
            <NumeroInput
              name="weight" value={form.weight}
              onChange={handleChange} onBlur={() => handleBlur('weight')}
              placeholder="Ej: 70" min={40} max={300} step={0.5}
            />
            <FieldHint field="weight" value={form.weight} touched={touched.weight} />
            {renderAviso('weight')}
            {touched.weight && errors.weight && <span className="completar-error">{errors.weight}</span>}
          </div>

          {/* Altura */}
          <div className="completar-grupo">
            <label>Altura (cm) *</label>
            <NumeroInput
              name="height" value={form.height}
              onChange={handleChange} onBlur={() => handleBlur('height')}
              placeholder="Ej: 165" min={50} max={210} step={1}
            />
            <FieldHint field="height" value={form.height} touched={touched.height} />
            {renderAviso('height')}
            {touched.height && errors.height && <span className="completar-error">{errors.height}</span>}
          </div>

          <p className="completar-nota">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Estos datos se usan únicamente para personalizar tus recomendaciones
            nutricionales. Puedes actualizarlos después desde tu perfil.
          </p>
        </div>

        <button className="completar-btn" onClick={handleSubmit} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar y continuar'}
        </button>
      </div>
    </div>
  );
};

export default ModalCompletarPerfil;