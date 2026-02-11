import React, { useState } from 'react';
import { validateRegisterForm } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const Register = ({ onNavigate }) => {
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
    // 🛡️ Validación frontend
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

    // 🔒 Llamada al backend
    const result = await register({
      name: datos.nombre,
      email: datos.email,
      password: datos.pass
    });

    if (result.success) {
      toast.success('¡Cuenta creada exitosamente! Bienvenido');
      onNavigate('inicio');
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
    <div className="vista-auth">
      <div className="auth-card">
        <h2>Crear Cuenta</h2>
        <div className="auth-form">
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Nombre completo"
              value={datos.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={errors.nombre ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>
          
          <div className="form-group">
            <input 
              type="email" 
              placeholder="Correo electrónico"
              value={datos.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Contraseña"
              value={datos.pass}
              onChange={(e) => handleChange('pass', e.target.value)}
              className={errors.password ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <input 
              type="password" 
              placeholder="Confirmar contraseña"
              value={datos.passConf}
              onChange={(e) => handleChange('passConf', e.target.value)}
              onKeyPress={handleKeyPress}
              className={errors.passwordConf ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.passwordConf && <span className="error-message">{errors.passwordConf}</span>}
          </div>

          {errors.general && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
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
          <span onClick={() => onNavigate('login')} className="link-text">
            Inicia sesión
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;