/**
 * Utilidades de validación para formularios
 * Versión mejorada con validaciones más robustas
 */

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Alias para compatibilidad (usado en ForgotPassword.jsx)
export const isValidEmail = validateEmail;

/**
 * Valida fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ['La contraseña es requerida'] };
  }
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una letra minúscula');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una letra mayúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida formulario de login
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {object} - Objeto con errores por campo
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  // Validar email
  if (!email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(email)) {
    errors.email = 'Correo inválido';
  }

  // Validar password (más permisivo para login, solo longitud mínima)
  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
};

/**
 * Valida formulario de registro
 * @param {string} name - Nombre del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} passwordConf - Confirmación de contraseña
 * @returns {object} - Objeto con errores por campo
 */
export const validateRegisterForm = (name, email, password, passwordConf) => {
  const errors = {};

  // Validar nombre
  if (!name) {
    errors.nombre = 'El nombre es requerido';
  } else if (name.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  } else if (name.trim().length > 50) {
    errors.nombre = 'El nombre es muy largo (máximo 50 caracteres)';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    errors.nombre = 'El nombre solo puede contener letras';
  }

  // Validar email
  if (!email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(email)) {
    errors.email = 'Correo inválido';
  }

  // Validar password con validación robusta
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    // Mostrar el primer error más crítico
    errors.password = passwordValidation.errors[0];
  }

  // Validar confirmación
  if (!passwordConf) {
    errors.passwordConf = 'Confirma tu contraseña';
  } else if (password !== passwordConf) {
    errors.passwordConf = 'Las contraseñas no coinciden';
  }

  return errors;
};

/**
 * Valida formulario de reset password
 * @param {string} password - Nueva contraseña
 * @param {string} passwordConf - Confirmación de contraseña
 * @returns {object} - Objeto con errores por campo
 */
export const validateResetPasswordForm = (password, passwordConf) => {
  const errors = {};

  // Validar password con validación robusta
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  // Validar confirmación
  if (!passwordConf) {
    errors.passwordConf = 'Confirma tu contraseña';
  } else if (password !== passwordConf) {
    errors.passwordConf = 'Las contraseñas no coinciden';
  }

  return errors;
};

/**
 * Sanitiza input de texto (previene XSS básico)
 * @param {string} input - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida número de teléfono (formato internacional básico)
 * @param {string} phone - Número de teléfono
 * @returns {boolean} - true si es válido
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida URL
 * @param {string} url - URL a validar
 * @returns {boolean} - true si es válida
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida formulario de contacto
 * @param {object} data - { nombre, email, mensaje, asunto? }
 * @returns {object} - Objeto con errores por campo
 */
export const validateContactForm = (data) => {
  const errors = {};
  
  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (!data.email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(data.email)) {
    errors.email = 'El correo no es válido';
  }
  
  if (!data.mensaje || data.mensaje.trim().length < 10) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  } else if (data.mensaje.trim().length > 1000) {
    errors.mensaje = 'El mensaje es muy largo (máximo 1000 caracteres)';
  }
  
  return errors;
};

// Exportación por defecto para importación flexible
export default {
  validateEmail,
  isValidEmail,
  validatePassword,
  validateLoginForm,
  validateRegisterForm,
  validateResetPasswordForm,
  sanitizeInput,
  isValidPhone,
  isValidUrl,
  validateContactForm
};