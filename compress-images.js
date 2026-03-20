/**
 * compress-images.js
 * 
 * Comprime todas las imágenes de una carpeta a WebP sin pérdida perceptible.
 * 
 * Uso:
 *   node compress-images.js                    → comprime ./images → ./images/compressed
 *   node compress-images.js ./fotos ./salida   → carpeta de entrada y salida custom
 * 
 * Requisito:
 *   npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ─── Configuración ──────────────────────────────────────────────────────────

const CONFIG = {
  // Calidad WebP: 80 es el punto dulce (casi idéntico visualmente, 30-50% más liviano)
  // Sube a 85-90 si tus imágenes tienen texto o detalles muy finos
  quality: 80,

  // Formatos a procesar
  extensions: ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'],

  // Si true, también genera versiones responsivas (320, 640, 1024px de ancho)
  generateResponsive: false,

  // Ancho máximo. null = no redimensiona. Útil para no subir imágenes de 6000px a una web.
  maxWidth: null, // ejemplo: 1920

  // Elimina metadata EXIF (GPS, cámara, fecha) — siempre recomendado para web
  stripMetadata: true,
};

// ─── Argumentos ─────────────────────────────────────────────────────────────

const inputDir  = process.argv[2] || './images';
const outputDir = process.argv[3] || path.join(inputDir, 'compressed');

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getReduction(original, compressed) {
  const pct = ((original - compressed) / original * 100).toFixed(1);
  return `${pct}% menos`;
}

async function compressImage(inputPath, outputPath, filename) {
  const originalSize = fs.statSync(inputPath).size;

  let pipeline = sharp(inputPath);

  // Strip metadata EXIF (GPS, cámara, fecha, perfil de color innecesario)
  if (CONFIG.stripMetadata) {
    pipeline = pipeline.withMetadata({}); // mantiene solo lo esencial (dimensiones, orientación)
  }

  // Redimensionar si excede el ancho máximo
  if (CONFIG.maxWidth) {
    pipeline = pipeline.resize({ width: CONFIG.maxWidth, withoutEnlargement: true });
  }

  // Convertir a WebP con la calidad configurada
  pipeline = pipeline.webp({ quality: CONFIG.quality });

  const outputFile = path.join(outputPath, filename.replace(/\.[^.]+$/, '.webp'));
  await pipeline.toFile(outputFile);

  const compressedSize = fs.statSync(outputFile).size;
  return { originalSize, compressedSize, outputFile };
}

async function generateResponsiveSizes(inputPath, outputPath, filename) {
  const sizes = [320, 640, 1024, 1920];
  const baseName = filename.replace(/\.[^.]+$/, '');

  for (const width of sizes) {
    const outputFile = path.join(outputPath, `${baseName}-${width}w.webp`);
    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .withMetadata({})
      .webp({ quality: CONFIG.quality })
      .toFile(outputFile);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  // Verificar que existe la carpeta de entrada
  if (!fs.existsSync(inputDir)) {
    console.error(`\n❌ No existe la carpeta: ${inputDir}`);
    console.error(`   Crea la carpeta y pon tus imágenes ahí, o pasa la ruta como argumento:`);
    console.error(`   node compress-images.js ./mis-fotos\n`);
    process.exit(1);
  }

  // Crear carpeta de salida si no existe
  fs.mkdirSync(outputDir, { recursive: true });

  // Obtener archivos a procesar
  const files = fs.readdirSync(inputDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return CONFIG.extensions.includes(ext);
  });

  if (files.length === 0) {
    console.log(`\n⚠️  No se encontraron imágenes en: ${inputDir}`);
    console.log(`   Formatos soportados: ${CONFIG.extensions.join(', ')}\n`);
    return;
  }

  console.log(`\n🗜️  Comprimiendo ${files.length} imagen(es)...`);
  console.log(`   Entrada:  ${inputDir}`);
  console.log(`   Salida:   ${outputDir}`);
  console.log(`   Calidad:  ${CONFIG.quality} (WebP)\n`);
  console.log('─'.repeat(65));

  let totalOriginal = 0;
  let totalCompressed = 0;
  let errors = 0;

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    try {
      const { originalSize, compressedSize, outputFile } = await compressImage(inputPath, outputDir, file);

      totalOriginal   += originalSize;
      totalCompressed += compressedSize;

      const icon = compressedSize < originalSize ? '✅' : '⚠️ ';
      const outputName = path.basename(outputFile);
      console.log(
        `${icon} ${file.padEnd(30)} ${formatBytes(originalSize).padStart(10)} → ${formatBytes(compressedSize).padStart(10)}  (${getReduction(originalSize, compressedSize)})`
      );

      // Generar versiones responsivas si está activado
      if (CONFIG.generateResponsive) {
        await generateResponsiveSizes(inputPath, outputDir, file);
        console.log(`   └─ Versiones responsivas generadas: 320w, 640w, 1024w, 1920w`);
      }

    } catch (err) {
      console.error(`❌ Error procesando ${file}: ${err.message}`);
      errors++;
    }
  }

  // Resumen final
  console.log('─'.repeat(65));
  console.log(`\n📊 Resumen:`);
  console.log(`   Imágenes procesadas: ${files.length - errors} de ${files.length}`);
  console.log(`   Peso original:       ${formatBytes(totalOriginal)}`);
  console.log(`   Peso final:          ${formatBytes(totalCompressed)}`);
  console.log(`   Ahorro total:        ${formatBytes(totalOriginal - totalCompressed)} (${getReduction(totalOriginal, totalCompressed)})`);

  if (CONFIG.generateResponsive) {
    console.log(`\n💡 Versiones responsivas guardadas en: ${outputDir}`);
    console.log(`   Usa srcset en tu HTML para que el navegador elija el tamaño correcto.`);
  }

  console.log(`\n✨ Listo. Imágenes comprimidas en: ${outputDir}\n`);
}

run().catch(console.error);
