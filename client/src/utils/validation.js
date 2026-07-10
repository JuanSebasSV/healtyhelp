//Utilidades de validación para formularios

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidEmail = validateEmail;

//Valida nombre — sin números, sin símbolos, sin letras repetidas 3+ veces seguidas

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'El nombre es requerido' };
  }
  const n = name.trim();
  if (n.length < 2)  return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  if (n.length > 50) return { isValid: false, error: 'El nombre es muy largo (máximo 50 caracteres)' };
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(n)) {
    return { isValid: false, error: 'El nombre solo puede contener letras y espacios' };
  }
  // Detectar letras repetidas 3+ veces seguidas (ej: aaa, aaaa)
  if (/(.)\1{2,}/.test(n)) {
    return { isValid: false, error: 'El nombre no puede tener letras repetidas consecutivamente' };
  }
  return { isValid: true, error: null };
};

export const validatePassword = (password) => {
  const errors = [];
  if (!password) return { isValid: false, errors: ['La contraseña es requerida'] };
  if (password.length < 8)      errors.push('Debe tener al menos 8 caracteres');
  if (!/[a-z]/.test(password))  errors.push('Debe contener al menos una letra minúscula');
  if (!/[A-Z]/.test(password))  errors.push('Debe contener al menos una letra mayúscula');
  if (!/\d/.test(password))     errors.push('Debe contener al menos un número');
  return { isValid: errors.length === 0, errors };
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  if (!email) errors.email = 'El correo es requerido';
  else if (!validateEmail(email)) errors.email = 'Correo inválido';
  if (!password) errors.password = 'La contraseña es requerida';
  else if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
  return errors;
};

export const validateRegisterForm = (name, email, password, passwordConf) => {
  const errors = {};

  // Nombre
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) errors.nombre = nameValidation.error;

  // Email
  if (!email) errors.email = 'El correo es requerido';
  else if (!validateEmail(email)) errors.email = 'Correo inválido';

  // Contraseña
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.errors[0];

  // Confirmación
  if (!passwordConf) errors.passwordConf = 'Confirma tu contraseña';
  else if (password !== passwordConf) errors.passwordConf = 'Las contraseñas no coinciden';


  return errors;
};

export const validateResetPasswordForm = (password, passwordConf) => {
  const errors = {};
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) errors.password = passwordValidation.errors[0];
  if (!passwordConf) errors.passwordConf = 'Confirma tu contraseña';
  else if (password !== passwordConf) errors.passwordConf = 'Las contraseñas no coinciden';
  return errors;
};