import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // ✅ 15 segundos — por si Render está durmiendo
});

// 🔒 Interceptor: Agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔒 Interceptor: Manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Solo redirigir al login si hay respuesta 401 real del servidor
    // No redirigir si es timeout, red caída o servidor durmiendo
    if (error.response?.status === 401) {
      const rutasPublicas = ['/login', '/registro', '/recuperar'];
      const estaEnRutaPublica = rutasPublicas.some(r => window.location.pathname.startsWith(r));
      
      // Solo redirigir si no está ya en una ruta pública
      if (!estaEnRutaPublica) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;