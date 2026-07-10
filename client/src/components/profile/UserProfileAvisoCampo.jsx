import { memo } from 'react';
import { AvisoInline } from './UserProfileUI';
import { AVISOS_PERF } from './UserProfileData';

const AvisoCampo = memo(({ field, avisos }) => {
  const key = avisos[field];
  if (!key || !AVISOS_PERF[key]) return null;
  const { titulo, mensaje, variante } = AVISOS_PERF[key];
  return (
    <AvisoInline titulo={titulo} mensaje={mensaje} variante={variante} />
  );
});
AvisoCampo.displayName = 'AvisoCampo';

export default AvisoCampo;
