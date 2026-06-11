const TZ       = 'America/Bogota';
const API_URL  = 'https://worldtimeapi.org/api/timezone/America%2FBogota';
const REFRESCO = 30 * 60 * 1000;

let _offset = 0;

const _calibrar = () =>
  fetch(API_URL, { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(({ unixtime }) => { _offset = unixtime * 1000 - Date.now(); })
    .catch(() => {});

_calibrar();
setInterval(_calibrar, REFRESCO);

const _ahoraReal = () => new Date(Date.now() + _offset);

export const getHoraBogota = () =>
  parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false })
      .formatToParts(_ahoraReal())
      .find(p => p.type === 'hour')?.value ?? '0',
    10
  );

export const getFechaBogota = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(_ahoraReal());

export const getTipoPorHora = () => {
  const h = getHoraBogota();
  if (h >= 6  && h < 12) return 'desayuno';
  if (h >= 12 && h < 17) return 'almuerzo';
  return 'cena';
};
