import React, { useState } from 'react';
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

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [datos, setDatos] = useState({ nombre: '', email: '', pass: '', passConf: '' });
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);

  const manejarRegistro = async () => {
    const validationErrors = validateRegisterForm(datos.nombre, datos.email, datos.pass, datos.passConf);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const result = await register({ name: datos.nombre, email: datos.email, password: datos.pass });

    if (result.success || result.needsVerification) {
      toast.success('¡Cuenta creada! Revisa tu correo para verificar.');
      navigate('/verificar-email', { state: { email: datos.email } });
    } else {
      if (result.needsVerification) {
        navigate('/verificar-email', { state: { email: datos.email } });
      } else {
        toast.error(result.error || 'Error al crear la cuenta');
        setErrors({ general: result.error });
      }
    }

    setLoading(false);
  };

  const handleChange = (field, value) => {
    setDatos({ ...datos, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="vistaAuth">
      <div className="authCard">
        <h2>Crear Cuenta</h2>
        <div className="authForm">
          <div className="formGroup">
            <input type="text" placeholder="Nombre completo" value={datos.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={errors.nombre ? 'inputError' : ''} disabled={loading}
            />
            {errors.nombre && <span className="errorMessage">{errors.nombre}</span>}
          </div>

          <div className="formGroup">
            <input type="email" placeholder="Correo electrónico" value={datos.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'inputError' : ''} disabled={loading}
            />
            {errors.email && <span className="errorMessage">{errors.email}</span>}
          </div>

          <div className="formGroup">
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