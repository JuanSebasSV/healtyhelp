import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/*  Interceptor de REQUEST: adjuntar token  */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/*  Interceptor de RESPONSE: manejo de errores globales  */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sin respuesta del servidor → backend caído o sin red
    if (!error.response) {
      console.error(
        '[API] No se pudo conectar al servidor. ' +
        'Verifica que el backend esté corriendo en ' +
        (import.meta.env.VITE_API_URL || 'http://localhost:5000')
      );
      // Enriquecer el error para que los componentes puedan mostrarlo
      error.sinConexion = true;
      return Promise.reject(error);
    }

    // 401 → sesión expirada o token inválido
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const ruta = window.location.pathname;
      const rutasPublicas = [
        '/login', '/registro', '/recuperar',
        '/reset-password', '/verificar-email', '/',
      ];
      const esPublica = rutasPublicas.some((r) => ruta.startsWith(r));
      if (!esPublica) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;