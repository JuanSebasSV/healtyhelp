// motorRecomendaciones.js
// ─── Constantes ───────────────────────────────────────────────────────────────

const LIMITES_CONDICION = {
  diabetes:             { azucar: 25, carb: 130 },
  hipertension:         { sodio: 1500 },
  'bajo-sodio':         { sodio: 1500 },
  'enfermedad-renal':   { sodio: 1500, potasio: 2000, fosforo: 800 },
  'colesterol-alto':    { grasSat: 15, colesterol: 200 },
  keto:                 { carbNetos: 50 },
  'bajo-carbohidratos': { carb: 100 },
  'sin-azucar':         { azucar: 10 },
  'bajo-grasa':         { gras: 50 },
};

const OBJETIVOS_MACRO = {
  default:              { protPct: 0.20, carbPct: 0.50, grasPct: 0.30 },
  keto:                 { protPct: 0.20, carbPct: 0.05, grasPct: 0.75 },
  'bajo-carbohidratos': { protPct: 0.30, carbPct: 0.20, grasPct: 0.50 },
  'bajo-grasa':         { protPct: 0.30, carbPct: 0.55, grasPct: 0.15 },
  paleo:                { protPct: 0.30, carbPct: 0.25, grasPct: 0.45 },
  vegano:               { protPct: 0.18, carbPct: 0.55, grasPct: 0.27 },
  vegetariano:          { protPct: 0.18, carbPct: 0.52, grasPct: 0.30 },
  'colesterol-alto':    { protPct: 0.22, carbPct: 0.50, grasPct: 0.28 },
  diabetes:             { protPct: 0.20, carbPct: 0.45, grasPct: 0.35 },
};

// Factor de actividad inferido del IMC como proxy de sedentarismo
// A mayor IMC, menor actividad física promedio estadísticamente
const FACTOR_ACTIVIDAD_IMC = {
  bajo_peso:  1.45,
  normal:     1.55,
  sobrepeso:  1.48,
  obesidad:   1.375,
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

function calcularIMC(peso, altura) {
  if (!peso || !altura) return null;
  const m   = altura / 100;
  const val = peso / (m * m);
  let cat;
  if (val < 18.5)    cat = 'bajo_peso';
  else if (val < 25) cat = 'normal';
  else if (val < 30) cat = 'sobrepeso';
  else               cat = 'obesidad';
  return { valor: Math.round(val * 10) / 10, categoria: cat };
}

function calcularEdad(birthDate) {
  if (!birthDate) return null;
  const hoy  = new Date();
  const nac  = new Date(birthDate);
  let edad   = hoy.getFullYear() - nac.getFullYear();
  const diff = hoy.getMonth() - nac.getMonth();
  if (diff < 0 || (diff === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad >= 1 && edad <= 120 ? edad : null;
}

// imc: objeto { valor, categoria } — ajusta el factor de actividad como proxy
// de nivel de ejercicio real, dado que el modelo no almacena activityLevel
function calcularTDEE(peso, altura, birthDate, imc) {
  const edad = calcularEdad(birthDate);
  if (!peso || !altura || !edad) return null;

  // Mifflin-St Jeor sin sexo: offset neutro promedio entre hombre (+5) y mujer (-161)
  // El valor −78 es la media ponderada. Introduce un margen de ±80 kcal máximo
  // que se compensa con el ajuste por IMC y edad aplicado a continuación
  const bmr = 10 * peso + 6.25 * altura - 5 * edad - 78;

  // Corrección metabólica por pérdida de masa muscular tras los 40 (sarcopenia):
  // el BMR real cae ~2% por década adicional, fenómeno no lineal no capturado por la fórmula
  const factorEdad = edad > 60 ? 0.93 : edad > 40 ? 0.97 : 1.0;

  // Factor de actividad basado en IMC: proxy estadístico de sedentarismo
  const factorAct = imc ? (FACTOR_ACTIVIDAD_IMC[imc.categoria] || 1.55) : 1.55;

  return Math.round(bmr * factorAct * factorEdad);
}

function promedioNutri(consumos, campo) {
  if (!consumos.length) return 0;
  const fechas = [...new Set(consumos.map(c => c.fechaBogota))];
  const totales = fechas.map(f =>
    consumos.filter(c => c.fechaBogota === f).reduce((s, c) => s + (c.nutri?.[campo] || 0), 0)
  );
  return Math.round(totales.reduce((a, b) => a + b, 0) / fechas.length);
}

function sumarNutriHoy(consumosHoy) {
  const base = {};
  consumosHoy.forEach(c => {
    if (!c.nutri) return;
    Object.entries(c.nutri).forEach(([k, v]) => {
      base[k] = (base[k] || 0) + (v || 0);
    });
  });
  Object.keys(base).forEach(k => { base[k] = Math.round(base[k] * 10) / 10; });
  return base;
}

function detectarComidasSaltadas(consumos) {
  const fechas = [...new Set(consumos.map(c => c.fechaBogota))];
  if (fechas.length < 3) return [];
  return ['desayuno', 'almuerzo', 'cena'].reduce((acc, tipo) => {
    const pct = fechas.filter(f => consumos.some(c => c.fechaBogota === f && c.tipo === tipo)).length / fechas.length;
    if (pct < 0.5) acc.push({ tipo, porcentaje: Math.round(pct * 100) });
    return acc;
  }, []);
}

// edad: número — adultos mayores necesitan más agua pese a menor sensación de sed
// imc: objeto { categoria } — obesidad incrementa la demanda hídrica metabólica
function calcularHidratacion(peso, condiciones, calHoy, edad, imc) {
  let litros = Math.round((peso || 70) * 35) / 1000;

  if (condiciones.includes('enfermedad-renal')) {
    litros = Math.min(litros, 1.5);
  } else {
    if (condiciones.includes('gastritis'))          litros = parseFloat((litros + 0.3).toFixed(1));
    if (condiciones.includes('sindrome-intestino')) litros = parseFloat((litros + 0.2).toFixed(1));
    if (condiciones.includes('colesterol-alto'))    litros = parseFloat((litros + 0.2).toFixed(1));
    if (condiciones.includes('diabetes'))           litros = parseFloat((litros + 0.2).toFixed(1));
    if (calHoy > 2000)                              litros = parseFloat((litros + 0.3).toFixed(1));
    // Adultos mayores: la sensación de sed disminuye progresivamente — meta más alta y recordatorio
    if (edad && edad >= 65)                         litros = parseFloat((litros + 0.3).toFixed(1));
    // Obesidad: mayor superficie corporal y actividad metabólica → mayor demanda hídrica
    if (imc?.categoria === 'obesidad')              litros = parseFloat((litros + 0.3).toFixed(1));
  }

  litros = parseFloat(Math.min(litros, 3.5).toFixed(1));

  let nota = 'Distribuye el agua a lo largo del día; no la consumas toda de una vez.';
  if (condiciones.includes('enfermedad-renal')) {
    nota = 'Restricción renal activa — tu nefrólogo debe indicar la cantidad exacta.';
  } else if (edad && edad >= 65) {
    nota = 'En adultos mayores la sensación de sed disminuye con la edad: bebe aunque no tengas sed, especialmente en las mañanas y entre comidas.';
  } else if (imc?.categoria === 'obesidad') {
    nota = 'Una hidratación adecuada mejora el metabolismo y la saciedad entre comidas — distribuye los vasos a lo largo del día.';
  }

  return { litros, vasos: Math.round(litros * 4), nota };
}

// edad: número — ajusta mensajes de horario según franja de vida
// imcCategoria: string — personaliza el contexto según peso corporal
function obtenerContextoHorario(horaActual, consumosHoy, condiciones, edad, imcCategoria) {
  const tieneDesayuno = consumosHoy.some(c => c.tipo === 'desayuno');
  const tieneAlmuerzo = consumosHoy.some(c => c.tipo === 'almuerzo');
  const esMayorAdulto = edad && edad >= 65;
  const mensajes      = [];

  if (horaActual >= 0 && horaActual < 6) {
    mensajes.push({ mensaje: 'Consumir alimentos en la madrugada dificulta la digestión y reduce el gasto calórico — el cuerpo está en modo reposo.', nivel: 'advertencia' });
    if (condiciones.includes('diabetes'))
      mensajes.push({ mensaje: 'La sensibilidad a la insulina es mínima de madrugada. Evita carbohidratos simples a esta hora.', nivel: 'atencion' });
    if (condiciones.includes('gastritis'))
      mensajes.push({ mensaje: 'Comer en la madrugada aumenta la producción de ácido gástrico y puede empeorar los síntomas de la gastritis.', nivel: 'atencion' });
    if (imcCategoria === 'obesidad')
      mensajes.push({ mensaje: 'Comer de madrugada con obesidad favorece el almacenamiento de grasa visceral. Intenta respetar la ventana de ayuno nocturno.', nivel: 'atencion' });
  }

  if (horaActual >= 9 && horaActual < 12 && !tieneDesayuno) {
    if (condiciones.includes('gastritis'))
      mensajes.push({ mensaje: 'Con gastritis, el estómago vacío más de 3-4 horas puede aumentar la acidez. Registra tu desayuno pronto.', nivel: 'atencion' });
    else if (condiciones.includes('diabetes'))
      mensajes.push({ mensaje: 'Saltarte el desayuno puede desestabilizar la glucosa durante el día. Procura desayunar antes de las 10 a.m.', nivel: 'atencion' });
    else if (condiciones.includes('hipertension'))
      mensajes.push({ mensaje: 'Un desayuno con potasio (banano, espinaca, yogur) contribuye a regular la presión desde temprano.', nivel: 'info' });
    else if (esMayorAdulto)
      mensajes.push({ mensaje: 'En adultos mayores el desayuno es clave para la glucosa matutina y la energía del día. Evita saltarlo.', nivel: 'advertencia' });
    else
      mensajes.push({ mensaje: 'Aún no registras desayuno. Un desayuno con proteína y fibra estabiliza la energía durante toda la mañana.', nivel: 'info' });
  }

  if (horaActual >= 15 && horaActual < 19 && !tieneAlmuerzo) {
    mensajes.push({ mensaje: 'No registras almuerzo hoy. Saltarte la comida principal puede generar sobreconsumo en la noche.', nivel: 'advertencia' });
    if (condiciones.includes('diabetes'))
      mensajes.push({ mensaje: 'Omitir el almuerzo con diabetes puede causar hipoglucemia. Ten a mano un snack de emergencia.', nivel: 'atencion' });
    if (esMayorAdulto)
      mensajes.push({ mensaje: 'En adultos mayores, omitir el almuerzo puede provocar mareos y pérdida de concentración por hipoglucemia leve.', nivel: 'advertencia' });
  }

  if (horaActual >= 20 && horaActual < 24) {
    const msgCena = (imcCategoria === 'sobrepeso' || imcCategoria === 'obesidad')
      ? 'Para la cena, opta por proteína magra y verduras al vapor. Reduce los carbohidratos nocturnos — con tu perfil el cuerpo los almacena con mayor facilidad.'
      : 'Para la cena, opta por proteína magra y verduras. Evita carbohidratos de alto índice glucémico a esta hora.';
    mensajes.push({ mensaje: msgCena, nivel: 'info' });
    if (condiciones.includes('diabetes'))
      mensajes.push({ mensaje: 'De noche, la respuesta insulínica es menor. Prioriza proteínas y grasas saludables sobre carbohidratos.', nivel: 'advertencia' });
    if (condiciones.includes('gastritis'))
      mensajes.push({ mensaje: 'Cena al menos 2 horas antes de acostarte para reducir la acidez nocturna y favorecer el descanso.', nivel: 'atencion' });
    if (condiciones.includes('sindrome-intestino'))
      mensajes.push({ mensaje: 'Cena en ambiente tranquilo y sin prisa — el estrés nocturno agrava los síntomas del intestino irritable.', nivel: 'info' });
    if (condiciones.includes('colesterol-alto'))
      mensajes.push({ mensaje: 'En la noche, evita grasas saturadas y frituras — el metabolismo lipídico es menos eficiente durante el sueño.', nivel: 'info' });
    if (esMayorAdulto)
      mensajes.push({ mensaje: 'Cena temprano y ligero (antes de las 8 p.m.) — la digestión nocturna es más lenta en adultos mayores y afecta la calidad del sueño.', nivel: 'info' });
  }

  if (horaActual >= 22 || horaActual < 6) {
    const msgNocturno = imcCategoria === 'obesidad'
      ? 'El gasto calórico es mínimo de noche. Con tu perfil, las calorías a estas horas se almacenan casi en su totalidad como grasa visceral.'
      : 'A estas horas el gasto calórico es mínimo. Las comidas calóricas nocturnas se almacenan más fácilmente como grasa.';
    mensajes.push({ mensaje: msgNocturno, nivel: 'advertencia' });
  }

  return mensajes;
}

// peso: kg — calcula umbral de proteína diaria acumulada de forma personalizada
// edad: número — ajusta límites de micronutrientes críticos por franja de vida
function evaluarMicronutrientesHoy(nutriHoy, condiciones, calObjetivo, peso, edad) {
  const alertas       = [];
  const sodio         = nutriHoy.sodio      || 0;
  const azucar        = nutriHoy.azucar     || 0;
  const carb          = nutriHoy.carb       || 0;
  const fibra         = nutriHoy.fiber      || 0;
  const carbNetos     = nutriHoy.carbNetos  || Math.max(0, carb - fibra);
  const grasSat       = nutriHoy.grasSat    || 0;
  const colesterol    = nutriHoy.colesterol || 0;
  const gras          = nutriHoy.gras       || 0;
  const potasio       = nutriHoy.potasio    || 0;
  const fosforo       = nutriHoy.fosforo    || 0;
  const prot          = nutriHoy.prot       || 0;
  const calcio        = nutriHoy.calcio     || 0;
  const calHoy        = nutriHoy.cal        || 0;
  const esMayorAdulto = edad && edad >= 65;

  // Umbral de sodio — se reduce progresivamente:
  // condición cardiovascular/renal → 1.500mg
  // mayores de 50 sin condición → 1.800mg (mayor sensibilidad vascular)
  // adulto general → 2.300mg (OMS)
  const limSodio = condiciones.some(c => ['hipertension', 'enfermedad-renal', 'bajo-sodio'].includes(c))
    ? 1500
    : (edad && edad >= 50 ? 1800 : 2300);

  if (sodio > limSodio) {
    alertas.push({
      tipo:    'sodio_hoy',
      mensaje: `Llevas ${sodio}mg de sodio hoy (límite para tu perfil: ${limSodio}mg). El resto del día evita sal añadida, enlatados y procesados.`,
      nivel:   sodio > limSodio * 1.4 ? 'atencion' : 'advertencia',
    });
  }

  if (condiciones.some(c => ['diabetes', 'sin-azucar'].includes(c))) {
    const limAzucar = condiciones.includes('sin-azucar') ? 10 : 25;
    if (azucar > limAzucar) {
      alertas.push({
        tipo:    'azucar_hoy',
        mensaje: `Llevas ${azucar}g de azúcar hoy (límite para tu condición: ${limAzucar}g). Las próximas comidas deben ser bajas en azúcares añadidos.`,
        nivel:   azucar > limAzucar * 1.5 ? 'atencion' : 'advertencia',
      });
    }
  }

  if (condiciones.includes('keto') && carbNetos > 50) {
    alertas.push({
      tipo:    'carb_keto',
      mensaje: `Llevas ${Math.round(carbNetos)}g de carb. netos hoy. Superar 50g puede interrumpir la cetosis. Opta por proteínas y grasas saludables.`,
      nivel:   carbNetos > 70 ? 'atencion' : 'advertencia',
    });
  }

  if (condiciones.includes('bajo-carbohidratos') && !condiciones.includes('keto') && carb > 100) {
    alertas.push({
      tipo:    'carb_bajo',
      mensaje: `Llevas ${carb}g de carbohidratos hoy (objetivo: <100g). Prioriza proteínas y grasas saludables en las próximas comidas.`,
      nivel:   'advertencia',
    });
  }

  if (condiciones.includes('colesterol-alto')) {
    if (grasSat > 15) {
      alertas.push({
        tipo:    'grasa_sat_hoy',
        mensaje: `Llevas ${grasSat}g de grasa saturada hoy (límite: 15g). Evita frituras, carnes grasas y lácteos enteros el resto del día.`,
        nivel:   'atencion',
      });
    }
    if (colesterol > 200) {
      alertas.push({
        tipo:    'colesterol_hoy',
        mensaje: `Llevas ${colesterol}mg de colesterol dietario hoy (límite: 200mg). Modera el consumo de yemas de huevo y mariscos.`,
        nivel:   'advertencia',
      });
    }
  }

  if (condiciones.includes('bajo-grasa') && gras > 50) {
    alertas.push({
      tipo:    'grasa_hoy',
      mensaje: `Llevas ${gras}g de grasa hoy (objetivo: <50g). Las siguientes comidas deben ser al vapor, hervidas o a la plancha sin aceite.`,
      nivel:   'advertencia',
    });
  }

  if (condiciones.includes('enfermedad-renal')) {
    if (potasio > 2000) {
      alertas.push({
        tipo:    'potasio_renal',
        mensaje: `Llevas ${potasio}mg de potasio hoy (límite renal: 2.000mg). Evita banano, papa, tomate y naranja en el resto del día.`,
        nivel:   'atencion',
      });
    }
    if (fosforo > 800) {
      alertas.push({
        tipo:    'fosforo_renal',
        mensaje: `Llevas ${fosforo}mg de fósforo hoy (límite renal: 800mg). Reduce lácteos, nueces, semillas y bebidas de cola.`,
        nivel:   'atencion',
      });
    }
  }

  if (condiciones.includes('diabetes') && carb > 0) {
    const numComidas    = Object.keys(nutriHoy).length > 0 ? Math.max(1, Math.round(calHoy / 400)) : 1;
    const carbPorComida = carb / numComidas;
    if (carbPorComida > 60) {
      alertas.push({
        tipo:    'carb_concentrado',
        mensaje: 'Concentrar muchos carbohidratos en pocas comidas genera picos de glucosa. Intenta distribuirlos de forma más uniforme a lo largo del día.',
        nivel:   'info',
      });
    }
  }

  // Fibra proporcional: la OMS recomienda 14g por cada 1.000 kcal consumidas
  // Se evalúa en tiempo real contra las calorías ya registradas, no el total diario
  const fibraEsperadaHoy = calObjetivo && calHoy > 0
    ? Math.round((calHoy / 1000) * 14)
    : 10;
  const metaFibraDia = calObjetivo ? Math.round((calObjetivo / 1000) * 14) : 25;
  if (fibra > 0 && fibra < Math.max(fibraEsperadaHoy * 0.6, 6) && calObjetivo && calHoy > calObjetivo * 0.4) {
    alertas.push({
      tipo:    'fibra_baja',
      mensaje: `Tu consumo de fibra hoy es bajo (${fibra}g de los ~${metaFibraDia}g recomendados para tu objetivo calórico). Agrega vegetales, frutas con cáscara o legumbres a la próxima comida.`,
      nivel:   'info',
    });
  }

  // Proteína acumulada del día contra objetivo personalizado (peso × factor por condición/edad)
  // Se evalúa solo cuando ya se ha consumido >50% del objetivo calórico (suficiente muestra)
  if (peso && prot > 0 && calObjetivo && calHoy > calObjetivo * 0.5) {
    const protMinKg = condiciones.includes('enfermedad-renal')
      ? 0.6
      : esMayorAdulto
        ? 1.1
        : condiciones.some(c => ['keto', 'paleo', 'bajo-carbohidratos'].includes(c))
          ? 1.2
          : condiciones.some(c => ['vegano', 'vegetariano'].includes(c))
            ? 1.0
            : 0.8;
    const protEsperadaHoy = Math.round(peso * protMinKg * (calHoy / calObjetivo));
    if (prot < protEsperadaHoy) {
      alertas.push({
        tipo:    'prot_baja_hoy',
        mensaje: `Llevas ${prot}g de proteína hoy. Para tu peso${esMayorAdulto ? ' y edad' : ''}, deberías alcanzar al menos ${Math.round(peso * protMinKg)}g/día. Incluye una fuente proteica en la próxima comida.`,
        nivel:   'info',
      });
    }
  }

  // Calcio — crítico en adultos mayores y en quienes evitan lácteos
  // Solo se evalúa si el campo viene registrado (no todos los alimentos lo reportan)
  if (esMayorAdulto && calcio > 0 && calcio < 600) {
    alertas.push({
      tipo:    'calcio_bajo_mayor',
      mensaje: `Llevas ${calcio}mg de calcio hoy. Después de los 65 años la meta es 1.200mg/día. Asegura lácteos, tofu, brócoli o almendras en las próximas comidas.`,
      nivel:   'info',
    });
  }

  return alertas;
}

// edad: número — ajusta tipo e intensidad de ejercicio por franja de vida
// peso: kg — permite calcular gasto calórico aproximado por actividad (3,5 kcal/min/70kg)
function calcularEjercicioHoy(calHoy, calObjetivo, imc, condiciones, horaActual, edad, peso) {
  if (!calObjetivo || calHoy === 0) return [];

  const superavit     = calHoy - calObjetivo;
  const recs          = [];
  const esNocturno    = horaActual >= 21 || horaActual < 6;
  const esMañana      = horaActual >= 6  && horaActual < 12;
  const esTarde       = horaActual >= 15 && horaActual < 21;
  const esRenal       = condiciones.includes('enfermedad-renal');
  const esMayorAdulto = edad && edad >= 65;
  const esAdultoMedio = edad && edad >= 40 && edad < 65;
  const esJoven       = edad && edad < 35;

  // Minutos de caminata estimados para quemar el superávit,
  // ajustados por el peso real del usuario (mayor peso = más kcal quemadas/min)
  const minCaminata = peso && superavit > 0
    ? Math.round(superavit / (3.5 * (peso / 70)))
    : null;

  if (superavit > 500) {
    if (esRenal) {
      recs.push('Llevas un superávit calórico considerable. Consulta con tu médico antes de incrementar la intensidad del ejercicio.');
    } else if (esMayorAdulto) {
      recs.push(`Superávit de ${superavit} kcal. Una caminata de 40-50 minutos a buen ritmo o natación suave es la opción más segura y efectiva para tu franja de edad.`);
    } else if (imc?.categoria === 'obesidad') {
      recs.push(`Superávit de ${superavit} kcal detectado. Una caminata de 45-60 minutos${minCaminata ? ` (~${minCaminata} min para tu peso)` : ''} a paso moderado es efectiva y segura para tu perfil.`);
    } else if (condiciones.includes('hipertension')) {
      recs.push(`Superávit de ${superavit} kcal. 45-50 minutos de cardio suave (caminata rápida o natación) son seguros para tu presión arterial.`);
    } else if (esJoven) {
      recs.push(`Superávit de ${superavit} kcal. Una sesión de cardio de 40-50 minutos (trote, bicicleta o HIIT de 20 min) es ideal a tu edad para metabolizar ese exceso.`);
    } else {
      recs.push(`Superávit de ${superavit} kcal. Realiza 45-60 minutos de cardio moderado (trotar, nadar o bicicleta) para compensar.`);
    }
  } else if (superavit > 200) {
    if (esMayorAdulto) {
      recs.push(`Llevas ${superavit} kcal extra. Una caminata de 25-35 minutos o ejercicios de equilibrio y estiramiento son seguros y efectivos para tu perfil.`);
    } else if (imc?.categoria === 'sobrepeso' || imc?.categoria === 'obesidad') {
      recs.push(`Llevas ${superavit} kcal extra. Una caminata rápida de 30-40 minutos${minCaminata ? ` (~${minCaminata} min para tu peso)` : ''} es ideal: bajo impacto y efectivo.`);
    } else if (condiciones.includes('keto')) {
      recs.push(`Llevas ${superavit} kcal extra en tu plan keto. 30 minutos de cardio aeróbico en zona 2 (conversación fácil) ayuda a mantener la cetosis.`);
    } else if (condiciones.includes('colesterol-alto')) {
      recs.push(`Llevas ${superavit} kcal extra. 30-40 minutos de cardio (5 días/semana) mejora el HDL y reduce triglicéridos.`);
    } else if (esAdultoMedio) {
      recs.push(`Llevas ${superavit} kcal sobre el objetivo. 30 minutos de cardio moderado + 10 min de fuerza es la combinación más efectiva después de los 40 para quemar el exceso y preservar músculo.`);
    } else {
      recs.push(`Llevas ${superavit} kcal sobre tu objetivo. 30-40 minutos de actividad moderada (caminata rápida, yoga activo o baile) compensará la diferencia.`);
    }
  } else if (superavit > 0) {
    if (esNocturno) {
      recs.push(esMayorAdulto
        ? 'Pequeño superávit calórico nocturno. Estiramientos suaves o una caminata de 10-15 minutos son suficientes sin alterar tu descanso.'
        : 'Pequeño superávit calórico. Una caminata suave de 15-20 minutos o estiramientos son suficientes sin alterar el descanso.');
    } else {
      recs.push('Tu balance calórico está levemente sobre el objetivo. Una caminata de 20-25 minutos o actividad ligera lo equilibrará con facilidad.');
    }
  } else if (superavit < -400) {
    if (imc?.categoria === 'bajo_peso' || esMayorAdulto) {
      recs.push(`Déficit de ${Math.abs(superavit)} kcal hoy. No agregues cardio extra — prioriza un snack nutritivo rico en proteína y carbohidratos complejos para no profundizar el déficit.`);
    } else {
      recs.push(`Llevas ${Math.abs(superavit)} kcal por debajo del objetivo. Mantén actividad suave hoy y considera un snack saludable antes de ejercitar.`);
    }
  } else {
    if (esMañana && esJoven) {
      recs.push('Balance calórico bien encaminado. A tu edad, la mañana es el mejor momento para fuerza o HIIT — el pico hormonal matutino mejora el rendimiento y la recuperación.');
    } else if (esMañana && esAdultoMedio) {
      recs.push('Balance calórico bien encaminado. Un entrenamiento de fuerza matutino (30-40 min) es especialmente recomendable a tu edad para combatir la pérdida gradual de músculo.');
    } else if (esMañana) {
      recs.push('Tu balance calórico va bien. La mañana es ideal para entrenar: cardio o fuerza antes del mediodía maximizan el metabolismo.');
    } else if (esTarde) {
      recs.push('Balance calórico equilibrado. 30 minutos de actividad moderada en la tarde complementan muy bien tu alimentación de hoy.');
    } else {
      recs.push('Tu balance calórico está equilibrado. Mantén tu rutina habitual de actividad física.');
    }
  }

  if (condiciones.includes('diabetes') && esTarde && calHoy > 0) {
    recs.push('Una caminata de 15-20 minutos después de la comida más pesada mejora la sensibilidad a la insulina y atenúa el pico glucémico postprandial.');
  }
  if (condiciones.includes('gastritis') && calHoy > 0) {
    recs.push('Espera 60-90 minutos tras comer antes de hacer ejercicio. La actividad física inmediata puede aumentar la acidez gástrica.');
  }
  if (condiciones.includes('sindrome-intestino') && calHoy > 0) {
    recs.push('El yoga, pilates o estiramientos suaves son especialmente beneficiosos para el SII — reducen el estrés que desencadena los síntomas.');
  }
  if (condiciones.includes('colesterol-alto') && superavit >= 0) {
    recs.push('El ejercicio aeróbico regular (150 min/semana) eleva el HDL y reduce los triglicéridos — tan efectivo como muchos medicamentos para el perfil lipídico.');
  }
  if (condiciones.includes('enfermedad-renal') && calHoy > 0) {
    recs.push('El ejercicio leve a moderado mejora la función cardiovascular sin sobrecargar los riñones. Evita suplementos deportivos sin supervisión médica.');
  }
  if (esAdultoMedio && superavit >= 0 && !condiciones.includes('enfermedad-renal')) {
    recs.push('Después de los 40, el entrenamiento de fuerza 2-3 veces por semana es crucial para preservar la masa muscular y mantener el metabolismo activo.');
  }
  if (esMayorAdulto && !condiciones.includes('enfermedad-renal')) {
    recs.push('Los ejercicios de equilibrio (postura en una pierna, tai chi) y movilidad articular son tan importantes como el cardio a tu edad para prevenir caídas y mantener la independencia.');
  }

  return recs;
}

// ─── Recomendaciones por condición ───────────────────────────────────────────

const REC = {
  diabetes: {
    alimentacion: [
      'Prioriza alimentos con índice glucémico bajo: avena, lentejas, vegetales sin almidón.',
      'Distribuye los carbohidratos de forma equitativa en cada comida para evitar picos de glucosa.',
      'Evita bebidas azucaradas, jugos de caja y postres con azúcar refinada.',
      'Incluye fibra en cada comida (fríjoles, brócoli, manzana con cáscara) para ralentizar la absorción de glucosa.',
      'El vinagre de manzana diluido antes de las comidas puede reducir el pico glucémico postprandial.',
      'La canela (1g/día) tiene evidencia preliminar de mejora en la sensibilidad a la insulina.',
    ],
    ejercicio: [
      'Caminar 30 minutos después de las comidas principales reduce la glucosa postprandial hasta un 12%.',
      'El ejercicio de resistencia moderada (2-3 días/semana) mejora la sensibilidad a la insulina.',
      'Evita el ejercicio extenuante en ayunas — ten siempre un snack a mano para prevenir hipoglucemia.',
      'El entrenamiento HIIT corto (10-15 min) puede ser más efectivo que el cardio largo para el control glucémico.',
    ],
    limitar: ['azúcar blanca', 'arroz blanco en exceso', 'pan blanco', 'papas fritas', 'bebidas gaseosas', 'jugos de caja', 'miel en exceso'],
  },

  hipertension: {
    alimentacion: [
      'Reduce el sodio a menos de 1.500 mg/día: evita procesados, embutidos y sopas enlatadas.',
      'La dieta DASH es muy efectiva: más frutas, verduras, lácteos bajos en grasa y granos enteros.',
      'El potasio contrarresta el sodio — banano, espinaca, fríjol y aguacate son tus aliados.',
      'El magnesio (presente en nueces, semillas y legumbres) contribuye a la regulación de la presión.',
      'Modera el consumo de alcohol (máx. 1 copa/día) y cafeína (máx. 2 tazas de café/día).',
    ],
    ejercicio: [
      'El ejercicio aeróbico regular puede reducir la presión sistólica hasta 10 mmHg.',
      'Evita ejercicios isométricos intensos (planchas estáticas, press muy pesado) que elevan la presión bruscamente.',
      'Apunta a 150 minutos semanales de actividad aeróbica moderada (caminata, natación, bicicleta).',
      'El yoga y tai chi tienen evidencia de reducción modesta de la presión arterial.',
    ],
    limitar: ['sal de mesa', 'embutidos', 'enlatados', 'quesos muy salados', 'mariscos en conserva', 'alcohol en exceso'],
  },

  celiaco: {
    alimentacion: [
      'Elimina completamente el gluten: trigo, cebada, centeno y sus derivados.',
      'Alternativas seguras: arroz, maíz, papa, quinua, yuca, plátano y legumbres.',
      'Lee siempre las etiquetas — el gluten se esconde en salsas, embutidos y aderezos.',
      'Asegura suficiente fibra y vitaminas del grupo B: muchos productos sin gluten son bajos en ellas.',
      'Busca certificación "sin gluten" (ppm <20) para avena, ya que puede estar contaminada.',
      'El hierro y el calcio pueden ser deficientes en celíacos — controla tus niveles regularmente.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas para el ejercicio.',
      'Si tienes déficit de vitaminas B12 o D (frecuente en celíacos), consúltalas antes de entrenar con alta intensidad.',
    ],
    limitar: ['pan de trigo', 'pasta regular', 'cervezas', 'avena sin certificar sin gluten', 'galletas convencionales', 'salsas con espesantes'],
  },

  'intolerancia-lactosa': {
    alimentacion: [
      'Sustituye la leche por bebidas vegetales enriquecidas con calcio (soya, almendra, avena).',
      'Los quesos curados (parmesano, manchego, cheddar) tienen menos lactosa y suelen tolerarse mejor.',
      'El yogur con probióticos vivos puede tolerarse mejor que la leche regular.',
      'Asegura tu ingesta de calcio con brócoli, col rizada, tofu, sardinas y almendras.',
      'La enzima lactasa en pastillas (antes de la comida) permite tolerar lácteos ocasionalmente.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas.',
      'Para proteína post-entrenamiento prefiere soya, guisante o huevo sobre suero de leche (whey).',
    ],
    limitar: ['leche entera', 'crema de leche', 'helados cremosos', 'quesos frescos en exceso', 'mantequilla en exceso'],
  },

  vegano: {
    alimentacion: [
      'Combina proteínas vegetales para obtener todos los aminoácidos: arroz con fríjoles, pan con hummus, maíz con lentejas.',
      'La vitamina B12 no está en plantas — usa suplemento diario o alimentos certificadamente fortificados.',
      'El hierro vegetal (no hemo) se absorbe mejor con vitamina C — espinaca con limón, lentejas con tomate.',
      'El omega-3 puede obtenerse de chía, linaza, nueces y aceite de algas (DHA/EPA directo).',
      'El zinc y el calcio de fuentes vegetales tienen menor biodisponibilidad — remoja legumbres y semillas para mejorarla.',
      'Considera suplementar vitamina D3 (de líquenes) y yodo si no consumes algas.',
    ],
    ejercicio: [
      'Una dieta vegana bien planificada soporta cualquier nivel de actividad física.',
      'Para musculación, apunta a 1.6–2.2 g de proteína por kg de peso (tofu, tempeh, seitán, legumbres).',
    ],
    limitar: ['productos ultraprocesados "veganos"', 'exceso de aceites vegetales refinados', 'snacks veganos azucarados'],
  },

  vegetariano: {
    alimentacion: [
      'Incluye huevos y lácteos (ovo-lacto) para cubrir B12 y calcio — las fuentes vegetales solas pueden ser insuficientes.',
      'Las legumbres (lentejas, garbanzos, fríjoles) son tu principal fuente de proteína — consúmelas diariamente.',
      'El zinc puede escasear — semillas de calabaza, nueces, legumbres y cereales integrales son buenas fuentes.',
      'Combina fuentes de hierro vegetal con vitamina C en cada comida para maximizar la absorción.',
    ],
    ejercicio: [
      'La dieta vegetariana es totalmente compatible con alta actividad y deportes de alto rendimiento.',
      'Para recuperación muscular, combina proteína vegetal (huevo, legumbres) con carbohidratos complejos.',
    ],
    limitar: ['carnes y pescados', 'caldos con base de carne', 'gelatina (colágeno animal)'],
  },

  'bajo-sodio': {
    alimentacion: [
      'Cocina en casa usando hierbas frescas, limón, vinagre y especias en lugar de sal.',
      'Los alimentos procesados aportan hasta el 70-75% del sodio diario — lee siempre las etiquetas nutricionales.',
      'Enjuaga los enlatados bajo el grifo por 30 segundos — reduce su sodio hasta un 40%.',
      'El potasio contrarresta el efecto del sodio — incluye aguacate, banano y espinaca en tu dieta.',
    ],
    ejercicio: [
      'Si entrenas intenso o sudas mucho, repone electrolitos con agua de coco o bebidas bajas en sodio — no con bebidas deportivas estándar.',
    ],
    limitar: ['sal de mesa', 'salsas de soya', 'quesos procesados', 'papas fritas de paquete', 'sopas instantáneas', 'embutidos'],
  },

  'bajo-carbohidratos': {
    alimentacion: [
      'Basa tu dieta en proteínas magras, grasas saludables y verduras sin almidón (brócoli, pepino, lechuga, espinaca).',
      'Sustituye el arroz por coliflor rallada o salteada — casi igual de satisfactorio con una fracción de los carbohidratos.',
      'Las legumbres tienen carbohidratos moderados pero mucha fibra — consúmelas con moderación en el almuerzo.',
      'Los carbohidratos netos (carb total – fibra) son los que cuentan — prioriza fuentes ricas en fibra.',
      'La avena y la quinua son los cereales más tolerados en dietas bajas en carbohidratos.',
    ],
    ejercicio: [
      'El entrenamiento de fuerza es muy compatible con dietas bajas en carbohidratos y preserva la masa muscular.',
      'Para ejercicio de alta intensidad, incluye un carbohidrato de bajo IG justo antes (media manzana, algunas bayas).',
    ],
    limitar: ['pan blanco', 'arroz blanco', 'pasta', 'azúcar', 'cereales de caja', 'bebidas azucaradas', 'tubérculos en exceso'],
  },

  keto: {
    alimentacion: [
      'Mantén los carbohidratos netos por debajo de 20–50 g diarios para sostener la cetosis.',
      'Las grasas saludables son tu combustible principal: aguacate, aceite de oliva, aceite de coco, nueces, salmón.',
      'Prioriza proteína moderada (1.2–1.7 g/kg) — el exceso se convierte en glucosa por gluconeogénesis.',
      'Asegura electrolitos diariamente (sodio, potasio, magnesio) — los calambres y la fatiga keto son por déficit electrolítico.',
      'La "gripe keto" (1ª-2ª semana) es temporal — más agua, sal y magnesio la atenúan.',
    ],
    ejercicio: [
      'Las primeras 2-4 semanas el rendimiento puede bajar — es la fase de adaptación a la cetosis.',
      'El cardio aeróbico de baja-media intensidad (zona 2) es ideal y compatible con la cetosis.',
      'El entrenamiento de fuerza puede requerir carbohidratos periódicos (keto cíclico) si el volumen es alto.',
    ],
    limitar: ['azúcar', 'pan y pastas', 'arroz', 'frutas altas en azúcar (banano, mango, uva)', 'legumbres en exceso', 'alcohol azucarado'],
  },

  paleo: {
    alimentacion: [
      'Consume carnes magras, pescado, huevos, frutas, verduras, nueces y semillas — alimentos sin procesamiento.',
      'Evita todos los granos, lácteos, legumbres y alimentos procesados con aditivos.',
      'Las verduras de raíz (boniato, zanahoria, remolacha) son tus carbohidratos principales y nutritivos.',
      'Prioriza carnes de animales alimentados con pasto y pescados salvajes — mayor contenido en omega-3.',
    ],
    ejercicio: [
      'El entrenamiento funcional y de fuerza encaja perfectamente con la filosofía paleo.',
      'Asegura proteína post-entrenamiento con carnes magras, huevos o pescado dentro de los 30-60 minutos.',
    ],
    limitar: ['granos y cereales', 'lácteos', 'legumbres', 'azúcar refinada', 'aceites vegetales refinados', 'alimentos ultraprocesados'],
  },

  'sin-frutos-secos': {
    alimentacion: [
      'Lee siempre las etiquetas — los frutos secos se esconden en barras energéticas, salsas, postres y panes.',
      'Sustituye las grasas de frutos secos con aguacate, semillas de girasol o aceite de oliva.',
      'Para snacks seguros: frutas frescas, palomitas naturales, vegetales crudos con hummus de semillas.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas.',
      'Para energía pre-entrenamiento libre de frutos secos usa plátano, avena o galletas de arroz con mermelada natural.',
    ],
    limitar: ['nueces', 'almendras', 'maní', 'mantequillas de frutos secos', 'pistachos', 'marañones', 'salsas mole', 'barras energéticas'],
  },

  'sin-mariscos': {
    alimentacion: [
      'Sustituye el omega-3 del pescado con linaza, chía, nueces o aceite de microalgas (DHA/EPA biodisponible).',
      'Lee siempre las etiquetas de salsas asiáticas y caldos — contienen frecuentemente pasta de camarones o extracto de ostras.',
      'El yodo puede escasear si evitas mariscos — asegúralo con sal yodada, huevos y lácteos.',
    ],
    ejercicio: ['No hay restricciones físicas específicas por esta condición.'],
    limitar: ['camarones', 'langosta', 'cangrejo', 'mejillones', 'almejas', 'salsas de ostras', 'pasta de camarones', 'caldo de mariscos'],
  },

  'bajo-grasa': {
    alimentacion: [
      'Prioriza proteínas muy magras: pechuga de pollo sin piel, claras de huevo, atún en agua, legumbres cocidas.',
      'Cocina al vapor, en horno, hervido o a la plancha — nunca en fritura.',
      'Las grasas insaturadas (aguacate, aceite de oliva) son necesarias en pequeñas cantidades — no las elimines completamente.',
      'Modera el aceite aunque sea de oliva — tiene 9 kcal por gramo, igual que cualquier grasa.',
    ],
    ejercicio: [
      'El cardio moderado es especialmente efectivo acompañado de una dieta baja en grasas para reducir el tejido adiposo.',
      'El ejercicio de fuerza preserva la masa muscular mientras reduces la grasa corporal.',
    ],
    limitar: ['frituras', 'embutidos grasos', 'lácteos enteros', 'salsas cremosas', 'pasteles', 'piel del pollo', 'carnes grasas'],
  },

  'sin-azucar': {
    alimentacion: [
      'Lee las etiquetas: el azúcar se oculta como jarabe de maíz de alta fructosa, dextrosa, maltosa, fructosa o sacarosa.',
      'Endulza con stevia, eritritol o monk fruit — tienen impacto glucémico mínimo o nulo.',
      'Las frutas enteras tienen azúcares naturales, pero su fibra ralentiza la absorción — consúmelas enteras, no en jugo.',
      'El chocolate negro >85% tiene poco azúcar y ofrece antioxidantes beneficiosos.',
    ],
    ejercicio: [
      'Para energía pre-entrenamiento usa carbohidratos complejos (avena, boniato, arroz integral) en lugar de geles o barras azucaradas.',
    ],
    limitar: ['azúcar blanca y morena', 'miel en exceso', 'jugos de caja', 'bebidas energéticas', 'postres industriales', 'kétchup y salsas dulces'],
  },

  'colesterol-alto': {
    alimentacion: [
      'Aumenta la fibra soluble: avena (3g de betaglucano/día), cebada, manzana, fríjoles y lentejas reducen el LDL activamente.',
      'Consume grasas insaturadas (aguacate, aceite de oliva, nueces) en lugar de saturadas.',
      'Los esteroles vegetales (2g/día en margarinas enriquecidas) reducen la absorción intestinal de colesterol.',
      'Limita la yema de huevo a 3-4 por semana si el colesterol está muy elevado; las claras son libres.',
      'El salmón, la caballa y la trucha 2-3 veces/semana elevan el HDL y reducen los triglicéridos.',
    ],
    ejercicio: [
      'El ejercicio aeróbico regular (150 min/semana) sube el HDL y baja los triglicéridos de forma significativa.',
      'Apunta a 30 minutos de caminata rápida o natación al menos 5 días a la semana.',
    ],
    limitar: ['grasas trans', 'carnes procesadas', 'lácteos enteros en exceso', 'frituras', 'repostería industrial', 'aceites tropicales (palma, coco en exceso)'],
  },

  'enfermedad-renal': {
    alimentacion: [
      'Controla el potasio: limita banano, papa, tomate, naranja y melón si tu médico lo indica.',
      'Reduce el fósforo: evita lácteos en exceso, nueces, semillas, bebidas de cola y aditivos fosfatados.',
      'El sodio debe controlarse estrictamente — máximo 1.500mg/día para proteger la función renal.',
      'La cantidad de proteína debe ser indicada por tu nefrólogo — tanto el exceso como el déficit son perjudiciales.',
      'Mantén un diario de líquidos si tienes restricción hídrica indicada por tu médico.',
    ],
    ejercicio: [
      'El ejercicio leve a moderado mejora la función cardiovascular sin sobrecargar los riñones.',
      'Evita suplementos de creatina, proteína en polvo o diuréticos sin supervisión médica especializada.',
    ],
    limitar: ['sal', 'alimentos procesados con fosfatos', 'refrescos de cola', 'antiinflamatorios sin receta', 'suplementos de potasio o fósforo sin prescripción'],
  },

  gastritis: {
    alimentacion: [
      'Come en porciones pequeñas y frecuentes (5-6 veces al día) para no sobrecargar ni dejar vacío el estómago.',
      'Prefiere alimentos fáciles de digerir: arroz blanco, plátano maduro, zanahoria cocida, pollo hervido, pan blanco tostado.',
      'Evita el estómago vacío más de 3-4 horas — la producción de ácido sin comida que neutralizar irrita la mucosa.',
      'Mastica despacio y come sin prisa, sentado y en ambiente tranquilo — el estrés agrava la gastritis.',
      'El jengibre fresco en té puede aliviar las náuseas y calmar la inflamación gástrica.',
    ],
    ejercicio: [
      'Evita el ejercicio intenso inmediatamente después de comer — espera al menos 60-90 minutos.',
      'Caminatas suaves (15-20 min) después de las comidas favorecen la digestión y reducen el reflujo.',
    ],
    limitar: ['café', 'alcohol', 'picantes', 'cítricos en exceso', 'aspirina e ibuprofeno sin protección gástrica', 'bebidas carbonatadas', 'frituras'],
  },

  'sindrome-intestino': {
    alimentacion: [
      'Sigue una dieta baja en FODMAPs bajo supervisión: reduce fructosa, lactosa y carbohidratos fermentables problemáticos.',
      'Come a horas regulares, en ambiente tranquilo y sin pantallas — el estrés agrava directamente el SII.',
      'El psyllium (fibra soluble) puede aliviar tanto el estreñimiento como la diarrea del SII según la dosis.',
      'Lleva un diario alimentario por 2-4 semanas para identificar tus desencadenantes personales específicos.',
      'Los probióticos (Lactobacillus y Bifidobacterium) tienen evidencia de alivio de síntomas en SII.',
    ],
    ejercicio: [
      'El ejercicio moderado regular reduce la inflamación intestinal y mejora la motilidad.',
      'El yoga y los estiramientos reducen el estrés que agrava los síntomas — practica 15-20 min al día.',
    ],
    limitar: ['legumbres en exceso', 'col y brócoli en exceso', 'cebollas y ajos crudos', 'cafeína', 'alcohol', 'edulcorantes artificiales (sorbitol, manitol)'],
  },
};

// ─── Recomendaciones por categoría/momento del día ────────────────────────────

const REC_CATEGORIA = {
  desayuno: {
    alimentacion: [
      'Un desayuno con proteína y fibra (huevo + avena o fruta con yogur) estabiliza la energía toda la mañana.',
      'Evita desayunos altos en azúcar simple (cereales azucarados, pan blanco solo) — generan pico de energía seguido de fatiga.',
      'Si el desayuno es tarde o lo saltas frecuentemente, prepara algo la noche anterior: avena overnight, huevo cocido.',
      'Incluye grasa saludable en el desayuno (aguacate, nueces, aceite de oliva) — mejora la saciedad hasta el almuerzo.',
    ],
    ejercicio: [
      'Si entrenas en ayunas por la mañana, ten un snack ligero (fruta, nueces, yogur) para después del entreno.',
      'Un desayuno completo 1-2 horas antes del ejercicio matutino mejora el rendimiento y reduce el catabolismo muscular.',
    ],
  },
  almuerzo: {
    alimentacion: [
      'El almuerzo debe ser tu comida más completa del día: proteína + carbohidrato complejo + verduras en abundancia.',
      'Comer en ambiente tranquilo, sin pantallas y masticando bien mejora la saciedad y la digestión.',
      'Un almuerzo equilibrado y abundante reduce el picoteo vespertino y la ansiedad por dulces.',
      'Incluye verduras cocidas Y crudas en el almuerzo para diversificar nutrientes y fibra.',
    ],
    ejercicio: [
      'Espera al menos 1 hora después del almuerzo antes de hacer ejercicio de alta intensidad.',
      'Si entrenas en la tarde, el almuerzo es tu principal fuente de energía — nunca lo saltes.',
    ],
  },
  cena: {
    alimentacion: [
      'La cena debe ser más ligera que el almuerzo — prioriza proteína magra (pollo, pescado, huevo) y verduras.',
      'Cena al menos 2-3 horas antes de dormir para favorecer el descanso, la digestión y el control de peso.',
      'Evita carbohidratos de alto índice glucémico en la noche — el cuerpo los usa con menos eficiencia en reposo.',
      'Una porción pequeña de carbohidrato complejo en la cena (quinua, arroz integral) puede mejorar la calidad del sueño.',
    ],
    ejercicio: [
      'El ejercicio suave nocturno (caminata, yoga, estiramientos) puede mejorar el sueño si se hace 2+ horas antes de acostarte.',
      'Evita entrenamientos de alta intensidad después de las 9 p.m. — elevan el cortisol y pueden alterar el sueño.',
    ],
  },
  'postres-snacks': {
    alimentacion: [
      'Los snacks saludables (fruta, nueces, yogur natural, palitos de vegetales) evitan bajones de energía entre comidas.',
      'Evita snacks ultraprocesados — la combinación de sal, azúcar y grasa genera sobreconsumo automático.',
      'Un snack proteico a media tarde (huevo cocido, queso, legumbres) reduce el apetito en la cena de forma efectiva.',
      'Si el postre es inevitable, elige opciones con menos azúcar: frutas, yogur con fruta o chocolate oscuro >70%.',
    ],
    ejercicio: [
      'Un snack de 150-200 kcal con carbohidratos y proteínas 30-45 min antes del entrenamiento mejora el rendimiento.',
      'Post-entrenamiento, combina carbohidrato + proteína (plátano + yogur, o arroz + pollo) para la recuperación muscular.',
    ],
  },
};

// ─── Ejercicio por IMC ────────────────────────────────────────────────────────

const EJERCICIO_IMC = {
  bajo_peso: [
    'Enfócate en ejercicios de fuerza (pesas, bandas elásticas) para ganar masa muscular, no en cardio.',
    'Evita el cardio excesivo — con bajo peso, el déficit calórico extra puede ser contraproducente.',
    'Aumenta la ingesta proteica (1.8-2.2 g/kg) y calórica para soportar el entrenamiento de fuerza.',
  ],
  normal: [
    'Mantén una combinación de cardio aeróbico (150 min/semana) y fuerza (2-3 días/semana).',
    'Varía las actividades para evitar el estancamiento: senderismo, natación, baile, ciclismo.',
    'Incluye trabajo de flexibilidad y movilidad (yoga, pilates) al menos 1-2 veces por semana.',
  ],
  sobrepeso: [
    'El cardio de bajo impacto es ideal para comenzar: caminar, nadar, bicicleta estática, elíptica.',
    'Apunta a 200-300 minutos semanales de actividad moderada para maximizar la pérdida de grasa.',
    'Agrega fuerza 2-3 veces por semana — el músculo aumenta el metabolismo basal en reposo.',
  ],
  obesidad: [
    'Consulta con tu médico antes de iniciar una rutina intensa — especialmente si hay condiciones asociadas.',
    'Comienza con caminatas de 10-15 minutos e incrementa 5 minutos por semana de forma progresiva.',
    'Los ejercicios en agua (natación, aquagym) reducen el impacto articular y son muy seguros para empezar.',
  ],
};

// ─── Motor principal ──────────────────────────────────────────────────────────

function generarRecomendaciones(usuario, consumos, consumosHoy = [], horaActual = 12) {
  const { birthDate, weight, height, healthProfile = {} } = usuario;

  const condiciones = Array.isArray(healthProfile.condiciones)
    ? healthProfile.condiciones.filter(Boolean)
    : [];

  const categorias = healthProfile.categorias || [];

  const edad     = calcularEdad(birthDate);
  const nutriHoy = sumarNutriHoy(consumosHoy);
  const imc      = calcularIMC(weight, height);
  const calObj   = calcularTDEE(weight, height, birthDate, imc);

  const esMayorAdulto = edad && edad >= 65;
  const esAdultoMedio = edad && edad >= 40 && edad < 65;
  const esJoven       = edad && edad < 35;
  const tiene         = (c) => condiciones.includes(c);

  const res = {
    imc,
    caloriasObjetivo:      calObj,
    caloriasHoy:           nutriHoy.cal || 0,
    caloriasRestantes:     calObj ? Math.max(0, calObj - (nutriHoy.cal || 0)) : null,
    progresoHoy:           calObj && (nutriHoy.cal || 0) > 0 ? Math.min(Math.round(((nutriHoy.cal || 0) / calObj) * 100), 150) : 0,
    alertas:               [],
    alertasHoy:            [],
    contextoHorario:       [],
    alimentacion:          [],
    ejercicio:             [],
    ejercicioHoy:          [],
    hidratacion:           null,
    comidasSaltadas:       [],
    condicionesDetectadas: condiciones,
    categoriasActivas:     categorias,
    nutriPromedio:         null,
    macrosHoy:             {},
  };

  // ── IMC con mensaje contextualizado ──
  if (imc) {
    const msgIMC = {
      bajo_peso:  `Tu IMC es ${imc.valor} (bajo peso). Aumenta tu ingesta calórica con alimentos nutritivos y densos en energía — prioriza proteínas y grasas saludables.`,
      normal:     `Tu IMC es ${imc.valor} (rango saludable). ¡Sigue manteniendo tus hábitos actuales!`,
      sobrepeso:  `Tu IMC es ${imc.valor} (sobrepeso). Un déficit moderado de 300–500 kcal/día combinado con ejercicio regular es la estrategia más sostenible.`,
      obesidad:   `Tu IMC es ${imc.valor} (obesidad). Te recomendamos trabajar con un profesional de salud para un plan personalizado y seguro.`,
    };
    res.alertas.push({ tipo: 'imc', mensaje: msgIMC[imc.categoria], nivel: imc.categoria === 'normal' ? 'ok' : 'atencion' });
  }

  // ── Hidratación personalizada (peso + condiciones + calHoy + edad + imc) ──
  if (weight) {
    res.hidratacion = calcularHidratacion(weight, condiciones, nutriHoy.cal || 0, edad, imc);
  }

  // ── Conflictos entre condiciones combinadas ──
  if (tiene('keto') && tiene('colesterol-alto'))
    res.alertas.push({ tipo: 'conflicto_keto_colesterol', mensaje: 'La dieta keto es alta en grasas y puede elevar el LDL. Prioriza grasas insaturadas (aguacate, oliva, nueces) y minimiza las saturadas y trans.', nivel: 'atencion' });

  if (tiene('diabetes') && tiene('enfermedad-renal'))
    res.alertas.push({ tipo: 'conflicto_diabetes_renal', mensaje: 'Diabetes + enfermedad renal requieren supervisión médica estrecha: el control de glucosa, proteínas, potasio y fósforo puede entrar en conflicto directo.', nivel: 'atencion' });

  if (tiene('hipertension') && tiene('enfermedad-renal'))
    res.alertas.push({ tipo: 'conflicto_hta_renal', mensaje: 'Hipertensión + enfermedad renal: doble restricción de sodio (<1.500mg/día). La hidratación también debe seguir exactamente las indicaciones de tu nefrólogo.', nivel: 'atencion' });

  if (tiene('gastritis') && tiene('sindrome-intestino'))
    res.alertas.push({ tipo: 'conflicto_gastritis_sii', mensaje: 'Gastritis + SII: evita picantes, cafeína y alcohol que irritan tanto el estómago como el intestino. Comidas pequeñas y frecuentes son clave para ambas condiciones.', nivel: 'info' });

  if ((tiene('vegano') || tiene('vegetariano')) && tiene('enfermedad-renal'))
    res.alertas.push({ tipo: 'conflicto_vegano_renal', mensaje: 'Dieta vegana/vegetariana + enfermedad renal: legumbres y nueces tienen alto potasio y fósforo. Consulta con tu nefrólogo para un plan de proteína vegetal compatible.', nivel: 'atencion' });

  if (tiene('keto') && tiene('enfermedad-renal'))
    res.alertas.push({ tipo: 'conflicto_keto_renal', mensaje: 'La dieta keto puede sobrecargar los riñones con proteínas y aumentar la acidez metabólica. Consulta con tu nefrólogo antes de continuar.', nivel: 'atencion' });

  if (tiene('celiaco') && (tiene('vegano') || tiene('vegetariano')))
    res.alertas.push({ tipo: 'conflicto_celiaco_vegano', mensaje: 'Celíaco + dieta vegana/vegetariana: el seitán (gluten de trigo) está prohibido para ti. Tofu, tempeh, legumbres, quinua y amaranto son tus mejores fuentes de proteína.', nivel: 'info' });

  if (tiene('bajo-carbohidratos') && tiene('gastritis'))
    res.alertas.push({ tipo: 'conflicto_lowcarb_gastritis', mensaje: 'Bajo en carbohidratos + gastritis: mantén los intervalos entre comidas cortos (máx. 3-4h) aunque las porciones sean pequeñas — el estómago vacío prolongado aumenta la acidez.', nivel: 'info' });

  if (tiene('diabetes') && tiene('keto'))
    res.alertas.push({ tipo: 'info_diabetes_keto', mensaje: 'Keto con diabetes tiene evidencia de mejora glucémica, pero requiere ajuste de medicación. Monitorea tu glucosa con mayor frecuencia y consulta con tu médico.', nivel: 'info' });

  // ── Contexto horario en tiempo real (con edad e IMC) ──
  res.contextoHorario = obtenerContextoHorario(horaActual, consumosHoy, condiciones, edad, imc?.categoria);

  // ── Recomendaciones por franja de edad ──
  if (esMayorAdulto) {
    res.alimentacion.push('Con 65+ años, el calcio (1.200mg/día) y la vitamina D (800-1.000 UI/día) son prioritarios para proteger la densidad ósea y prevenir osteoporosis.');
    res.alimentacion.push('La proteína es especialmente importante a tu edad (1.0-1.2g/kg/día) para prevenir la sarcopenia — pérdida muscular que acelera el envejecimiento funcional.');
    if (!tiene('enfermedad-renal'))
      res.alimentacion.push('Aumenta el omega-3 (salmón, sardinas, chía) — tiene efecto antiinflamatorio y protege la salud cardiovascular y cognitiva en adultos mayores.');
    res.ejercicio.push('Los ejercicios de equilibrio (postura en una pierna, tai chi) y movilidad articular son tan importantes como el cardio para prevenir caídas y mantener la independencia.');
    res.ejercicio.push('El entrenamiento de fuerza con peso liviano y muchas repeticiones preserva la masa muscular y mejora la densidad ósea sin sobrecargar las articulaciones.');
  }

  if (esAdultoMedio) {
    res.alimentacion.push('Después de los 40, el metabolismo se ralentiza gradualmente. Prioriza la calidad nutricional: más fibra, antioxidantes (frutas de colores, vegetales) y proteínas de alta calidad.');
    res.ejercicio.push('A partir de los 40, el entrenamiento de fuerza 2-3 veces por semana es esencial para compensar la pérdida natural de masa muscular y mantener el metabolismo activo.');
  }

  if (esJoven && imc?.categoria === 'bajo_peso')
    res.alimentacion.push('En adultos jóvenes con bajo peso, asegura un superávit calórico moderado (+250-300 kcal) con proteínas y carbohidratos complejos para apoyar el desarrollo de masa muscular.');

  // ── Meta de proteína diaria personalizada (peso + edad + condición) ──
  if (weight) {
    let protMinKg = 0.8;
    if (tiene('enfermedad-renal'))                                               protMinKg = 0.6;
    else if (esMayorAdulto)                                                      protMinKg = 1.1;
    else if (tiene('vegano') || tiene('vegetariano'))                            protMinKg = 1.0;
    else if (tiene('keto') || tiene('paleo') || tiene('bajo-carbohidratos'))     protMinKg = 1.2;
    else if (imc?.categoria === 'bajo_peso')                                     protMinKg = 1.2;

    const metaProt = Math.round(weight * protMinKg);
    res.alertas.push({
      tipo:    'meta_proteina',
      mensaje: `Tu objetivo de proteína diaria es ${metaProt}g (${protMinKg}g/kg)${esMayorAdulto ? ' — ajustado por edad para prevenir sarcopenia' : tiene('enfermedad-renal') ? ' — reducido por función renal' : ''}.`,
      nivel:   'info',
    });
  }

  // ── Análisis histórico de los últimos 30 días ──
  if (consumos.length > 0) {
    const cal    = promedioNutri(consumos, 'cal');
    const prot   = promedioNutri(consumos, 'prot');
    const sodio  = promedioNutri(consumos, 'sodio');
    const fibra  = promedioNutri(consumos, 'fiber');
    const carb   = promedioNutri(consumos, 'carb');
    const grasa  = promedioNutri(consumos, 'gras');
    const azucar = promedioNutri(consumos, 'azucar');

    res.nutriPromedio = { calPromedio: cal, protPromedio: prot, carbPromedio: carb, grasaPromedio: grasa, sodioPromedio: sodio, fibraPromedio: fibra };

    if (calObj && cal > 0) {
      const diff = cal - calObj;
      if (diff > 500)       res.alertas.push({ tipo: 'cal_exceso',  mensaje: `Tu promedio diario (${cal} kcal) supera tu objetivo en ${diff} kcal de forma sostenida. Reduce porciones de carbohidratos y grasas saturadas.`, nivel: 'atencion' });
      else if (diff > 300)  res.alertas.push({ tipo: 'cal_exceso',  mensaje: `Tu promedio diario (${cal} kcal) supera tu objetivo en ${diff} kcal. Considera reducir porciones o aumentar la actividad.`, nivel: 'advertencia' });
      else if (diff < -500) res.alertas.push({ tipo: 'cal_deficit', mensaje: `Tu ingesta promedio (${cal} kcal) está ${Math.abs(diff)} kcal por debajo del objetivo de forma sostenida. Esto ralentiza el metabolismo y aumenta el catabolismo muscular.`, nivel: 'atencion' });
      else if (diff < -400) res.alertas.push({ tipo: 'cal_deficit', mensaje: `Tu ingesta promedio (${cal} kcal) está muy por debajo de tu objetivo (${calObj} kcal). Un déficit alto sostenido ralentiza el metabolismo.`, nivel: 'advertencia' });
      else                  res.alertas.push({ tipo: 'cal_ok',      mensaje: `Tu ingesta calórica promedio (${cal} kcal) está cerca de tu objetivo (${calObj} kcal). ¡Buen trabajo!`, nivel: 'ok' });
    }

    const limSodioHistorico = condiciones.some(c => ['hipertension', 'enfermedad-renal', 'bajo-sodio'].includes(c))
      ? 1500
      : (edad && edad >= 50 ? 1800 : 2300);

    if (sodio > limSodioHistorico) {
      res.alertas.push({
        tipo:    'sodio_alto',
        mensaje: `Tu consumo promedio de sodio (${sodio}mg/día) supera el límite para tu perfil (${limSodioHistorico}mg). Reduce alimentos procesados y sal añadida de forma consistente.`,
        nivel:   sodio > limSodioHistorico * 1.5 ? 'atencion' : 'advertencia',
      });
    }

    if (fibra > 0 && fibra < 20)
      res.alimentacion.push('Tu consumo de fibra en promedio es bajo. Agrega más legumbres, frutas con cáscara, verduras y cereales integrales en cada comida para alcanzar los 25-38g diarios recomendados.');

    // Proteína promedio contra meta personalizada
    if (weight && prot > 0) {
      let protMinKg = 0.8;
      if (tiene('enfermedad-renal'))                                             protMinKg = 0.6;
      else if (esMayorAdulto)                                                    protMinKg = 1.1;
      else if (tiene('vegano') || tiene('vegetariano'))                          protMinKg = 1.0;
      else if (tiene('keto') || tiene('paleo') || tiene('bajo-carbohidratos'))   protMinKg = 1.2;
      else if (imc?.categoria === 'bajo_peso')                                   protMinKg = 1.2;

      const minProt = Math.round(weight * protMinKg);
      if (prot < minProt)
        res.alimentacion.push(`Tu proteína diaria promedio (${prot}g) está por debajo del mínimo recomendado para tu perfil (${minProt}g). Incluye más ${tiene('vegano') ? 'tofu, tempeh, legumbres o quinua' : 'huevos, legumbres, carnes magras o lácteos'} en cada comida principal.`);
    }

    if (azucar > 0 && condiciones.some(c => ['diabetes', 'sin-azucar'].includes(c)) && azucar > 25)
      res.alertas.push({ tipo: 'azucar_alto', mensaje: `Tu consumo promedio de azúcar (${azucar}g/día) es elevado para tu condición. Revisa etiquetas nutricionales y reduce los alimentos procesados dulces de forma constante.`, nivel: 'advertencia' });

    if (grasa > 0 && condiciones.some(c => ['colesterol-alto', 'bajo-grasa'].includes(c)) && grasa > 65)
      res.alertas.push({ tipo: 'grasa_alta', mensaje: `Tu consumo promedio de grasas (${grasa}g/día) es elevado para tu perfil. Prioriza cocciones sin fritura y fuentes de grasa insaturada.`, nivel: 'advertencia' });

    // Comidas saltadas con contexto enriquecido por condición + edad + IMC
    detectarComidasSaltadas(consumos).forEach(({ tipo, porcentaje }) => {
      let extra = '';
      if (tipo === 'desayuno' && tiene('diabetes'))              extra = ' Para tu condición, saltarte el desayuno puede desestabilizar la glucosa durante todo el día.';
      else if (tipo === 'desayuno' && tiene('gastritis'))        extra = ' Con gastritis, el estómago vacío prolongado aumenta la acidez y la irritación gástrica.';
      else if (tipo === 'desayuno' && esMayorAdulto)             extra = ' En adultos mayores, el desayuno es especialmente importante para la glucosa matutina y la energía del día.';
      else if (tipo === 'almuerzo' && tiene('diabetes'))         extra = ' Omitir el almuerzo con diabetes puede generar hipoglucemia vespertina.';
      else if (tipo === 'cena' && imc?.categoria === 'obesidad') extra = ' Saltarte la cena puede generar mayor hambre nocturna y atracones — es mejor planificar una cena ligera.';
      else if (tipo === 'cena' && (tiene('keto') || tiene('bajo-carbohidratos'))) extra = ' Asegúrate de que la proteína nocturna sea adecuada para sostener tus objetivos metabólicos.';

      res.comidasSaltadas.push({
        tipo,
        mensaje: `Registras ${tipo} solo el ${porcentaje}% de los días. Saltarte el ${tipo} puede afectar tu energía, metabolismo y objetivos de salud.${extra}`,
      });
    });

  } else {
    res.alertas.push({ tipo: 'sin_datos', mensaje: 'Aún no tienes consumos registrados. Empieza a registrar tus comidas para recibir recomendaciones completamente personalizadas.', nivel: 'info' });
  }

  // ── Alertas en tiempo real (micronutrientes de hoy con peso y edad) ──
  if (consumosHoy.length > 0) {
    res.alertasHoy = evaluarMicronutrientesHoy(nutriHoy, condiciones, calObj, weight, edad);

    if (calObj && (nutriHoy.cal || 0) > calObj * 1.2) {
      const exceso = Math.round((nutriHoy.cal || 0) - calObj);
      res.alertasHoy.push({
        tipo:    'cal_exceso_hoy',
        mensaje: `Hoy ya superaste tu objetivo calórico en ${exceso} kcal (${nutriHoy.cal || 0} vs ${calObj} kcal). Opta por opciones muy ligeras para el resto del día: vegetales, agua, caldos o proteína magra.`,
        nivel:   exceso > 500 ? 'atencion' : 'advertencia',
      });
    }

    if (calObj && (nutriHoy.cal || 0) > calObj * 0.3) {
      const carbReal = ((nutriHoy.carb || 0) * 4) / (nutriHoy.cal || 1);
      const protReal = ((nutriHoy.prot || 0) * 4) / (nutriHoy.cal || 1);
      const grasReal = ((nutriHoy.gras || 0) * 9) / (nutriHoy.cal || 1);

      if (tiene('keto') && carbReal > 0.1)
        res.alertasHoy.push({ tipo: 'macro_keto', mensaje: `Los carbohidratos representan el ${Math.round(carbReal * 100)}% de tus calorías de hoy — en keto deberían ser <5%. Prioriza grasas y proteínas en las próximas comidas.`, nivel: 'advertencia' });

      if (tiene('bajo-grasa') && grasReal > 0.25)
        res.alertasHoy.push({ tipo: 'macro_grasa', mensaje: `Las grasas representan el ${Math.round(grasReal * 100)}% de tus calorías de hoy — el objetivo para tu condición es <15-20%. Opta por cocción al vapor o plancha.`, nivel: 'info' });

      if (tiene('diabetes') && carbReal > 0.55)
        res.alertasHoy.push({ tipo: 'macro_diab', mensaje: `Los carbohidratos son el ${Math.round(carbReal * 100)}% de tus calorías de hoy. Para diabetes, se recomienda no superar el 45-50% — añade más proteína y vegetales.`, nivel: 'info' });

      if (tiene('colesterol-alto') && grasReal > 0.35)
        res.alertasHoy.push({ tipo: 'macro_col', mensaje: `Las grasas representan el ${Math.round(grasReal * 100)}% de tus calorías de hoy. Para tu perfil el objetivo es <30% — prioriza proteínas magras y vegetales.`, nivel: 'info' });

      res.macrosHoy = {
        carbPct: Math.round(carbReal * 100),
        protPct: Math.round(protReal * 100),
        grasPct: Math.round(grasReal * 100),
      };
    }
  }

  // ── Ejercicio para hoy (con edad y peso) ──
  res.ejercicioHoy = calcularEjercicioHoy(
    nutriHoy.cal || 0,
    calObj,
    imc,
    condiciones,
    horaActual,
    edad,
    weight
  );

  // ── Recomendaciones por condición ──
  condiciones.forEach(cond => {
    const d = REC[cond];
    if (!d) return;
    if (d.alimentacion?.length) res.alimentacion.push(...d.alimentacion);
    if (d.ejercicio?.length)    res.ejercicio.push(...d.ejercicio);
    if (d.limitar?.length)
      res.alertas.push({ tipo: `limitar_${cond}`, mensaje: `Para ${cond.replace(/-/g, ' ')}, limita: ${d.limitar.join(', ')}.`, nivel: 'info' });
  });

  // ── Recomendaciones por categoría/momento del día ──
  categorias.forEach(cat => {
    const d = REC_CATEGORIA[cat];
    if (!d) return;
    if (d.alimentacion?.length) res.alimentacion.push(...d.alimentacion);
    if (d.ejercicio?.length)    res.ejercicio.push(...d.ejercicio);
  });

  // ── Ejercicio por IMC ──
  if (imc) {
    const ejs = EJERCICIO_IMC[imc.categoria] || [];
    if (res.ejercicio.length === 0)    res.ejercicio.push(...ejs);
    else if (res.ejercicio.length < 2) res.ejercicio.unshift(ejs[0] || '');
  }

  // ── Cobertura real por sección ──
  res.coberturaAlimentacion =
    condiciones.some(c => REC[c]?.alimentacion?.length > 0) ||
    categorias.some(c => REC_CATEGORIA[c]?.alimentacion?.length > 0) ||
    esMayorAdulto || esAdultoMedio || (esJoven && imc?.categoria === 'bajo_peso') || !!weight;

  res.coberturaEjercicio =
    condiciones.some(c => REC[c]?.ejercicio?.length > 0) ||
    categorias.some(c => REC_CATEGORIA[c]?.ejercicio?.length > 0) ||
    !!imc;

  // Deduplicación final
  res.alimentacion = [...new Set(res.alimentacion)].filter(Boolean);
  res.ejercicio    = [...new Set(res.ejercicio)].filter(Boolean);
  res.ejercicioHoy = [...new Set(res.ejercicioHoy)].filter(Boolean);
  res.alertasHoy   = res.alertasHoy.filter((a, i, arr) => arr.findIndex(x => x.tipo === a.tipo) === i);

  return res;
}

module.exports = { generarRecomendaciones };