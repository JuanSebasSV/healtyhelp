const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || (
  process.env.NODE_ENV === 'production' ? '.healthyhelpoficial.com' : 'localhost'
);

const COOKIE_SECURE = process.env.COOKIE_SECURE !== undefined
  ? process.env.COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production';

const COOKIE_SAMESITE = process.env.COOKIE_SAMESITE || 'strict';

const AUTH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: COOKIE_SAMESITE,
  path: '/',
  secure: COOKIE_SECURE,
  domain: COOKIE_DOMAIN,
};

const CLEAR_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: COOKIE_SAMESITE,
  path: '/',
  secure: COOKIE_SECURE,
  domain: COOKIE_DOMAIN,
};

module.exports = {
  COOKIE_DOMAIN,
  COOKIE_SECURE,
  AUTH_COOKIE_OPTS,
  CLEAR_COOKIE_OPTS,
};