import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

//Helpers 
const COOKIE_CONSENT_KEY = 'hh_cookie_consent';
const TERMS_ACCEPTED_KEY = 'hh_terms_accepted';
const TERMS_VERSION_KEY  = 'hh_terms_version';

const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
};

const getPersisted = (key) => getCookie(key) || localStorage.getItem(key) || null;

// Rutas que nunca requieren verificación de cookies/términos
const RUTAS_LIBRES = [
  '/login', '/registro', '/recuperar',
  '/google-callback', '/verificar-email', '/contacto',
];

//Componente 
const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Esperar a que AuthProvider termine de verificar la sesión
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // 2. Debe estar autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Rol admin requerido
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4. Las rutas libres no necesitan cookies ni términos
  const esRutaLibre = RUTAS_LIBRES.some(r => location.pathname.startsWith(r));
  if (esRutaLibre) return children;

  // 5. ¿Aceptó cookies?
  const cookiesOk = getPersisted(COOKIE_CONSENT_KEY) === 'accepted';
  if (!cookiesOk) {
    return <Navigate to="/" replace />;
  }

  // 6. ¿Aceptó los términos?
  const terminosOk =
    user.termsAccepted === true ||
    getPersisted(TERMS_ACCEPTED_KEY) === 'true';

  if (!terminosOk) {
    return <Navigate to="/" replace />;
  }

  // 7. ¿La versión de los términos que aceptó es la vigente?
  const serverVersion = user.activeTermsVersion;
  if (serverVersion && user.termsVersion !== serverVersion) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default PrivateRoute;