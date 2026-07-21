const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SAFE_PATHS = [
  '/api/auth/google',
  '/api/auth/google/callback',
];

module.exports = (req, res, next) => {
  if (!STATE_CHANGING_METHODS.has(req.method)) return next();
  if (SAFE_PATHS.some((p) => req.path === p || req.path.startsWith(p + '/'))) return next();

  const headerValue = req.headers['x-requested-with'];
  const origin = req.headers.origin;

  const sameOrigin = origin && (
    origin === `https://www.${process.env.COOKIE_DOMAIN?.replace(/^\./, '') || 'healthyhelpoficial.com'}` ||
    origin === `https://${process.env.COOKIE_DOMAIN?.replace(/^\./, '') || 'healthyhelpoficial.com'}` ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  );

  if (headerValue !== 'XMLHttpRequest' || !sameOrigin) {
    return res.status(403).json({ error: 'Solicitud bloqueada por protección CSRF' });
  }

  next();
};