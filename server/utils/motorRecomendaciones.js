//  Constantes 

const CALORIAS_BASE = {
  hombre: { sedentario: 2000, moderado: 2400, activo: 2800 },
  mujer:  { sedentario: 1700, moderado: 2000, activo: 2300 },
};

//  Utilidades 

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

function calcularTMB(peso, altura, edad) {
  if (!peso || !altura || !edad) return null;
  return Math.round((10 * peso + 6.25 * altura - 5 * edad) * 1.55);
}

function promedioNutri(consumos, campo) {
  if (!consumos.length) return 0;
  const fechas = [...new Set(consumos.map(c => c.fechaBogota))];
  const totales = fechas.map(f =>
    consumos.filter(c => c.fechaBogota === f).reduce((s, c) => s + (c.nutri?.[campo] || 0), 0)
  );
  return Math.round(totales.reduce((a, b) => a + b, 0) / fechas.length);
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

//  Recomendaciones por condición 

const REC = {
  diabetes: {
    alimentacion: [
      'Prioriza alimentos con índice glucémico bajo: avena, lentejas, vegetales sin almidón.',
      'Distribuye los carbohidratos de forma equitativa en cada comida para evitar picos de glucosa.',
      'Evita bebidas azucaradas, jugos de caja y postres con azúcar refinada.',
      'Incluye fibra en cada comida (fríjoles, brócoli, manzana con cáscara) para ralentizar la absorción de glucosa.',
    ],
    ejercicio: [
      'Caminar 30 minutos después de las comidas principales ayuda a reducir la glucosa postprandial.',
      'El ejercicio de resistencia moderada mejora la sensibilidad a la insulina.',
      'Evita el ejercicio extenuante en ayunas — siempre ten un snack a mano.',
    ],
    limitar: ['azúcar blanca', 'arroz blanco en exceso', 'pan blanco', 'papas fritas', 'bebidas gaseosas'],
  },

  hipertension: {
    alimentacion: [
      'Reduce el sodio a menos de 1.500 mg/día: evita procesados, embutidos y sopas enlatadas.',
      'La dieta DASH es muy efectiva: más frutas, verduras, lácteos bajos en grasa y granos enteros.',
      'El potasio contrarresta el sodio — banano, espinaca, fríjol y aguacate son tus aliados.',
      'Modera el consumo de alcohol y cafeína.',
    ],
    ejercicio: [
      'El ejercicio aeróbico regular puede reducir la presión sistólica hasta 10 mmHg.',
      'Evita ejercicios isométricos intensos que elevan la presión bruscamente.',
      'Apunta a 150 minutos semanales de actividad moderada.',
    ],
    limitar: ['sal de mesa', 'embutidos', 'enlatados', 'quesos muy salados', 'mariscos en conserva'],
  },

  celiaco: {
    alimentacion: [
      'Elimina completamente el gluten: trigo, cebada, centeno y derivados.',
      'Alternativas seguras: arroz, maíz, papa, quinua, yuca, plátano y legumbres.',
      'Lee siempre las etiquetas — el gluten se esconde en salsas, embutidos y aderezos.',
      'Asegura suficiente fibra: muchos productos sin gluten son bajos en ella.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas.',
      'Si tienes déficit de vitaminas B12 o D (común en celíacos), consulta antes de entrenar intenso.',
    ],
    limitar: ['pan de trigo', 'pasta regular', 'cervezas', 'avena sin certificar sin gluten', 'galletas convencionales'],
  },

  'intolerancia-lactosa': {
    alimentacion: [
      'Sustituye la leche por bebidas vegetales enriquecidas con calcio (soya, almendra, avena).',
      'Los quesos curados tienen menos lactosa y suelen tolerarse mejor.',
      'El yogur con probióticos puede tolerarse mejor que la leche regular.',
      'Asegura tu ingesta de calcio con brócoli, col rizada, tofu y sardinas.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas.',
      'Para proteína post-entrenamiento prefiere soya o huevo sobre suero (whey).',
    ],
    limitar: ['leche entera', 'crema de leche', 'helados cremosos', 'quesos frescos en exceso'],
  },

  vegano: {
    alimentacion: [
      'Combina proteínas vegetales: arroz con fríjoles, pan con hummus.',
      'La vitamina B12 no está en plantas — considera suplemento o alimentos fortificados.',
      'El hierro vegetal se absorbe mejor con vitamina C (espinaca con limón, lentejas con tomate).',
      'El omega-3 puede obtenerse de chía, linaza, nueces y aceite de cáñamo.',
    ],
    ejercicio: [
      'Una dieta vegana bien planificada soporta cualquier nivel de actividad.',
      'Para musculación, asegura 1.6–2.2 g de proteína por kg (tofu, tempeh, legumbres, seitán).',
    ],
    limitar: ['productos ultraprocesados "veganos"', 'exceso de aceites vegetales refinados'],
  },

  vegetariano: {
    alimentacion: [
      'Incluye huevos y lácteos si eres ovo-lacto-vegetariano para cubrir B12 y calcio.',
      'Las legumbres (lentejas, garbanzos, fríjoles) son tu principal fuente de proteína.',
      'El zinc puede escasear — consúmelo con semillas de calabaza, nueces y legumbres.',
    ],
    ejercicio: [
      'La dieta vegetariana es compatible con alta actividad.',
      'Para recuperación muscular combina proteína vegetal con carbohidratos complejos.',
    ],
    limitar: ['carnes y pescados', 'caldos con base de carne'],
  },

  'bajo-sodio': {
    alimentacion: [
      'Cocina en casa usando hierbas frescas, limón y especias en lugar de sal.',
      'Los alimentos procesados contienen hasta el 70% del sodio diario — lee las etiquetas.',
      'Enjuaga los enlatados bajo el grifo para reducir su sodio hasta un 40%.',
    ],
    ejercicio: [
      'Si entrenas intenso o sudas mucho, repone electrolitos con agua de coco o bebidas bajas en sodio.',
    ],
    limitar: ['sal de mesa', 'salsas de soya', 'quesos procesados', 'papas fritas de paquete', 'sopas instantáneas'],
  },

  'bajo-carbohidratos': {
    alimentacion: [
      'Basa tu dieta en proteínas magras, grasas saludables y verduras sin almidón.',
      'Sustituye el arroz por coliflor rallada o brócoli salteado.',
      'Las legumbres tienen carbohidratos pero también mucha fibra — consúmelas con moderación.',
    ],
    ejercicio: [
      'El entrenamiento de fuerza es muy compatible con dietas bajas en carbohidratos.',
      'Para ejercicio de alta intensidad incluye un pequeño carbohidrato de bajo IG antes (fruta).',
    ],
    limitar: ['pan blanco', 'arroz blanco', 'pasta', 'azúcar', 'cereales de caja', 'bebidas azucaradas'],
  },

  keto: {
    alimentacion: [
      'Mantén los carbohidratos por debajo de 20–50 g diarios para sostener la cetosis.',
      'Las grasas saludables son tu combustible principal: aguacate, aceite de oliva, nueces.',
      'Prioriza proteínas moderadas para evitar que el exceso se convierta en glucosa.',
      'Asegura electrolitos (sodio, potasio, magnesio) — son comunes los calambres en la adaptación.',
    ],
    ejercicio: [
      'En las primeras semanas de keto el rendimiento puede bajar — es normal durante la adaptación.',
      'Ejercicio aeróbico de baja intensidad es ideal mientras te adaptas.',
    ],
    limitar: ['azúcar', 'pan', 'pasta', 'arroz', 'frutas altas en azúcar', 'legumbres en exceso'],
  },

  paleo: {
    alimentacion: [
      'Consume carnes magras, pescado, huevos, frutas, verduras, nueces y semillas.',
      'Evita todos los granos, lácteos, legumbres y alimentos procesados.',
      'Las verduras de raíz (boniato, zanahoria) son tus carbohidratos principales.',
    ],
    ejercicio: [
      'El entrenamiento funcional y de fuerza encaja perfectamente con la filosofía paleo.',
      'Asegura proteína post-entrenamiento con carnes magras o huevos.',
    ],
    limitar: ['granos', 'lácteos', 'legumbres', 'azúcar refinada', 'aceites vegetales refinados'],
  },

  'sin-frutos-secos': {
    alimentacion: [
      'Lee siempre las etiquetas — los frutos secos se esconden en barras, salsas y postres.',
      'Sustituye las grasas de frutos secos con aguacate, semillas de girasol o aceite de oliva.',
      'Para snacks seguros usa frutas frescas, palomitas naturales o vegetales crudos.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas.',
      'Para energía pre-entrenamiento libre de frutos secos usa plátano o avena.',
    ],
    limitar: ['nueces', 'almendras', 'maní', 'mantequillas de frutos secos', 'aceite de coco en polvo con base de nuez'],
  },

  'sin-mariscos': {
    alimentacion: [
      'Sustituye el omega-3 del pescado con linaza, chía, nueces o aceite de algas.',
      'Lee siempre las etiquetas de salsas asiáticas y caldos — suelen contener mariscos.',
      'El yodo puede escasear si evitas mariscos — inclúyelo con sal yodada y huevos.',
    ],
    ejercicio: ['No hay restricciones físicas específicas.'],
    limitar: ['camarones', 'langosta', 'cangrejo', 'mejillones', 'almejas', 'salsas de ostras', 'pasta de camarones'],
  },

  'bajo-grasa': {
    alimentacion: [
      'Prioriza proteínas muy magras: pechuga de pollo, clara de huevo, atún en agua, legumbres.',
      'Cocina al vapor, horno o a la plancha en lugar de frituras.',
      'Las grasas buenas (aguacate, aceite de oliva) son necesarias — no las elimines por completo.',
    ],
    ejercicio: [
      'El cardio moderado es especialmente efectivo junto a una dieta baja en grasas.',
      'Complementa con ejercicio de fuerza para preservar músculo mientras reduces grasa.',
    ],
    limitar: ['frituras', 'embutidos grasos', 'lácteos enteros', 'salsas cremosas', 'pasteles'],
  },

  'sin-azucar': {
    alimentacion: [
      'Lee las etiquetas: el azúcar se oculta como jarabe de maíz, dextrosa, maltosa o fructosa.',
      'Endulza con stevia, eritritol o monk fruit en lugar de azúcar refinada.',
      'Las frutas tienen azúcares naturales — consúmelas enteras para aprovechar la fibra.',
    ],
    ejercicio: [
      'Para energía pre-entrenamiento usa carbohidratos complejos en lugar de geles o barras azucaradas.',
    ],
    limitar: ['azúcar blanca y morena', 'miel en exceso', 'jugos de caja', 'bebidas energéticas', 'postres industriales'],
  },

  'colesterol-alto': {
    alimentacion: [
      'Aumenta la fibra soluble: avena, cebada, manzana, fríjoles y lentejas ayudan a reducir el LDL.',
      'Consume grasas insaturadas (aguacate, aceite de oliva, nueces) en lugar de saturadas.',
      'Los esteroles vegetales presentes en margarinas enriquecidas pueden reducir el colesterol.',
      'Limita la yema de huevo a 3–4 por semana si tu colesterol está muy elevado.',
    ],
    ejercicio: [
      'El ejercicio aeróbico regular sube el HDL (colesterol bueno) y baja los triglicéridos.',
      'Apunta a 30 minutos de caminata rápida o natación al menos 5 días a la semana.',
    ],
    limitar: ['grasas trans', 'carnes procesadas', 'lácteos enteros en exceso', 'frituras', 'repostería industrial'],
  },

  'enfermedad-renal': {
    alimentacion: [
      'Controla el potasio: limita banano, papa, tomate y naranja si tu médico lo indica.',
      'Reduce el fósforo: evita lácteos en exceso, nueces, semillas y bebidas de cola.',
      'El sodio debe controlarse estrictamente para proteger la función renal.',
      'Consulta siempre con tu nefrólogo sobre las cantidades específicas de proteína.',
    ],
    ejercicio: [
      'El ejercicio leve a moderado mejora la función cardiovascular sin sobrecargar los riñones.',
      'Evita suplementos de creatina o proteína en polvo sin supervisión médica.',
    ],
    limitar: ['sal', 'alimentos procesados', 'suplementos de potasio y fósforo', 'antiinflamatorios sin receta'],
  },

  gastritis: {
    alimentacion: [
      'Come en porciones pequeñas y frecuentes (5–6 veces al día) para no sobrecargar el estómago.',
      'Prefiere alimentos fáciles de digerir: arroz, plátano maduro, zanahoria cocida, pollo hervido.',
      'Evita el estómago vacío más de 3–4 horas — puede aumentar la irritación.',
      'Mastica despacio y come sin prisa para facilitar la digestión.',
    ],
    ejercicio: [
      'Evita ejercicio intenso inmediatamente después de comer.',
      'Caminatas suaves después de las comidas pueden ayudar a la digestión.',
    ],
    limitar: ['café', 'alcohol', 'picantes', 'cítricos en exceso', 'aspirina e ibuprofeno sin protección gástrica'],
  },

  'sindrome-intestino': {
    alimentacion: [
      'Sigue una dieta baja en FODMAPs bajo supervisión: reduce fructosa, lactosa y ciertos carbohidratos fermentables.',
      'Come a horas regulares y en ambiente tranquilo — el estrés agrava el SII.',
      'El psyllium (fibra soluble) puede aliviar tanto el estreñimiento como la diarrea del SII.',
      'Lleva un diario alimentario para identificar tus desencadenantes personales.',
    ],
    ejercicio: [
      'El ejercicio moderado regular reduce la inflamación intestinal y mejora la motilidad.',
      'El yoga y los estiramientos pueden reducir el estrés que agrava los síntomas.',
    ],
    limitar: ['legumbres en exceso', 'col', 'cebollas crudas', 'cafeína', 'alcohol', 'edulcorantes artificiales'],
  },
};

//  Recomendaciones por categoría/momento del día 
// Tips específicos que el motor genera cuando el usuario tiene una categoría activa

const REC_CATEGORIA = {
  desayuno: {
    alimentacion: [
      'Un desayuno con proteína y fibra (huevo + avena o frutas con yogur) estabiliza la energía toda la mañana.',
      'Evita desayunos altos en azúcar simple (cereales azucarados, pan blanco solo) — generan un pico y luego fatiga.',
      'Si tu desayuno es tarde o lo saltas frecuentemente, considera preparar algo la noche anterior.',
    ],
    ejercicio: [
      'Si entrenas en la mañana en ayunas, ten a mano un snack ligero (fruta, nueces) para después.',
      'Un desayuno completo 1–2 horas antes del ejercicio matutino mejora el rendimiento.',
    ],
  },
  almuerzo: {
    alimentacion: [
      'El almuerzo debe ser tu comida más completa del día: proteína, carbohidrato complejo y verduras.',
      'Comer en un ambiente tranquilo y sin pantallas mejora la saciedad y la digestión.',
      'Un almuerzo abundante y equilibrado reduce el picoteo de la tarde.',
    ],
    ejercicio: [
      'Espera al menos 1 hora después del almuerzo antes de hacer ejercicio intenso.',
      'Si entrenas en la tarde, el almuerzo es tu principal fuente de energía — no lo saltes.',
    ],
  },
  cena: {
    alimentacion: [
      'La cena debería ser ligera y fácil de digerir — prioriza proteína magra y verduras.',
      'Cena al menos 2 horas antes de dormir para favorecer el descanso y la digestión.',
      'Evita carbohidratos de alto índice glucémico en la noche — el cuerpo los usa menos en reposo.',
    ],
    ejercicio: [
      'El ejercicio suave nocturno (caminata, yoga) puede mejorar el sueño si se hace 2+ horas antes de acostarte.',
      'Evita entrenamientos de alta intensidad después de las 9 p.m. — pueden alterar el sueño.',
    ],
  },
  'postres-snacks': {
    alimentacion: [
      'Los snacks saludables (fruta, nueces, yogur) evitan bajones de energía entre comidas.',
      'Evita snacks ultraprocesados — su combinación de sal, azúcar y grasa genera sobreconsumo.',
      'Un snack proteico a media tarde (huevo cocido, queso, legumbres) reduce el apetito en la cena.',
    ],
    ejercicio: [
      'Un snack de 150–200 kcal 30–45 min antes del entrenamiento mejora el rendimiento.',
      'Post-entrenamiento, combina carbohidrato + proteína (plátano + yogur) para la recuperación.',
    ],
  },
};

//  Ejercicio por IMC 

const EJERCICIO_IMC = {
  bajo_peso: [
    'Enfócate en ejercicios de fuerza (pesas, bandas) para ganar masa muscular.',
    'Evita el cardio excesivo — prioriza el entrenamiento de resistencia.',
  ],
  normal: [
    'Mantén una combinación de cardio (150 min/semana) y fuerza (2–3 días/semana).',
    'Varía las actividades para evitar el estancamiento: senderismo, natación, baile.',
  ],
  sobrepeso: [
    'El cardio de bajo impacto es ideal: caminar, nadar, bicicleta, elíptica.',
    'Apunta a 200–300 minutos semanales de actividad moderada.',
    'Agrega fuerza 2 veces por semana — el músculo aumenta el metabolismo en reposo.',
  ],
  obesidad: [
    'Consulta con tu médico antes de iniciar una rutina intensa.',
    'Comienza con caminatas de 10–15 minutos e incrementa gradualmente.',
    'Los ejercicios en el agua reducen el impacto en las articulaciones.',
  ],
};

//  Motor principal 

function generarRecomendaciones(usuario, consumos) {
  const { age, weight, height, healthProfile = {} } = usuario;
  const condiciones = Array.isArray(healthProfile.condiciones)
    ? healthProfile.condiciones.filter(Boolean)
    : [];

  // Categorías de momento del día seleccionadas por el usuario
  const categorias = healthProfile.categorias || [];

  const res = {
    imc: null,
    caloriasObjetivo: null,
    alertas: [],
    alimentacion: [],
    ejercicio: [],
    comidasSaltadas: [],
    condicionesDetectadas: condiciones,
    categoriasActivas: categorias,         // ← NUEVO: se devuelve al frontend
  };

  //  IMC y metabolismo 
  const imc    = calcularIMC(weight, height);
  const calObj = calcularTMB(weight, height, age);

  if (imc) {
    res.imc = imc;
    const msgs = {
      bajo_peso: 'Tu IMC indica bajo peso. Aumenta tu ingesta calórica con alimentos nutritivos.',
      normal:    'Tu IMC está en rango saludable. ¡Sigue manteniendo tus hábitos!',
      sobrepeso: 'Tu IMC indica sobrepeso. Un déficit moderado (300–500 kcal/día) con ejercicio es la estrategia más sostenible.',
      obesidad:  'Tu IMC indica obesidad. Te recomendamos trabajar con un profesional de salud para un plan personalizado.',
    };
    res.alertas.push({ tipo: 'imc', mensaje: msgs[imc.categoria], nivel: imc.categoria === 'normal' ? 'ok' : 'atencion' });
  }

  if (calObj) res.caloriasObjetivo = calObj;

  //  Análisis de consumos 
  if (consumos.length > 0) {
    const cal   = promedioNutri(consumos, 'cal');
    const prot  = promedioNutri(consumos, 'prot');
    const sodio = promedioNutri(consumos, 'sodio');
    const fibra = promedioNutri(consumos, 'fibra');
    const carb  = promedioNutri(consumos, 'carb');
    const grasa = promedioNutri(consumos, 'grasas');

    res.nutriPromedio = { calPromedio: cal, protPromedio: prot, carbPromedio: carb, grasaPromedio: grasa, sodioPromedio: sodio, fibraPromedio: fibra };

    if (calObj && cal > 0) {
      const diff = cal - calObj;
      if (diff > 300)       res.alertas.push({ tipo: 'cal_exceso',  mensaje: `Consumo promedio ${diff} kcal sobre tu objetivo (${calObj} kcal). Considera reducir porciones o aumentar actividad.`, nivel: 'advertencia' });
      else if (diff < -400) res.alertas.push({ tipo: 'cal_deficit', mensaje: `Ingesta promedio (${cal} kcal) muy por debajo de tu objetivo (${calObj} kcal). Un déficit alto ralentiza el metabolismo.`, nivel: 'advertencia' });
      else                  res.alertas.push({ tipo: 'cal_ok',      mensaje: `Tu ingesta calórica (${cal} kcal) está cerca de tu objetivo (${calObj} kcal). ¡Buen trabajo!`, nivel: 'ok' });
    }

    // Sodio — umbral reducido si condición hipertensión o renal
    const limSodio = condiciones.some(c => ['hipertension', 'enfermedad-renal'].includes(c)) ? 1500 : 2300;
    if (sodio > limSodio) {
      res.alertas.push({ tipo: 'sodio_alto', mensaje: `Consumo de sodio (${sodio} mg/día) supera el límite recomendado (${limSodio} mg). Reduce procesados y sal.`, nivel: 'advertencia' });
    }

    if (fibra > 0 && fibra < 20) {
      res.alimentacion.push('Tu consumo de fibra parece bajo. Agrega más legumbres, frutas con cáscara, verduras y cereales integrales.');
    }

    if (weight && prot > 0) {
      const minProt = weight * 0.8;
      if (prot < minProt) {
        res.alimentacion.push(`Proteína diaria (${prot}g) por debajo del mínimo (${Math.round(minProt)}g). Incluye más huevos, legumbres, carnes magras o lácteos.`);
      }
    }

    // Alerta de azúcar alta si condición diabetes o sin-azucar
    const azucar = promedioNutri(consumos, 'azucar');
    if (azucar > 0 && condiciones.some(c => ['diabetes', 'sin-azucar'].includes(c)) && azucar > 25) {
      res.alertas.push({ tipo: 'azucar_alto', mensaje: `Consumo de azúcar (${azucar}g/día) elevado para tu condición. Revisa etiquetas y reduce alimentos procesados dulces.`, nivel: 'advertencia' });
    }

    // Alerta de grasa alta si condición colesterol-alto o bajo-grasa
    if (grasa > 0 && condiciones.some(c => ['colesterol-alto', 'bajo-grasa'].includes(c)) && grasa > 65) {
      res.alertas.push({ tipo: 'grasa_alta', mensaje: `Consumo de grasas (${grasa}g/día) elevado para tu perfil. Prioriza cocciones sin fritura y grasas insaturadas.`, nivel: 'advertencia' });
    }

    // Comidas saltadas — mensaje mejorado con contexto según condición
    detectarComidasSaltadas(consumos).forEach(({ tipo, porcentaje }) => {
      let extra = '';
      if (tipo === 'desayuno' && condiciones.includes('diabetes')) {
        extra = ' Para tu condición, saltarte el desayuno puede desestabilizar la glucosa.';
      } else if (tipo === 'desayuno' && condiciones.includes('gastritis')) {
        extra = ' Con gastritis, el estómago vacío puede aumentar la irritación.';
      } else if (tipo === 'cena' && condiciones.some(c => ['keto', 'bajo-carbohidratos'].includes(c))) {
        extra = ' Asegúrate de que la proteína de la noche sea adecuada para sostener la cetosis.';
      }
      res.comidasSaltadas.push({
        tipo,
        mensaje: `Registras ${tipo} solo el ${porcentaje}% de los días. Saltarte el ${tipo} puede afectar tu energía y metabolismo.${extra}`,
      });
    });

  } else {
    res.alertas.push({ tipo: 'sin_datos', mensaje: 'Aún no tienes consumos registrados. Empieza a registrar tus comidas para recibir recomendaciones personalizadas.', nivel: 'info' });
  }

  //  Recomendaciones por condición (deduplicadas desde el origen) 
  condiciones.forEach(cond => {
    const d = REC[cond];
    if (!d) return;
    if (d.alimentacion?.length) res.alimentacion.push(...d.alimentacion);
    if (d.ejercicio?.length)    res.ejercicio.push(...d.ejercicio);
    if (d.limitar?.length) {
      res.alertas.push({ tipo: `limitar_${cond}`, mensaje: `Para ${cond.replace(/-/g, ' ')}, limita: ${d.limitar.join(', ')}.`, nivel: 'info' });
    }
  });

  // Recomendaciones por categoría/momento del día 
  categorias.forEach(cat => {
    const d = REC_CATEGORIA[cat];
    if (!d) return;
    if (d.alimentacion?.length) res.alimentacion.push(...d.alimentacion);
    if (d.ejercicio?.length)    res.ejercicio.push(...d.ejercicio);
  });

  //  Ejercicio por IMC 
  if (imc) {
    const ejs = EJERCICIO_IMC[imc.categoria] || [];
    if (res.ejercicio.length === 0)    res.ejercicio.push(...ejs);
    else if (res.ejercicio.length < 2) res.ejercicio.unshift(ejs[0] || '');
  }

  //  Cobertura real por sección 
  res.coberturaAlimentacion =
    condiciones.some(c => REC[c]?.alimentacion?.length > 0) ||
    categorias.some(c => REC_CATEGORIA[c]?.alimentacion?.length > 0);

  res.coberturaEjercicio =
    condiciones.some(c => REC[c]?.ejercicio?.length > 0) ||
    categorias.some(c => REC_CATEGORIA[c]?.ejercicio?.length > 0) ||
    !!imc;

  // Deduplicación final de strings (por si el usuario tiene condiciones que
  // comparten algún tip genérico de ejercicio, ej. dos condiciones cardíacas)
  res.alimentacion = [...new Set(res.alimentacion)].filter(Boolean);
  res.ejercicio    = [...new Set(res.ejercicio)].filter(Boolean);

  return res;
}

module.exports = { generarRecomendaciones };