const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOGO_SVG = path.join(ROOT, 'client/public/vite.svg');
const OUT_DIR = path.join(ROOT, 'client/public');
const OUT_PNG = path.join(OUT_DIR, 'og-image.png');

const W = 1200;
const H = 630;

const BG_TOP = '#0a1f12';
const BG_BOT = '#1b5e20';
const ACCENT = '#92ca49';
const ACCENT_DARK = '#385326';
const TEXT = '#ffffff';
const MUTED = '#c8e6c9';

async function build() {
  const logoRaw = fs.readFileSync(LOGO_SVG, 'utf8');
  const logoOpenTag = logoRaw.match(/<svg[^>]*>/)[0];
  const logoInner = logoRaw
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');
  const resizedOpen = logoOpenTag
    .replace(/width="[^"]*"/, '')
    .replace(/height="[^"]*"/, '')
    .replace('<svg', `<svg width="260" height="280" x="120" y="155"`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BG_TOP}"/>
      <stop offset="100%" stop-color="${BG_BOT}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="250" cy="315" rx="380" ry="320" fill="url(#glow)"/>

  ${resizedOpen}>${logoInner}</svg>

  <g font-family="Plus Jakarta Sans, Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
    <text x="430" y="240" font-size="32" font-weight="500" fill="${MUTED}" letter-spacing="2">HEALTHY HELP</text>
    <text x="430" y="340" font-size="84" font-weight="800" fill="${TEXT}">Recetas para tu</text>
    <text x="430" y="430" font-size="84" font-weight="800" fill="${ACCENT}">bienestar</text>
    <text x="430" y="500" font-size="26" font-weight="500" fill="${MUTED}">Asistente nutricional con IA</text>
    <text x="430" y="540" font-size="22" font-weight="400" fill="${MUTED}" opacity="0.85">Diabético · Celíaco · Vegano · Hipertensión</text>
  </g>

  <g font-family="Plus Jakarta Sans, Inter, system-ui, sans-serif" fill="${TEXT}" opacity="0.85">
    <rect x="430" y="570" width="220" height="38" rx="19" fill="${ACCENT_DARK}"/>
    <text x="540" y="595" font-size="18" font-weight="700" text-anchor="middle">healthyhelpoficial.com</text>
  </g>
</svg>`;

  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(OUT_PNG);

  const size = fs.statSync(OUT_PNG).size;
  console.log(`OK og-image.png: ${size} bytes -> ${OUT_PNG}`);
}

build().catch(e => { console.error(e); process.exit(1); });
