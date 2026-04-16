import axios from 'axios';

/**
 * Cliente HTTP centralizado.
 *
 * ── Cómo resolver ERR_CONNECTION_REFUSED ──────────────────────────────────
 *
 * OPCIÓN A — Variable de entorno (recomendado para producción):
 *   Crea un archivo `.env` en la raíz del proyecto frontend con:
 *     VITE_API_URL=http://localhost:5000/api
 *   Luego reinicia el servidor de Vite.
 *
 * OPCIÓN B — Proxy de Vite (recomendado para desarrollo, evita CORS):
 *   En vite.config.js agrega:
 *
 *     export default defineConfig({
 *       server: {
 *         proxy: {
 *           '/api': {
 *             target: 'http://localhost:5000',
 *             changeOrigin: true,
 *           },
 *         },
 *       },
 *     });
 *
 *   Y cambia la baseURL aquí a solo '/api'.
 *   Así el frontend llama a su propio origen y Vite redirige al backend.
 *
 * OPCIÓN C — Asegúrate de que el backend esté corriendo:
 *   cd backend && npm run dev   (o node server.js / nodemon server.js)
 * ──────────────────────────────────────────────────────────────────────────
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  // Tiempo máximo de espera: evita que el usuario espere indefinidamente
  // cuando el backend no responde
  timeout: 10000,
});

/* ── Interceptor de REQUEST: adjuntar token ───────────────── */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Interceptor de RESPONSE: manejo de errores globales ─── */
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