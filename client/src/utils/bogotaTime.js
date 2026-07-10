const TZ = 'America/Bogota';

const _ahoraReal = () => new Date();

const _fmtHora  = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false });
const _fmtFecha = new Intl.DateTimeFormat('en-CA', { timeZone: TZ });

export const getHoraBogota = () =>
  parseInt(
    _fmtHora.formatToParts(_ahoraReal())
      .find(p => p.type === 'hour')?.value ?? '0',
    10
  );

export const getTipoPorHora = () => {
  const h = getHoraBogota();
  if (h >= 6  && h < 12) return 'desayuno';
  if (h >= 12 && h < 17) return 'almuerzo';
  return 'cena';
};
