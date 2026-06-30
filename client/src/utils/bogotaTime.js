const TZ = 'America/Bogota';

const _ahoraReal = () => new Date();

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
