export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(email)) {
    errors.email = 'Correo inválido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return errors;
};

export const validateRegisterForm = (name, email, password, passwordConf) => {
  const errors = {};

  if (!name) {
    errors.nombre = 'El nombre es requerido';
  } else if (name.length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres';
  }

  if (!email) {
    errors.email = 'El correo es requerido';
  } else if (!validateEmail(email)) {
    errors.email = 'Correo inválido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!passwordConf) {
    errors.passwordConf = 'Confirma tu contraseña';
  } else if (password !== passwordConf) {
    errors.passwordConf = 'Las contraseñas no coinciden';
  }

  return errors;
};

export const validateResetPasswordForm = (password, passwordConf) => {
  const errors = {};

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!passwordConf) {
    errors.passwordConf = 'Confirma tu contraseña';
  } else if (password !== passwordConf) {
    errors.passwordConf = 'Las contraseñas no coinciden';
  }

  return errors;
};

// Alias para compatibilidad
export { validateEmail as isValidEmail };