import { memo } from 'react';

const HERO_IMGS = [
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031315/ensalada_fs6t5u.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031325/mani_y_frutas_ldhsqc.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031316/pechuga_tfpvfm.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031326/ajo_e0n3fy.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031316/variedad_de_comida_ecokui.webp',
  'https://res.cloudinary.com/dqwqmipco/image/upload/q_auto,f_auto/v1774031319/verduras_gbvs6u.webp',
];

const Hero = memo(({ imagenActual, onDotClick }) => (
  <div className="hero">
    {HERO_IMGS.map((img, i) => (
      <div key={i} className={`hero-capa ${i === imagenActual ? 'hero-capa--activa' : ''}`}
        style={{ backgroundImage: `url('${img}')` }} />
    ))}
    <div className="hero-gradiente" />
    <div className="hero-texto">
      <span className="hero-tag">🌿 Tu dieta, tu salud</span>
      <h1>Sabemos que llevar una dieta especial puede ser un reto, pero no tienes que hacerlo solo.</h1>
      <p>Aquí te ofrecemos recetas pensadas para ti, con ingredientes fáciles de conseguir y preparaciones sencillas pero exquisitas.</p>
      <div className="hero-linea" />
    </div>
    <div className="hero-dots">
      {HERO_IMGS.map((img, i) => (
        <button type="button" key={img} aria-label={`Ir a imagen ${i + 1}`} className={`hero-dot ${i === imagenActual ? 'activo' : ''}`}
          onClick={() => onDotClick(i)} />
      ))}
    </div>
  </div>
));
Hero.displayName = 'Hero';

export { HERO_IMGS };
export default Hero;
