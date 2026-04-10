import { useState } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import './ModalCompletarPerfil.css';

const NumeroInput = ({ name, value, onChange, placeholder, min, max, step }) => {
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
      <input type="number" name={name} value={value} onChange={onChange}
        placeholder={placeholder} min={min} max={max} step={step}
        style={{ width: '100%', paddingRight: '2.2rem' }}
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

const ModalCompletarPerfil = ({ onCompletado, user }) => {
  const [form, setForm]       = useState({ age: '18', weight: '70', height: '165' });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const errs = {};
    const edad = parseInt(form.age, 10);
    const peso = parseFloat(form.weight);
    const alt  = parseFloat(form.height);
    if (!form.age || isNaN(edad) || edad < 18 || edad > 100)
      errs.age = 'Edad válida entre 18 y 100 años';
    if (!form.weight || isNaN(peso) || peso < 40 || peso > 150)
      errs.weight = 'Peso válido entre 40 y 150 kg';
    if (!form.height || isNaN(alt) || alt < 50 || alt > 210)
      errs.height = 'Altura válida entre 50 y 210 cm';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validar();
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }
    setCargando(true);
    try {
      const { data } = await api.post('/auth/complete-profile', {
        age: parseInt(form.age, 10),
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

  return (
    <div className="completar-overlay">
      <div className="completar-modal">
        <div className="completar-header">
          <div className="completar-icono">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h2>Completa tu perfil</h2>
            <p>Hola {user?.name?.split(' ')[0]} — necesitamos algunos datos para personalizar tus recomendaciones</p>
          </div>
        </div>

        <div className="completar-body">
          <div className="completar-grupo">
            <label>Edad *</label>
            <NumeroInput name="age" value={form.age} onChange={handleChange}
              placeholder="Tu edad" min={18} max={100} step={1} />
            {errores.age && <span className="completar-error">{errores.age}</span>}
          </div>

          <div className="completar-grupo">
            <label>Peso (kg) *</label>
            <NumeroInput name="weight" value={form.weight} onChange={handleChange}
              placeholder="Ej: 70" min={40} max={150} step={0.5} />
            {errores.weight && <span className="completar-error">{errores.weight}</span>}
          </div>

          <div className="completar-grupo">
            <label>Altura (cm) *</label>
            <NumeroInput name="height" value={form.height} onChange={handleChange}
              placeholder="Ej: 165" min={50} max={210} step={1} />
            {errores.height && <span className="completar-error">{errores.height}</span>}
          </div>

          <p className="completar-nota">
            Estos datos se usan únicamente para personalizar tus recomendaciones nutricionales.
            Puedes actualizarlos después desde tu perfil.
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