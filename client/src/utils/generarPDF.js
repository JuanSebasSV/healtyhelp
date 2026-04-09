import jsPDF from 'jspdf';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de diseño
// ─────────────────────────────────────────────────────────────────────────────
const W       = 210;
const H       = 297;
const MARGEN  = 16;
const ANCHO   = W - MARGEN * 2;

// Paleta
const VERDE        = [30, 100, 50];
const VERDE_CLARO  = [236, 250, 240];
const VERDE_LINEA  = [80, 160, 100];
const GRIS_TEXTO   = [55, 55, 55];
const GRIS_SUAVE   = [120, 120, 120];
const GRIS_BG      = [248, 248, 248];
const BLANCO       = [255, 255, 255];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (v, u = '') => (v && v > 0 ? `${v}${u}` : null);

const setColor  = (doc, rgb)  => doc.setTextColor(...rgb);
const setFill   = (doc, rgb)  => doc.setFillColor(...rgb);
const setStroke = (doc, rgb)  => doc.setDrawColor(...rgb);

const checkPage = (doc, y, needed = 20) => {
  if (y + needed > H - 20) { doc.addPage(); addCabeceraContinuacion(doc); return 22; }
  return y;
};

// Texto con salto de línea automático, devuelve nuevo y
const textWrap = (doc, texto, x, y, maxW, lh) => {
  const lines = doc.splitTextToSize(String(texto), maxW);
  lines.forEach(l => { doc.text(l, x, y); y += lh; });
  return y;
};

// Sección título con acento izquierdo
const seccionTitulo = (doc, texto, y) => {
  setFill(doc, VERDE);
  doc.rect(MARGEN, y - 4.5, 3, 6, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, VERDE);
  doc.text(texto, MARGEN + 6, y);
  return y + 6;
};

// Cabecera de página de continuación (páginas 2+)
const addCabeceraContinuacion = (doc) => {
  setFill(doc, VERDE);
  doc.rect(0, 0, W, 8, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, BLANCO);
  doc.text('HealtyHelp — Recetas Saludables', MARGEN, 5.5);
};

// Pie de página
const addPie = (doc, pag, total) => {
  setStroke(doc, [210, 210, 210]);
  doc.setLineWidth(0.3);
  doc.line(MARGEN, H - 12, W - MARGEN, H - 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, GRIS_SUAVE);
  doc.text('HealtyHelp — Recetas para tu salud', MARGEN, H - 8);
  doc.text(`Página ${pag} de ${total}`, W - MARGEN, H - 8, { align: 'right' });
};

// Cargar imagen desde URL como base64 (cross-origin via canvas)
const cargarImagenBase64 = (url) => new Promise((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      // Proporciones 16:9 recortadas al centro
      const aspecto = 16 / 6;
      canvas.width  = 800;
      canvas.height = Math.round(800 / aspecto);
      const ctx = canvas.getContext('2d');
      // Recorte centrado
      const srcRatio = img.width / img.height;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (srcRatio > aspecto) { sw = img.height * aspecto; sx = (img.width - sw) / 2; }
      else { sh = img.width / aspecto; sy = (img.height - sh) / 2; }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    } catch { resolve(null); }
  };
  img.onerror = () => resolve(null);
  img.src = url;
});

// ─────────────────────────────────────────────────────────────────────────────
// PORTADA (solo cuando hay más de 1 receta)
// ─────────────────────────────────────────────────────────────────────────────
const addPortada = (doc, recetas, fecha) => {
  // Fondo verde oscuro superior
  setFill(doc, VERDE);
  doc.rect(0, 0, W, 90, 'F');

  // Patrón decorativo (círculos translúcidos)
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  setFill(doc, BLANCO);
  doc.circle(170, 20, 40, 'F');
  doc.circle(20, 80, 30, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo / nombre app
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(doc, BLANCO);
  doc.text('HealtyHelp', W / 2, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [200, 235, 210]);
  doc.text('Tu guía de recetas saludables', W / 2, 47, { align: 'center' });

  // Línea dorada
  setStroke(doc, [180, 230, 180]);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 30, 52, W / 2 + 30, 52);

  // Título del documento
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, BLANCO);
  doc.text('MIS RECETAS', W / 2, 65, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [200, 235, 210]);
  doc.text(`${recetas.length} receta${recetas.length !== 1 ? 's' : ''} seleccionada${recetas.length !== 1 ? 's' : ''}`, W / 2, 73, { align: 'center' });

  // Índice de recetas
  let y = 105;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, GRIS_TEXTO);
  doc.text('Contenido', MARGEN, y);
  y += 8;

  setStroke(doc, [220, 220, 220]);
  doc.setLineWidth(0.3);
  doc.line(MARGEN, y - 2, W - MARGEN, y - 2);

  recetas.forEach((r, i) => {
    y = checkPage(doc, y, 10);
    // Número
    setFill(doc, VERDE_CLARO);
    doc.roundedRect(MARGEN, y - 4, 7, 6, 1, 1, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    setColor(doc, VERDE);
    doc.text(String(i + 1), MARGEN + 3.5, y, { align: 'center' });
    // Nombre
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, GRIS_TEXTO);
    const nombre = doc.splitTextToSize(r.nombre, ANCHO - 30)[0];
    doc.text(nombre, MARGEN + 10, y);
    // Cat
    doc.setFontSize(7.5);
    setColor(doc, GRIS_SUAVE);
    const cat = r.cat?.charAt(0).toUpperCase() + r.cat?.slice(1) || '';
    doc.text(cat, W - MARGEN, y, { align: 'right' });
    // Línea separadora
    setStroke(doc, [235, 235, 235]);
    doc.setLineWidth(0.2);
    doc.line(MARGEN, y + 3, W - MARGEN, y + 3);
    y += 9;
  });

  // Fecha
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, GRIS_SUAVE);
  doc.text(`Generado el ${fecha}`, W / 2, H - 20, { align: 'center' });
  doc.text('healtyhelp.com', W / 2, H - 14, { align: 'center' });
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERADOR PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export const generarPDFRecetas = async (recetas) => {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  // Precargar todas las imágenes en paralelo
  const imagenes = await Promise.all(recetas.map(r => r.img ? cargarImagenBase64(r.img) : Promise.resolve(null)));

  // Portada si hay más de 1 receta
  if (recetas.length > 1) {
    addPortada(doc, recetas, fecha);
  }

  // Total de páginas estimado (se actualiza al final con jsPDF interno)
  let pagina = recetas.length > 1 ? 2 : 1;

  recetas.forEach((receta, idx) => {
    if (idx > 0 || recetas.length > 1) doc.addPage();

    const imgB64 = imagenes[idx];
    const imgH   = imgB64 ? 58 : 0;  // altura de la imagen en mm

    // ── IMAGEN A FULL ANCHO ──
    if (imgB64) {
      doc.addImage(imgB64, 'JPEG', 0, 0, W, imgH);
      // Gradiente oscuro sobre la imagen (simulado con rect semitransparente)
      doc.setGState(new doc.GState({ opacity: 0.45 }));
      setFill(doc, [0, 0, 0]);
      doc.rect(0, 0, W, imgH, 'F');
      doc.setGState(new doc.GState({ opacity: 1 }));

      // Nombre sobre la imagen
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      setColor(doc, BLANCO);
      const nombreLines = doc.splitTextToSize(receta.nombre, ANCHO);
      let ty = imgH - (nombreLines.length * 7) - 10;
      nombreLines.forEach(l => { doc.text(l, MARGEN, ty); ty += 7; });

      // Badge categoría
      const cat = receta.cat?.charAt(0).toUpperCase() + receta.cat?.slice(1) || '';
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      setFill(doc, VERDE);
      const badgeW = doc.getTextWidth(cat) + 6;
      doc.roundedRect(MARGEN, imgH - 8, badgeW, 5.5, 1, 1, 'F');
      setColor(doc, BLANCO);
      doc.text(cat, MARGEN + 3, imgH - 4);
    }

    // ── BARRA SUPERIOR (sin imagen) ──
    if (!imgB64) {
      setFill(doc, VERDE);
      doc.rect(0, 0, W, 12, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      setColor(doc, BLANCO);
      doc.text('HealtyHelp — Recetas Saludables', MARGEN, 8);
      doc.text(`Receta ${idx + 1} de ${recetas.length}`, W - MARGEN, 8, { align: 'right' });

      let y = 20;
      doc.setFontSize(17);
      doc.setFont('helvetica', 'bold');
      setColor(doc, GRIS_TEXTO);
      y = textWrap(doc, receta.nombre, MARGEN, y, ANCHO, 8);
    }

    let y = imgH + 8;

    // ── CONDICIONES APTAS ──
    if (receta.salud?.length) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      setColor(doc, GRIS_SUAVE);
      const saludTxt = `Apta para: ${receta.salud.slice(0, 5).join(' · ')}${receta.salud.length > 5 ? ' · ...' : ''}`;
      doc.text(saludTxt, MARGEN, y);
      y += 6;
    }

    // ── LÍNEA SEPARADORA ──
    setStroke(doc, VERDE_LINEA);
    doc.setLineWidth(0.4);
    doc.line(MARGEN, y, W - MARGEN, y);
    y += 7;

    // ── DESCRIPCIÓN ──
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'italic');
    setColor(doc, [80, 80, 80]);
    y = textWrap(doc, receta.desc || '', MARGEN, y, ANCHO, 5.5);
    y += 7;

    // ── DOS COLUMNAS: Ingredientes | Datos rápidos ──
    const colIng  = ANCHO * 0.55;
    const colDatos = ANCHO * 0.40;
    const xDatos  = MARGEN + colIng + ANCHO * 0.05;

    y = checkPage(doc, y, 30);
    const yColStart = y;

    // Ingredientes
    y = seccionTitulo(doc, 'Ingredientes', y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    setColor(doc, GRIS_TEXTO);
    let yIng = y;
    (receta.ingredientes || []).forEach(ing => {
      yIng = checkPage(doc, yIng, 6);
      // Bullet cuadrado pequeño
      setFill(doc, VERDE);
      doc.rect(MARGEN + 3, yIng - 2.8, 1.8, 1.8, 'F');
      yIng = textWrap(doc, ing, MARGEN + 7, yIng, colIng - 10, 5);
      yIng += 1;
    });

    // Datos rápidos (columna derecha)
    let yD = yColStart;
    yD = seccionTitulo(doc, 'Datos rápidos', yD);

    const datos = [
      ['Calorías',     fmt(receta.nutri?.cal,   ' kcal')],
      ['Proteínas',    fmt(receta.nutri?.prot,  ' g')],
      ['Carbohidratos',fmt(receta.nutri?.carb,  ' g')],
      ['Grasas',       fmt(receta.nutri?.gras,  ' g')],
      ['Fibra',        fmt(receta.nutri?.fiber, ' g')],
      ['Sodio',        fmt(receta.nutri?.sodio, ' mg')],
    ].filter(([, v]) => v);

    datos.forEach(([label, valor]) => {
      yD = checkPage(doc, yD, 8);
      setFill(doc, VERDE_CLARO);
      doc.roundedRect(xDatos, yD - 4, colDatos, 7, 1.5, 1.5, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      setColor(doc, GRIS_SUAVE);
      doc.text(label, xDatos + 3, yD);
      doc.setFont('helvetica', 'bold');
      setColor(doc, VERDE);
      doc.text(valor, xDatos + colDatos - 3, yD, { align: 'right' });
      yD += 9;
    });

    y = Math.max(yIng, yD) + 6;

    // ── PREPARACIÓN ──
    y = checkPage(doc, y, 20);
    y = seccionTitulo(doc, 'Preparación', y);

    (receta.pasos || []).forEach((paso, i) => {
      y = checkPage(doc, y, 12);
      // Número de paso en círculo
      setFill(doc, VERDE);
      doc.circle(MARGEN + 3.5, y - 1.5, 3.5, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      setColor(doc, BLANCO);
      doc.text(String(i + 1), MARGEN + 3.5, y - 0.2, { align: 'center' });
      // Texto del paso
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      setColor(doc, GRIS_TEXTO);
      const antes = y;
      y = textWrap(doc, paso, MARGEN + 10, y, ANCHO - 12, 5.2);
      y += 3;
      // Línea guía
      if (i < (receta.pasos || []).length - 1) {
        setStroke(doc, [220, 220, 220]);
        doc.setLineWidth(0.2);
        doc.line(MARGEN + 3.5, antes + 2.5, MARGEN + 3.5, y - 3);
      }
    });

    y += 6;

    // ── TABLA NUTRICIONAL COMPLETA ──
    const nutriAvanzado = [
      ['Colesterol',   fmt(receta.nutri?.colesterol, ' mg')],
      ['Calcio',       fmt(receta.nutri?.calcio,     ' mg')],
      ['Hierro',       fmt(receta.nutri?.hierro,     ' mg')],
      ['Potasio',      fmt(receta.nutri?.potasio,    ' mg')],
      ['Magnesio',     fmt(receta.nutri?.magnesio,   ' mg')],
      ['Vitamina A',   fmt(receta.nutri?.vitA,       ' mcg')],
      ['Vitamina C',   fmt(receta.nutri?.vitC,       ' mg')],
      ['Vitamina D',   fmt(receta.nutri?.vitD,       ' mcg')],
      ['Vitamina E',   fmt(receta.nutri?.vitE,       ' mg')],
      ['Azúcar Total', fmt(receta.nutri?.azucar,     ' g')],
      ['Grasas Sat.',  fmt(receta.nutri?.grasSat,    ' g')],
      ['Omega-3',      fmt(receta.nutri?.omega3,     ' g')],
    ].filter(([, v]) => v);

    if (nutriAvanzado.length > 0) {
      y = checkPage(doc, y, 30);
      y = seccionTitulo(doc, 'Información Nutricional Detallada', y);

      // Tabla de 4 columnas
      const cols = 4;
      const cW   = ANCHO / cols;
      let col = 0;
      let rowY = y;

      nutriAvanzado.forEach(([label, valor]) => {
        const x = MARGEN + col * cW;
        // Fondo alterno
        if (Math.floor((col + (rowY === y ? 0 : 1)) / cols) % 2 === 0) {
          setFill(doc, GRIS_BG);
        } else {
          setFill(doc, BLANCO);
        }
        doc.rect(x, rowY - 3, cW, 8, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        setColor(doc, GRIS_SUAVE);
        doc.text(label, x + 2, rowY + 1);
        doc.setFont('helvetica', 'bold');
        setColor(doc, GRIS_TEXTO);
        doc.text(valor, x + cW - 2, rowY + 1, { align: 'right' });
        col++;
        if (col >= cols) { col = 0; rowY += 8; }
      });

      y = rowY + (col > 0 ? 8 : 0) + 4;
    }

    // ── PIE DE PÁGINA ──
    addPie(doc, pagina, '—');
    pagina++;
  });

  // ── DESCARGAR ──
  const nombre = recetas.length === 1
    ? recetas[0].nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    : 'mis_recetas_healtyhelp';
  doc.save(`${nombre}.pdf`);
};