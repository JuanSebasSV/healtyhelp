import jsPDF from 'jspdf';

// Constantes de diseño
const W      = 210;
const H      = 297;
const MG     = 14;
const ANCHO  = W - MG * 2;

// Paleta
const VERDE       = [22, 101, 52];
const VERDE_MED   = [34, 139, 74];
const VERDE_CLARO = [220, 252, 231];
const VERDE_LINEA = [74, 182, 107];
const GRIS_TEXTO  = [30,  30,  30];
const GRIS_MED    = [80,  80,  80];
const GRIS_SUAVE  = [130, 130, 130];
const GRIS_BG     = [246, 248, 246];
const BLANCO      = [255, 255, 255];
const NEGRO       = [0,   0,   0];

// Helpers básicos
const fmt    = (v, u = '') => (v != null && v > 0 ? `${v}${u}` : null);
const rgb    = (doc, ...c) => doc.setTextColor(...c);
const fill   = (doc, ...c) => doc.setFillColor(...c);
const stroke = (doc, ...c) => doc.setDrawColor(...c);

const wrap = (doc, txt, x, y, maxW, lh) => {
  doc.splitTextToSize(String(txt), maxW).forEach(l => { doc.text(l, x, y); y += lh; });
  return y;
};

const saltoPagina = (doc, y, need = 20) => {
  if (y + need > H - 18) { doc.addPage(); cabPagina(doc); return 20; }
  return y;
};

const cabPagina = (doc) => {
  fill(doc, ...VERDE);
  doc.rect(0, 0, W, 7, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  rgb(doc, ...BLANCO);
  doc.text('HealtyHelp  Recetas Saludables', MG, 5);
};

const pie = (doc, pag, total) => {
  stroke(doc, 210, 210, 210);
  doc.setLineWidth(0.25);
  doc.line(MG, H - 11, W - MG, H - 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  rgb(doc, ...GRIS_SUAVE);
  doc.text('HealtyHelp  Recetas para tu salud', MG, H - 7);
  doc.text(`Página ${pag} de ${total}`, W - MG, H - 7, { align: 'right' });
};

const seccion = (doc, texto, y) => {
  fill(doc, ...VERDE);
  doc.rect(MG, y - 4, 3, 5.5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...VERDE);
  doc.text(texto, MG + 5, y);
  return y + 5;
};

// Carga de imagen  proxy backend para evitar CORS
const recortarBlob = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const ratio = 16 / 5;
          const cw    = 900;
          const ch    = Math.round(cw / ratio);
          const canvas = document.createElement('canvas');
          canvas.width  = cw;
          canvas.height = ch;
          const ctx  = canvas.getContext('2d');
          const srcR = img.width / img.height;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;
          if (srcR > ratio) { sw = img.height * ratio; sx = (img.width  - sw) / 2; }
          else               { sh = img.width  / ratio; sy = (img.height - sh) / 2; }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = reader.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });

const cargarImagen = async (url) => {
  if (!url) return null;

  // Proxy por el backend 
  try {
    const proxyUrl = `http://localhost:5000/api/proxy-imagen?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('proxy failed');
    const blob = await res.blob();
    return await recortarBlob(blob);
  } catch { /* continúa al fallback */ }

  // Fallback: fetch directo
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const blob = await res.blob();
    return await recortarBlob(blob);
  } catch { /* continúa al fallback 2 */ }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      try {
        const ratio = 16 / 5;
        const cw    = 900;
        const ch    = Math.round(cw / ratio);
        const canvas = document.createElement('canvas');
        canvas.width  = cw;
        canvas.height = ch;
        const ctx  = canvas.getContext('2d');
        const srcR = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcR > ratio) { sw = img.height * ratio; sx = (img.width  - sw) / 2; }
        else               { sh = img.width  / ratio; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// PORTADA
const portada = (doc, recetas, fecha) => {
  fill(doc, ...VERDE);
  doc.rect(0, 0, W, 100, 'F');

  fill(doc, ...VERDE_MED);
  doc.rect(0, 72, W, 28, 'F');

  doc.setFontSize(30);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...BLANCO);
  doc.text('HealtyHelp', W / 2, 40, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  rgb(doc, 180, 230, 195);
  doc.text('Tu guía de recetas saludables', W / 2, 50, { align: 'center' });

  stroke(doc, 180, 230, 195);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - 28, 55, W / 2 + 28, 55);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...BLANCO);
  doc.text('MIS RECETAS', W / 2, 68, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  rgb(doc, 180, 230, 195);
  doc.text(
    `${recetas.length} receta${recetas.length !== 1 ? 's' : ''} seleccionada${recetas.length !== 1 ? 's' : ''}`,
    W / 2, 77, { align: 'center' }
  );

  //  Índice 
  let y = 116;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...GRIS_TEXTO);
  doc.text('Contenido', MG, y);
  y += 2;

  stroke(doc, ...VERDE_LINEA);
  doc.setLineWidth(0.5);
  doc.line(MG, y, W - MG, y);
  y += 8;

  recetas.forEach((r, i) => {
    y = saltoPagina(doc, y, 10);

    // Número simple
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    rgb(doc, ...VERDE);
    doc.text(`${i + 1}.`, MG, y);

    // Nombre receta
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    rgb(doc, ...GRIS_TEXTO);
    const nombre = doc.splitTextToSize(r.nombre, ANCHO - 28)[0];
    doc.text(nombre, MG + 8, y);

    // Categoría
    const cat = r.cat ? r.cat.charAt(0).toUpperCase() + r.cat.slice(1) : '';
    doc.setFontSize(7.5);
    rgb(doc, ...GRIS_SUAVE);
    doc.text(cat, W - MG, y, { align: 'right' });

    // Separador
    stroke(doc, 225, 225, 225);
    doc.setLineWidth(0.15);
    doc.line(MG, y + 3.5, W - MG, y + 3.5);
    y += 10;
  });


  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  rgb(doc, ...GRIS_SUAVE);
  doc.text(`Generado el ${fecha}`, W / 2, H - 18, { align: 'center' });
  doc.text('healtyhelp.com', W / 2, H - 12, { align: 'center' });
};

// RECETA individual
const renderReceta = (doc, receta, imgB64, idxMostrado, totalMostrado) => {
  const IMG_H = imgB64 ? 62 : 0;

  if (imgB64) {
    doc.addImage(imgB64, 'JPEG', 0, 0, W, IMG_H);
  } else {
    fill(doc, ...VERDE);
    doc.rect(0, 0, W, 10, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    rgb(doc, ...BLANCO);
    doc.text('HealtyHelp  Recetas Saludables', MG, 7);
    doc.text(`Receta ${idxMostrado} de ${totalMostrado}`, W - MG, 7, { align: 'right' });
  }

  let y = IMG_H + 7;

  // Badge categoría
  const cat = receta.cat ? receta.cat.charAt(0).toUpperCase() + receta.cat.slice(1) : '';
  if (cat) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    fill(doc, ...VERDE);
    const bw = doc.getTextWidth(cat) + 8;
    doc.roundedRect(MG, y - 4, bw, 6, 1.5, 1.5, 'F');
    rgb(doc, ...BLANCO);
    doc.text(cat, MG + 4, y);
    y += 8;
  }

  // Nombre de la receta  debajo de la imagen, en negro
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...GRIS_TEXTO);
  const nombreLines = doc.splitTextToSize(receta.nombre, ANCHO);
  nombreLines.forEach(l => { doc.text(l, MG, y); y += 7; });
  y += 3;

  // Número receta  alineado a la derecha del nombre
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  rgb(doc, ...GRIS_SUAVE);
  doc.text(`Receta ${idxMostrado} de ${totalMostrado}`, W - MG, IMG_H + 7, { align: 'right' });
  if (receta.salud?.length) {
    const saludTxt = `Apta para: ${receta.salud.slice(0, 5).join(' · ')}`;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    rgb(doc, ...GRIS_SUAVE);
    doc.text(saludTxt, MG, y);
    y += 5.5;
  }

  if (!imgB64) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    rgb(doc, ...GRIS_TEXTO);
    y = wrap(doc, receta.nombre, MG, y, ANCHO, 8);
    y += 2;
  }

  stroke(doc, ...VERDE_LINEA);
  doc.setLineWidth(0.5);
  doc.line(MG, y, W - MG, y);
  y += 7;

  if (receta.desc) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    rgb(doc, ...GRIS_MED);
    y = wrap(doc, receta.desc, MG, y, ANCHO, 5.2);
    y += 7;
  }

  //  DOS COLUMNAS 
  const COL_ING = ANCHO * 0.54;
  const COL_DAT = ANCHO * 0.38;
  const X_DAT   = MG + ANCHO * 0.62;

  y = saltoPagina(doc, y, 40);

  // Título Ingredientes (col izquierda) 
  fill(doc, ...VERDE);
  doc.rect(MG, y - 4, 3, 5.5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...VERDE);
  doc.text('Ingredientes', MG + 5, y);

  //  Título Datos rápidos (col derecha)
  fill(doc, ...VERDE);
  doc.rect(X_DAT, y - 4, 3, 5.5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  rgb(doc, ...VERDE);
  doc.text('Datos rápidos', X_DAT + 5, y);

  y += 6;
  const yCol = y;

  // Ingredientes 
  let yIng = yCol;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  rgb(doc, ...GRIS_TEXTO);
  (receta.ingredientes || []).forEach((ing) => {
    yIng = saltoPagina(doc, yIng, 6);
    fill(doc, ...VERDE_MED);
    doc.circle(MG + 2.8, yIng - 1.5, 1.3, 'F');
    yIng = wrap(doc, ing, MG + 6, yIng, COL_ING - 8, 4.8);
    yIng += 1.2;
  });

  // Datos rápidos 
  let yD = yCol;

  const datos = [
    ['Calorías',      fmt(receta.nutri?.cal,   ' kcal')],
    ['Proteínas',     fmt(receta.nutri?.prot,  ' g')],
    ['Carbohidratos', fmt(receta.nutri?.carb,  ' g')],
    ['Grasas',        fmt(receta.nutri?.gras,  ' g')],
    ['Fibra',         fmt(receta.nutri?.fiber, ' g')],
    ['Sodio',         fmt(receta.nutri?.sodio, ' mg')],
  ].filter(([, v]) => v);

  datos.forEach(([label, valor], i) => {
    fill(doc, ...(i % 2 === 0 ? VERDE_CLARO : BLANCO));
    doc.roundedRect(X_DAT, yD - 3.5, COL_DAT, 7, 1.5, 1.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    rgb(doc, ...GRIS_SUAVE);
    doc.text(label, X_DAT + 3, yD + 0.2);
    doc.setFont('helvetica', 'bold');
    rgb(doc, ...VERDE);
    doc.text(valor, X_DAT + COL_DAT - 3, yD + 0.2, { align: 'right' });
    yD += 8.5;
  });

  y = Math.max(yIng, yD) + 7;

  // PREPARACIÓN 
  y = saltoPagina(doc, y, 25);
  y = seccion(doc, 'Preparación', y);
  y += 1;

  const pasos = receta.pasos || [];
  pasos.forEach((paso, i) => {
    y = saltoPagina(doc, y, 12);

    // Número simple sin círculo
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    rgb(doc, ...VERDE);
    doc.text(`${i + 1}.`, MG, y);

    // Texto del paso
    doc.setFontSize(8.8);
    doc.setFont('helvetica', 'normal');
    rgb(doc, ...GRIS_TEXTO);
    const yAntes = y;
    y = wrap(doc, paso, MG + 7, y, ANCHO - 9, 5);
    y += 4;

  });

  y += 5;

  // TABLA NUTRICIONAL DETALLADA 
  const nutriAvanzado = [
    ['Colesterol',  fmt(receta.nutri?.colesterol, ' mg')],
    ['Calcio',      fmt(receta.nutri?.calcio,     ' mg')],
    ['Hierro',      fmt(receta.nutri?.hierro,     ' mg')],
    ['Potasio',     fmt(receta.nutri?.potasio,    ' mg')],
    ['Magnesio',    fmt(receta.nutri?.magnesio,   ' mg')],
    ['Vitamina A',  fmt(receta.nutri?.vitA,       ' mcg')],
    ['Vitamina C',  fmt(receta.nutri?.vitC,       ' mg')],
    ['Vitamina D',  fmt(receta.nutri?.vitD,       ' mcg')],
    ['Vitamina E',  fmt(receta.nutri?.vitE,       ' mg')],
    ['Azúcar',      fmt(receta.nutri?.azucar,     ' g')],
    ['Grasas Sat.', fmt(receta.nutri?.grasSat,    ' g')],
    ['Omega-3',     fmt(receta.nutri?.omega3,     ' g')],
  ].filter(([, v]) => v);

  if (nutriAvanzado.length > 0) {
    y = saltoPagina(doc, y, 30);
    y = seccion(doc, 'Información Nutricional Detallada', y);
    y += 2;

    fill(doc, ...VERDE);
    doc.rect(MG, y - 3, ANCHO, 6.5, 'F');

    const cols  = 4;
    const cW    = ANCHO / cols;
    const heads = ['Nutriente', 'Valor', 'Nutriente', 'Valor'];
    heads.forEach((h, ci) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      rgb(doc, ...BLANCO);
      doc.text(h, MG + ci * cW + 3, y + 0.5);
    });
    y += 7;

    let col  = 0;
    let rowY = y;
    nutriAvanzado.forEach(([label, valor], fi) => {
      const x    = MG + col * cW;
      const fila = Math.floor(fi / cols);
      fill(doc, ...(fila % 2 === 0 ? GRIS_BG : BLANCO));
      doc.rect(x, rowY - 2.5, cW, 7, 'F');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      rgb(doc, ...GRIS_MED);
      doc.text(label, x + 3, rowY + 1.5);
      doc.setFont('helvetica', 'bold');
      rgb(doc, ...GRIS_TEXTO);
      doc.text(valor, x + cW - 3, rowY + 1.5, { align: 'right' });

      col++;
      if (col >= cols) { col = 0; rowY += 7; }
    });

    y = rowY + (col > 0 ? 7 : 0) + 5;
  }

  return y;
};

// EXPORTACIÓN PRINCIPAL
export const generarPDFRecetas = async (recetas) => {
  const doc   = new jsPDF({ unit: 'mm', format: 'a4' });
  const fecha = new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const imagenes  = await Promise.all(recetas.map(r => cargarImagen(r.img)));
  const totalPags = (recetas.length > 1 ? 1 : 0) + recetas.length;

  if (recetas.length > 1) portada(doc, recetas, fecha);

  let pagina = recetas.length > 1 ? 2 : 1;

  recetas.forEach((receta, idx) => {
    if (idx > 0 || recetas.length > 1) doc.addPage();
    renderReceta(doc, receta, imagenes[idx], idx + 1, recetas.length);
    pie(doc, pagina, totalPags);
    pagina++;
  });

  const nombre = recetas.length === 1
    ? recetas[0].nombre.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    : 'mis_recetas_healtyhelp';

  doc.save(`${nombre}.pdf`);
};