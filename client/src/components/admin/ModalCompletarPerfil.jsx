import { useState, useCallback, useMemo, memo } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import './ModalCompletarPerfil.css';

const AVISOS = {
  fechaNac_menor:    { titulo: 'Acceso restringido.',    mensaje: 'Debes tener al menos 18 años.',                                        variante: 'naranja' },
  fechaNac_invalida: { titulo: 'Fecha inválida.',        mensaje: 'Ingresa una fecha de nacimiento válida.',                              variante: 'rojo'    },
  fechaNac_futura:   { titulo: 'Fecha inválida.',        mensaje: 'La fecha de nacimiento no puede ser en el futuro.',                    variante: 'rojo'    },
  weight_bajo:       { titulo: 'Peso mínimo 40 kg.',     mensaje: 'Healthy Help requiere al menos 40 kg para calcular recomendaciones.', variante: 'naranja' },
  weight_alto:       { titulo: 'Peso fuera de rango.',   mensaje: 'El valor máximo aceptado es 300 kg.',                                 variante: 'rojo'    },
  height_baja:       { titulo: 'Altura mínima 50 cm.',   mensaje: 'Ingresa una altura válida entre 50 y 210 cm.',                        variante: 'naranja' },
  height_alta:       { titulo: 'Altura fuera de rango.', mensaje: 'El valor máximo aceptado es 210 cm.',                                 variante: 'rojo'    },
};

const calcEdadDesde = (fechaStr) => {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;
  return edad;
};

const calcularAviso = (field, value) => {
  const n = parseFloat(value);
  switch (field) {
    case 'fechaNac': {
      if (!value) return null;
      const fecha = new Date(value);
      if (isNaN(fecha.getTime())) return 'fechaNac_invalida';
      if (fecha > new Date()) return 'fechaNac_futura';
      const edad = calcEdadDesde(value);
      if (edad === null || edad > 120) return 'fechaNac_invalida';
      if (edad < 18) return 'fechaNac_menor';
      return null;
    }
    case 'weight':
      if (!value || isNaN(n) || n <= 0) return null;
      if (n < 40)  return 'weight_bajo';
      if (n > 300) return 'weight_alto';
      return null;
    case 'height':
      if (!value || isNaN(n) || n <= 0) return null;
      if (n < 50)  return 'height_baja';
      if (n > 210) return 'height_alta';
      return null;
    default:
      return null;
  }
};

const validarCampo = (field, value) => {
  const n = parseFloat(value);
  switch (field) {
    case 'fechaNac': {
      if (!value) return 'La fecha de nacimiento es requerida';
      const fecha = new Date(value);
      if (isNaN(fecha.getTime()) || fecha > new Date()) return 'Fecha de nacimiento inválida';
      const edad = calcEdadDesde(value);
      if (edad === null || edad > 120) return 'Fecha de nacimiento inválida';
      if (edad < 18) return 'Debes ser mayor de 18 años';
      return '';
    }
    case 'weight':
      if (!value) return 'El peso es requerido';
      if (isNaN(n) || n < 40 || n > 300) return 'Peso válido entre 40 y 300 kg';
      return '';
    case 'height':
      if (!value) return 'La altura es requerida';
      if (isNaN(n) || n < 50 || n > 210) return 'Altura válida entre 50 y 210 cm';
      return '';
    default:
      return '';
  }
};

const InfoIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: '1px' }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
));
InfoIcon.displayName = 'InfoIcon';

const AvisoInline = memo(({ titulo, mensaje, variante = 'naranja' }) => (
  <div className={`completar-aviso completar-aviso--${variante}`}>
    <InfoIcon />
    <span><strong>{titulo}</strong> {mensaje}</span>
  </div>
));
AvisoInline.displayName = 'AvisoInline';

const FieldHint = memo(({ field, value, touched }) => {
  const items = useMemo(() => {
    if (!touched) return null;
    switch (field) {
      case 'fechaNac': {
        if (!value) return [{ ok: false, label: 'Mayor de 18 años' }];
        const fecha = new Date(value);
        if (isNaN(fecha.getTime()) || fecha > new Date()) return [{ ok: false, label: 'Fecha válida' }];
        const edad = calcEdadDesde(value);
        return [{
          ok:    edad !== null && edad >= 18 && edad <= 120,
          label: edad !== null && edad >= 18 ? `Tienes ${edad} años — Mayor de edad` : 'Debes ser mayor de 18 años',
        }];
      }
      case 'weight':
        return value ? [
          { ok: parseFloat(value) >= 40,  label: 'Mínimo 40 kg'  },
          { ok: parseFloat(value) <= 300, label: 'Máximo 300 kg' },
        ] : [];
      case 'height':
        return value ? [
          { ok: parseFloat(value) >= 50,  label: 'Mínimo 50 cm'  },
          { ok: parseFloat(value) <= 210, label: 'Máximo 210 cm' },
        ] : [];
      default:
        return [];
    }
  }, [field, value, touched]);

  if (!items || items.length === 0 || items.every(i => i.ok)) return null;

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
});
FieldHint.displayName = 'FieldHint';

const NumeroInput = memo(({ name, value, onChange, onBlur, placeholder, min, max, step }) => {
  const s = parseFloat(step) || 1;

  const increment = useCallback(() => {
    const v = parseFloat(value) || (min ?? 0);
    if (max !== undefined && v >= max) return;
    onChange({ target: { name, value: String(parseFloat((v + s).toFixed(4))) } });
  }, [value, min, max, s, name, onChange]);

  const decrement = useCallback(() => {
    const v = parseFloat(value) || (min ?? 0);
    if (min !== undefined && v <= min) return;
    onChange({ target: { name, value: String(parseFloat((v - s).toFixed(4))) } });
  }, [value, min, s, name, onChange]);

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
});
NumeroInput.displayName = 'NumeroInput';

const MIN_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0];
const MAX_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0];

const ModalCompletarPerfil = ({ onCompletado, user }) => {
  useBodyScrollLock(true);
  const [form,     setForm]     = useState({ fechaNac: '', weight: '', height: '' });
  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});
  const [avisos,   setAvisos]   = useState({});
  const [cargando, setCargando] = useState(false);

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => {
      if (!prev[name]) return prev;
      setErrors(errs => ({ ...errs, [name]: validarCampo(name, value) }));
      return prev;
    });
    setAvisos(prev => ({ ...prev, [name]: calcularAviso(name, value) }));
  }, []);

  const handleBlur = useCallback(name => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setForm(prev => {
      setErrors(errs => ({ ...errs, [name]: validarCampo(name, prev[name]) }));
      setAvisos(avs => ({ ...avs, [name]: calcularAviso(name, prev[name]) }));
      return prev;
    });
  }, []);

  const handleBlurFecha   = useCallback(() => handleBlur('fechaNac'), [handleBlur]);
  const handleBlurWeight  = useCallback(() => handleBlur('weight'),   [handleBlur]);
  const handleBlurHeight  = useCallback(() => handleBlur('height'),   [handleBlur]);

  const handleSubmit = useCallback(async () => {
    setTouched({ fechaNac: true, weight: true, height: true });
    const errs = {
      fechaNac: validarCampo('fechaNac', form.fechaNac),
      weight:   validarCampo('weight',   form.weight),
      height:   validarCampo('height',   form.height),
    };
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    setCargando(true);
    try {
      const { data } = await api.post('/auth/complete-profile', {
        birthDate: form.fechaNac,
        weight:    parseFloat(form.weight),
        height:    parseFloat(form.height),
      });
      toast.success('¡Perfil completado!');
      onCompletado(data.user);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setCargando(false);
    }
  }, [form, onCompletado]);

  const renderAviso = (field) => {
    const key = avisos[field];
    if (!key || !AVISOS[key]) return null;
    const { titulo, mensaje, variante } = AVISOS[key];
    return <AvisoInline titulo={titulo} mensaje={mensaje} variante={variante} />;
  };

  return (
    <div className="completar-overlay" data-modal="true">
      <div className="completar-modal">

        <div className="completar-header">
          <div className="completar-brand">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.926 19.743 3.014 20.732 2 22"/>
            </svg>
            <span className="completar-brand-nombre">Healthy Help</span>
          </div>

          <div className="completar-icono">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <div className="completar-body">

          <div className="completar-grupo">
            <label>Fecha de nacimiento *</label>
            <input
              type="date"
              name="fechaNac"
              value={form.fechaNac}
              onChange={handleChange}
              onBlur={handleBlurFecha}
              max={MAX_DATE}
              min={MIN_DATE}
            />
            <FieldHint field="fechaNac" value={form.fechaNac} touched={touched.fechaNac} />
            {renderAviso('fechaNac')}
            {touched.fechaNac && errors.fechaNac && <span className="completar-error">{errors.fechaNac}</span>}
          </div>

          <div className="completar-grupo">
            <label>Peso (kg) *</label>
            <NumeroInput
              name="weight" value={form.weight}
              onChange={handleChange} onBlur={handleBlurWeight}
              placeholder="Ej: 70" min={40} max={300} step={0.5}
            />
            <FieldHint field="weight" value={form.weight} touched={touched.weight} />
            {renderAviso('weight')}
            {touched.weight && errors.weight && <span className="completar-error">{errors.weight}</span>}
          </div>

          <div className="completar-grupo">
            <label>Altura (cm) *</label>
            <NumeroInput
              name="height" value={form.height}
              onChange={handleChange} onBlur={handleBlurHeight}
              placeholder="Ej: 165" min={50} max={210} step={1}
            />
            <FieldHint field="height" value={form.height} touched={touched.height} />
            {renderAviso('height')}
            {touched.height && errors.height && <span className="completar-error">{errors.height}</span>}
          </div>

          <p className="completar-nota">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
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