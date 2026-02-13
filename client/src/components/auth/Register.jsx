import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { validateRegisterForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [datos, setDatos] = useState({ 
    nombre: '', 
    email: '', 
    pass: '', 
    passConf: '' 
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const manejarRegistro = async () => {
    // Validación frontend
    const validationErrors = validateRegisterForm(
      datos.nombre,
      datos.email,
      datos.pass,
      datos.passConf
    );
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    // Llamada al backend
    const result = await register({
      name: datos.nombre,
      email: datos.email,
      password: datos.pass
    });

    if (result.success) {
      toast.success('¡Cuenta creada exitosamente! Bienvenido');
      navigate('/');
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      manejarRegistro();
    }
  };

  return (
    <div className="vistaAuth">
      <div className="authCard">
        <h2>Crear Cuenta</h2>
        <div className="authForm">
          <div className="formGroup">
            <input 
              type="text" 
              placeholder="Nombre completo"
              value={datos.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={errors.nombre ? 'inputError' : ''}
              disabled={loading}
            />
            {errors.nombre && <span className="errorMessage">{errors.nombre}</span>}
          </div>
          
          <div className="formGroup">
            <input 
              type="email" 
              placeholder="Correo electrónico"
              value={datos.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'inputError' : ''}
              disabled={loading}
            />
            {errors.email && <span className="errorMessage">{errors.email}</span>}
          </div>
          
          <div className="formGroup">
            <input 
              type="password" 
              placeholder="Contraseña"
              value={datos.pass}
              onChange={(e) => handleChange('pass', e.target.value)}
              className={errors.password ? 'inputError' : ''}
              disabled={loading}
            />
            {errors.password && <span className="errorMessage">{errors.password}</span>}
          </div>
          
          <div className="formGroup">
            <input 
              type="password" 
              placeholder="Confirmar contraseña"
              value={datos.passConf}
              onChange={(e) => handleChange('passConf', e.target.value)}
              onKeyPress={handleKeyPress}
              className={errors.passwordConf ? 'inputError' : ''}
              disabled={loading}
            />
            {errors.passwordConf && <span className="errorMessage">{errors.passwordConf}</span>}
          </div>

          {errors.general && (
            <div className="errorMessage" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}
          
          <button 
            onClick={manejarRegistro} 
            className="btn-primario"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </div>
        <p>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="linkText">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
