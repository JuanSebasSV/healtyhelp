import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let _ultimoAvisoSinConexion = 0;
const _avisarSinConexion = () => {
  const ahora = Date.now();
  if (ahora - _ultimoAvisoSinConexion < 10_000) return;
  _ultimoAvisoSinConexion = ahora;
  if (!navigator.onLine) {
    console.info('[Red] Sin conexión a internet.');
  } else {
    console.info('[API] No se pudo conectar al servidor. Puede ser una pérdida de conexión momentánea.');
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (!navigator.onLine) {
      _avisarSinConexion();
      return Promise.reject(Object.assign(new Error('sin_conexion'), { sinConexion: true, silencioso: true }));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.silencioso) return Promise.reject(error);

    if (!error.response) {
      _avisarSinConexion();
      error.sinConexion = true;
      return Promise.reject(error);
    }

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