/**
 * Utilidades de validación para formularios
 */

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidEmail = validateEmail;

/**
 * Valida nombre — sin números, sin símbolos, sin letras repetidas 4+ veces seguidas
 */
export const validateName = (name) => {
  const errors = [];
  if (!name || !name.trim()) {
    return { isValid: false, error: 'El nombre es requerido' };
  }
  const n = name.trim();
  if (n.length < 2)  return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  if (n.length > 50) return { isValid: false, error: 'El nombre es muy largo (máximo 50 caracteres)' };
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(n)) {
    return { isValid: false, error: 'El nombre solo puede contener letras y espacios' };
  }
  // Detectar letras repetidas 4+ veces seguidas (ej: hhhh, aaaa)
  if (/(.)\1{3,}/.test(n)) {
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

export const validateAge = (age) => {
  const n = parseInt(age, 10);
  if (!age && age !== 0) return { isValid: false, error: 'La edad es requerida' };
  if (isNaN(n) || n < 1 || n > 120) return { isValid: false, error: 'Ingresa una edad válida' };
  if (n < 18) return { isValid: false, error: 'MINOR' }; // código especial para menores
  return { isValid: true, error: null };
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  if (!email) errors.email = 'El correo es requerido';
  else if (!validateEmail(email)) errors.email = 'Correo inválido';
  if (!password) errors.password = 'La contraseña es requerida';
  else if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
  return errors;
};

export const validateRegisterForm = (name, email, password, passwordConf, age) => {
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

  // Edad
  const ageValidation = validateAge(age);
  if (!ageValidation.isValid) errors.edad = ageValidation.error;

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

export const sanitizeInput = (input) => {
  if (!input) return '';
  return input.trim()
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const isValidPhone = (phone) => {
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(phone);
};

export const isValidUrl = (url) => {
  try { new URL(url); return true; } catch { return false; }
};

export const validateContactForm = (data) => {
  const errors = {};
  if (!data.nombre || data.nombre.trim().length < 2) errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  if (!data.email) errors.email = 'El correo es requerido';
  else if (!validateEmail(data.email)) errors.email = 'El correo no es válido';
  if (!data.mensaje || data.mensaje.trim().length < 10) errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  else if (data.mensaje.trim().length > 1000) errors.mensaje = 'El mensaje es muy largo (máximo 1000 caracteres)';
  return errors;
};

export default {
  validateEmail, isValidEmail, validatePassword, validateName, validateAge,
  validateLoginForm, validateRegisterForm, validateResetPasswordForm,
  sanitizeInput, isValidPhone, isValidUrl, validateContactForm
};