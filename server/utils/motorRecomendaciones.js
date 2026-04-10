/**
 * motorRecomendaciones.js
 * Motor de reglas local para generar recomendaciones nutricionales personalizadas.
 * No depende de ninguna IA externa — toda la lógica está definida aquí.
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

const CALORIAS_BASE = {
  hombre: { sedentario: 2000, moderado: 2400, activo: 2800 },
  mujer:  { sedentario: 1700, moderado: 2000, activo: 2300 },
};

// Rangos de macros recomendados (% de calorías)
const MACROS_RANGO = {
  proteinas:     { min: 0.10, max: 0.35 }, // 10–35%
  carbohidratos: { min: 0.45, max: 0.65 }, // 45–65%
  grasas:        { min: 0.20, max: 0.35 }, // 20–35%
};

// ─── Utilidades ───────────────────────────────────────────────────────────────

/**
 * Calcula el IMC y lo clasifica.
 */
function calcularIMC(peso, altura) {
  if (!peso || !altura) return null;
  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);
  let categoria;
  if (imc < 18.5)      categoria = 'bajo_peso';
  else if (imc < 25)   categoria = 'normal';
  else if (imc < 30)   categoria = 'sobrepeso';
  else                 categoria = 'obesidad';
  return { valor: Math.round(imc * 10) / 10, categoria };
}

/**
 * Calcula el metabolismo basal (Mifflin-St Jeor).
 * Asume actividad moderada por defecto.
 */
function calcularMetabolismoBasal(peso, altura, edad) {
  if (!peso || !altura || !edad) return null;
  // Fórmula neutral (promedio hombre/mujer sin saber el sexo)
  const tmb = 10 * peso + 6.25 * altura - 5 * edad;
  return Math.round(tmb * 1.55); // factor actividad moderada
}

/**
 * Calcula el promedio de un campo nutricional a partir de los consumos.
 * @param {Array} consumos - lista de consumos del usuario
 * @param {string} campo   - 'cal', 'prot', 'carb', 'grasas', 'sodio', 'fibra', 'azucar'
 */
function promedioNutri(consumos, campo) {
  if (!consumos.length) return 0;
  const fechas = [...new Set(consumos.map(c => c.fechaBogota))];
  const totalPorDia = fechas.map(fecha => {
    const delDia = consumos.filter(c => c.fechaBogota === fecha);
    return delDia.reduce((acc, c) => acc + (c.nutri?.[campo] || 0), 0);
  });
  const suma = totalPorDia.reduce((a, b) => a + b, 0);
  return Math.round(suma / fechas.length);
}

/**
 * Detecta qué tipos de comida (desayuno/almuerzo/cena) se saltaron más.
 */
function detectarComidasSaltadas(consumos) {
  const fechas = [...new Set(consumos.map(c => c.fechaBogota))];
  if (fechas.length < 3) return []; // no hay suficiente historial

  const tipos = ['desayuno', 'almuerzo', 'cena'];
  const saltadas = [];

  tipos.forEach(tipo => {
    const diasConTipo = fechas.filter(f =>
      consumos.some(c => c.fechaBogota === f && c.tipo === tipo)
    ).length;
    const porcentaje = diasConTipo / fechas.length;
    if (porcentaje < 0.5) saltadas.push({ tipo, porcentaje: Math.round(porcentaje * 100) });
  });

  return saltadas;
}

// ─── Recomendaciones por condición ───────────────────────────────────────────

const RECOMENDACIONES_CONDICION = {
  diabetes: {
    alimentacion: [
      'Prioriza alimentos con índice glucémico bajo: avena, lentejas, vegetales sin almidón.',
      'Distribuye los carbohidratos de forma equitativa en cada comida para evitar picos de glucosa.',
      'Evita bebidas azucaradas, jugos de caja y postres con azúcar refinada.',
      'Incluye fibra en cada comida (fríjoles, brócoli, manzana con cáscara) para ralentizar la absorción de glucosa.',
    ],
    ejercicio: [
      'Caminar 30 minutos después de las comidas principales ayuda a reducir la glucosa postprandial.',
      'El ejercicio de resistencia moderada (bandas elásticas, mancuernas ligeras) mejora la sensibilidad a la insulina.',
      'Evita el ejercicio extenuante en ayunas — siempre ten a mano un snack en caso de hipoglucemia.',
    ],
    alimentos_limitar: ['azúcar blanca', 'arroz blanco en exceso', 'pan blanco', 'papas fritas', 'bebidas gaseosas'],
  },

  hipertension: {
    alimentacion: [
      'Reduce el sodio a menos de 1.500 mg/día: evita alimentos procesados, embutidos y sopas enlatadas.',
      'La dieta DASH es muy efectiva: más frutas, verduras, lácteos bajos en grasa y granos enteros.',
      'El potasio contrarresta el sodio — banano, espinaca, fríjol y aguacate son tus aliados.',
      'Modera el consumo de alcohol y cafeína, que pueden elevar la presión.',
    ],
    ejercicio: [
      'El ejercicio aeróbico regular (caminar, nadar, bicicleta) puede reducir la presión sistólica hasta 10 mmHg.',
      'Evita ejercicios isométricos intensos (plancha prolongada, levantamiento pesado) que elevan la presión bruscamente.',
      'Apunta a 150 minutos semanales de actividad moderada dividida en sesiones de 30 minutos.',
    ],
    alimentos_limitar: ['sal de mesa', 'embutidos', 'enlatados', 'quesos muy salados', 'mariscos en conserva'],
  },

  celiaco: {
    alimentacion: [
      'Elimina completamente el gluten: trigo, cebada, centeno y productos derivados.',
      'Alternativas seguras: arroz, maíz, papa, quinua, yuca, plátano y legumbres.',
      'Lee siempre las etiquetas — el gluten se esconde en salsas, embutidos y aderezos.',
      'Asegúrate de consumir suficiente fibra ya que muchos productos sin gluten son bajos en ella.',
    ],
    ejercicio: [
      'No hay restricciones específicas — cualquier actividad física es beneficiosa.',
      'Si tienes déficit de vitaminas B12 o D (común en celíacos), consulta antes de entrenamientos intensos.',
    ],
    alimentos_limitar: ['pan de trigo', 'pasta regular', 'cervezas', 'avena sin certificar sin gluten', 'galletas convencionales'],
  },

  'intolerancia-lactosa': {
    alimentacion: [
      'Sustituye la leche por bebidas vegetales: de soya, almendra, avena o coco (verifica que estén enriquecidas con calcio).',
      'Los quesos curados (parmesano, manchego) tienen menos lactosa y suelen tolerarse mejor.',
      'El yogur con probióticos puede tolerarse mejor que la leche regular.',
      'Asegura tu ingesta de calcio con brócoli, col rizada, tofu y sardinas.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas — mantén cualquier rutina regular.',
      'Si buscas proteína post-entrenamiento, prefiere proteína de soya o de huevo sobre la de suero (whey).',
    ],
    alimentos_limitar: ['leche entera', 'crema de leche', 'helados cremosos', 'quesos frescos en exceso'],
  },

  vegano: {
    alimentacion: [
      'Combina proteínas vegetales para obtener todos los aminoácidos: arroz con fríjoles, pan con hummus.',
      'La vitamina B12 no se encuentra en plantas — considera un suplemento o alimentos fortificados.',
      'El hierro vegetal se absorbe mejor acompañado de vitamina C (espinaca con limón, lentejas con tomate).',
      'El omega-3 puede obtenerse de chía, linaza, nueces y aceite de cáñamo.',
    ],
    ejercicio: [
      'Una dieta vegana bien planificada soporta cualquier nivel de actividad física.',
      'Para musculación, asegura 1.6–2.2 g de proteína por kg de peso corporal (tofu, tempeh, legumbres, seitán).',
    ],
    alimentos_limitar: ['productos ultraprocesados "veganos"', 'exceso de aceites vegetales refinados'],
  },

  vegetariano: {
    alimentacion: [
      'Incluye huevos y lácteos si eres ovo-lacto-vegetariano para cubrir B12 y calcio fácilmente.',
      'Las legumbres (lentejas, garbanzos, fríjoles) son tu principal fuente de proteína.',
      'El zinc puede ser insuficiente — consúmelo con semillas de calabaza, nueces y legumbres.',
    ],
    ejercicio: [
      'No hay limitaciones físicas — la dieta vegetariana es compatible con alta actividad.',
      'Para recuperación muscular, combina proteína vegetal con carbohidratos complejos después del ejercicio.',
    ],
    alimentos_limitar: ['carnes y pescados', 'caldos con base de carne'],
  },

  'bajo-sodio': {
    alimentacion: [
      'Cocina en casa usando hierbas frescas, limón y especias en lugar de sal.',
      'Los alimentos procesados contienen hasta el 70% del sodio de la dieta diaria — léelas etiquetas.',
      'Enjuaga los enlatados (fríjoles, atún) bajo el grifo para reducir su sodio hasta en un 40%.',
    ],
    ejercicio: [
      'Si haces ejercicio intenso o sudas mucho, repone electrolitos con agua de coco o bebidas bajas en sodio.',
    ],
    alimentos_limitar: ['sal de mesa', 'salsas de soya', 'quesos procesados', 'papas fritas de paquete', 'sopas instantáneas'],
  },

  'bajo-carbohidratos': {
    alimentacion: [
      'Prioriza carbohidratos complejos de bajo índice glucémico: quinua, avena, batata.',
      'Aumenta proteínas magras y grasas saludables para compensar la energía.',
      'No elimines completamente los carbos — las frutas y verduras son esenciales aunque contengan carbohidratos.',
    ],
    ejercicio: [
      'Los primeros días con restricción de carbohidratos puede sentirse fatiga — es normal mientras el cuerpo adapta.',
      'Para ejercicio de alta intensidad (HIIT, pesas), consume una pequeña porción de carbohidratos antes.',
    ],
    alimentos_limitar: ['pan blanco', 'arroz blanco', 'azúcar', 'bebidas azucaradas', 'dulces y postres'],
  },

  keto: {
    alimentacion: [
      'Mantén la proporción: 70% grasas, 25% proteínas, 5% carbohidratos (menos de 50g/día).',
      'Prioriza grasas saludables: aguacate, aceite de oliva, nueces, mantequilla de ghee.',
      'Hidratación y electrolitos son críticos en keto — consume suficiente sodio, magnesio y potasio.',
      'La "gripe keto" (fatiga, dolores de cabeza) dura 1–2 semanas en la adaptación inicial.',
    ],
    ejercicio: [
      'El rendimiento en ejercicio anaeróbico (sprints, pesas pesadas) puede reducirse en las primeras semanas.',
      'El cardio de baja intensidad (caminar, trotar suave) funciona bien con keto una vez adaptado.',
    ],
    alimentos_limitar: ['frutas altas en azúcar (banano, mango, uva)', 'granos', 'legumbres', 'papa', 'yuca', 'azúcar'],
  },

  paleo: {
    alimentacion: [
      'Basa tu dieta en carnes magras, pescado, huevos, frutas, verduras, nueces y semillas.',
      'Elimina granos, legumbres, lácteos y alimentos procesados.',
      'El aguacate, aceite de oliva y nueces son tus principales fuentes de grasa saludable.',
    ],
    ejercicio: [
      'La dieta paleo con ejercicio funcional (levantamiento, carreras cortas) refleja el estilo de vida ancestral.',
      'Buena recuperación post-entrenamiento con proteína animal y carbohidratos de frutas y vegetales.',
    ],
    alimentos_limitar: ['granos y cereales', 'legumbres', 'lácteos', 'azúcar refinada', 'aceites vegetales procesados'],
  },

  'sin-frutos-secos': {
    alimentacion: [
      'Evita nueces, maní, almendras, avellanas, pistachos, anacardos y sus derivados (mantequillas, aceites).',
      'Lee siempre las etiquetas de chocolates, granolas, panes y ensaladas — suelen contener trazas.',
      'Las semillas (chía, girasol, calabaza) generalmente no generan reacción pero consulta con tu médico.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas — mantén tu rutina normal.',
    ],
    alimentos_limitar: ['nueces', 'maní', 'almendras', 'avellanas', 'pistachos', 'mantequilla de maní'],
  },

  'sin-mariscos': {
    alimentacion: [
      'Sustituye el omega-3 del pescado con chía, linaza, nueces y aguacate.',
      'El hierro y zinc que aportan los mariscos puedes obtenerlos de carnes rojas magras y legumbres.',
      'Revisa etiquetas de salsas, condimentos y sopas — a veces contienen extracto de mariscos.',
    ],
    ejercicio: [
      'No hay restricciones físicas específicas — mantén tu rutina normal.',
    ],
    alimentos_limitar: ['camarones', 'langosta', 'cangrejo', 'mejillones', 'pulpo', 'calamares'],
  },

  'bajo-grasa': {
    alimentacion: [
      'Elige métodos de cocción que no requieran grasa: vapor, horno, parrilla, hervido.',
      'Las grasas saludables son necesarias — no las elimines completamente: aguacate, aceite de oliva (con moderación).',
      'Los lácteos descremados, claras de huevo y carnes magras son tus mejores aliados.',
    ],
    ejercicio: [
      'El ejercicio cardiovascular potencia la pérdida de grasa corporal: nadar, trotar, bicicleta.',
      'Combina cardio con fuerza — el músculo quema más calorías en reposo.',
    ],
    alimentos_limitar: ['frituras', 'mantequilla', 'crema de leche', 'carnes muy grasosas', 'comida rápida'],
  },

  'sin-azucar': {
    alimentacion: [
      'Lee etiquetas buscando azúcar oculta: dextrosa, fructosa, jarabe de maíz, maltosa, sacarosa.',
      'Las frutas enteras son aceptables — su fibra ralentiza la absorción del azúcar natural.',
      'Endulzantes naturales como stevia o eritritol son alternativas sin impacto glucémico.',
    ],
    ejercicio: [
      'Sin azúcar de rápida absorción, enfócate en carbohidratos complejos antes del ejercicio para energía sostenida.',
    ],
    alimentos_limitar: ['refrescos', 'jugos de caja', 'dulces', 'chocolates con azúcar', 'salsas dulces', 'cereales azucarados'],
  },

  'colesterol-alto': {
    alimentacion: [
      'Reduce las grasas saturadas (carnes rojas grasas, mantequilla, queso entero) y elimina las trans (margarinas, snacks industriales).',
      'Aumenta fibra soluble: avena, manzana, naranja, fríjoles — reduce la absorción de colesterol.',
      'Los omega-3 del pescado azul (salmón, sardina, atún) elevan el colesterol "bueno" HDL.',
      'El aguacate y el aceite de oliva son aliados del perfil lipídico saludable.',
    ],
    ejercicio: [
      'El ejercicio aeróbico regular (30 min/día, 5 días/semana) puede elevar el HDL hasta un 10%.',
      'Caminar, nadar y andar en bicicleta son excelentes opciones accesibles.',
    ],
    alimentos_limitar: ['carnes procesadas', 'mantequilla', 'quesos enteros', 'frituras', 'productos de repostería industrial'],
  },

  'enfermedad-renal': {
    alimentacion: [
      'Controla el potasio: limita banano, naranja, papa, tomate, aguacate en etapas avanzadas.',
      'Reduce el fósforo: evita lácteos en exceso, nueces, legumbres y bebidas oscuras (cola).',
      'El sodio debe mantenerse bajo — cocina sin sal y evita alimentos procesados.',
      'Consulta con tu nefrólogo la cantidad de proteína adecuada para tu etapa renal.',
    ],
    ejercicio: [
      'El ejercicio moderado (caminar, yoga, bicicleta estática) es seguro y beneficioso.',
      'Evita ejercicio muy intenso que genere mucho catabolismo muscular — puede elevar creatinina.',
    ],
    alimentos_limitar: ['sal', 'alimentos ricos en potasio y fósforo según tu etapa', 'proteína en exceso'],
  },

  gastritis: {
    alimentacion: [
      'Come porciones pequeñas y frecuentes — 5 comidas al día en lugar de 3 grandes.',
      'Evita el estómago vacío por largos períodos; siempre desayuna.',
      'Prioriza alimentos suaves: avena, pollo hervido, arroz, papa, plátano maduro, zanahoria cocida.',
      'El jengibre y el aloe vera (sin gel de látex) pueden calmar la inflamación gástrica.',
    ],
    ejercicio: [
      'Espera al menos 1–2 horas después de comer para hacer ejercicio.',
      'El yoga y el pilates pueden reducir el estrés, que es un desencadenante frecuente de gastritis.',
      'Evita el ejercicio de alto impacto en momentos de crisis — prefiere caminatas suaves.',
    ],
    alimentos_limitar: ['café', 'alcohol', 'picante', 'cítricos en exceso', 'tomate crudo', 'alimentos muy grasosos', 'menta'],
  },

  'sindrome-intestino': {
    alimentacion: [
      'Considera una dieta baja en FODMAPs — reduce alimentos fermentables que irritan el intestino.',
      'Lleva un diario de alimentos para identificar tus desencadenantes personales.',
      'Come despacio, mastica bien y evita tragar aire (hablar mientras comes, chicles, sorbetes).',
      'La fibra soluble (avena, chía, zanahoria) suele tolerarse mejor que la insoluble (salvado de trigo).',
    ],
    ejercicio: [
      'El ejercicio regular reduce el estrés, que es uno de los principales factores del síndrome.',
      'Yoga, pilates y caminatas son especialmente recomendados.',
      'Evita el ejercicio intenso durante episodios agudos — puede empeorar los síntomas.',
    ],
    alimentos_limitar: ['cebolla cruda', 'ajo', 'manzana', 'pera', 'brócoli', 'legumbres', 'leche', 'trigo en grandes cantidades'],
  },
};

// ─── Recomendaciones de ejercicio por IMC ─────────────────────────────────────

const EJERCICIO_IMC = {
  bajo_peso: [
    'Enfócate en ejercicios de fuerza para ganar masa muscular: sentadillas, flexiones, pesas ligeras.',
    'Come una comida rica en proteínas y carbohidratos antes y después del entrenamiento.',
    'Evita el cardio excesivo que quema demasiadas calorías — prioriza el volumen muscular.',
  ],
  normal: [
    'Mantén una combinación de cardio (3 días/semana) y fuerza (2–3 días/semana).',
    'Varía las actividades para evitar el estancamiento: senderismo, natación, baile, ciclismo.',
    'El descanso es tan importante como el ejercicio — respeta al menos 1–2 días de recuperación.',
  ],
  sobrepeso: [
    'El cardio de bajo impacto es ideal para empezar: caminar, nadar, bicicleta, elíptica.',
    'Apunta a 200–300 minutos semanales de actividad moderada para pérdida de peso sostenida.',
    'Agrega ejercicios de fuerza 2 veces por semana — el músculo aumenta el metabolismo en reposo.',
    'Pequeños cambios diarios suman: usa las escaleras, camina 10 minutos después de comer.',
  ],
  obesidad: [
    'Consulta con tu médico antes de iniciar una rutina de ejercicio intensa.',
    'Comienza con caminatas de 10–15 minutos diarios e incrementa gradualmente.',
    'Los ejercicios en el agua reducen el impacto en las articulaciones y son muy efectivos.',
    'El ejercicio más importante es el que puedas hacer de forma constante — la consistencia supera la intensidad.',
  ],
};

// ─── Motor principal ──────────────────────────────────────────────────────────

/**
 * Genera recomendaciones personalizadas basadas en el perfil del usuario y sus consumos.
 *
 * @param {Object} usuario  - datos del usuario (age, weight, height, healthProfile)
 * @param {Array}  consumos - lista de consumos registrados
 * @returns {Object} recomendaciones estructuradas
 */
function generarRecomendaciones(usuario, consumos) {
  const { age, weight, height, healthProfile = {} } = usuario;
  const condiciones = [
    ...(healthProfile.condiciones || []),
    ...(healthProfile.alergias    || []),
    ...(healthProfile.preferencias || []),
  ];

  const resultado = {
    imc: null,
    caloriasObjetivo: null,
    alertas: [],
    alimentacion: [],
    ejercicio: [],
    comidasSaltadas: [],
    condicionesDetectadas: condiciones,
  };

  // ── 1. IMC y metabolismo ──
  const imc = calcularIMC(weight, height);
  const calObjetivo = calcularMetabolismoBasal(weight, height, age);

  if (imc) {
    resultado.imc = imc;
    const frases = {
      bajo_peso:  'Tu IMC indica bajo peso. Es importante aumentar tu ingesta calórica con alimentos nutritivos.',
      normal:     'Tu IMC está en rango saludable. ¡Sigue manteniendo tus hábitos!',
      sobrepeso:  'Tu IMC indica sobrepeso. Un déficit calórico moderado (300–500 kcal/día) junto con ejercicio es la estrategia más sostenible.',
      obesidad:   'Tu IMC indica obesidad. Te recomendamos trabajar con un profesional de salud para un plan personalizado.',
    };
    resultado.alertas.push({ tipo: 'imc', mensaje: frases[imc.categoria], nivel: imc.categoria === 'normal' ? 'ok' : 'atencion' });
  }

  if (calObjetivo) {
    resultado.caloriasObjetivo = calObjetivo;
  }

  // ── 2. Análisis de consumos ──
  if (consumos.length > 0) {
    const calPromedio    = promedioNutri(consumos, 'cal');
    const protPromedio   = promedioNutri(consumos, 'prot');
    const carbPromedio   = promedioNutri(consumos, 'carb');
    const grasaPromedio  = promedioNutri(consumos, 'grasas');
    const sodioPromedio  = promedioNutri(consumos, 'sodio');
    const fibraPromedio  = promedioNutri(consumos, 'fibra');

    resultado.nutriPromedio = { calPromedio, protPromedio, carbPromedio, grasaPromedio, sodioPromedio, fibraPromedio };

    // Calorías vs objetivo
    if (calObjetivo && calPromedio > 0) {
      const diff = calPromedio - calObjetivo;
      if (diff > 300) {
        resultado.alertas.push({
          tipo: 'calorias_exceso',
          mensaje: `Estás consumiendo en promedio ${diff} kcal por encima de tu objetivo diario (${calObjetivo} kcal). Considera reducir porciones o aumentar la actividad física.`,
          nivel: 'advertencia',
        });
      } else if (diff < -400) {
        resultado.alertas.push({
          tipo: 'calorias_deficit',
          mensaje: `Tu ingesta promedio (${calPromedio} kcal) está muy por debajo de tu objetivo (${calObjetivo} kcal). Un déficit muy alto puede ralentizar el metabolismo.`,
          nivel: 'advertencia',
        });
      } else {
        resultado.alertas.push({
          tipo: 'calorias_ok',
          mensaje: `Tu ingesta calórica promedio (${calPromedio} kcal) está cerca de tu objetivo (${calObjetivo} kcal). ¡Buen trabajo!`,
          nivel: 'ok',
        });
      }
    }

    // Sodio
    if (sodioPromedio > 2300) {
      resultado.alertas.push({
        tipo: 'sodio_alto',
        mensaje: `Tu consumo promedio de sodio (${sodioPromedio} mg/día) supera el límite recomendado (2.300 mg). Reduce alimentos procesados y la sal en la cocina.`,
        nivel: 'advertencia',
      });
    }

    // Fibra
    if (fibraPromedio > 0 && fibraPromedio < 20) {
      resultado.alimentacion.push('Tu consumo de fibra parece bajo. Agrega más legumbres, frutas con cáscara, verduras y cereales integrales a tu dieta.');
    }

    // Proteínas (mínimo 0.8g por kg de peso)
    if (weight && protPromedio > 0) {
      const minProt = weight * 0.8;
      if (protPromedio < minProt) {
        resultado.alimentacion.push(`Tu consumo de proteína (${protPromedio}g/día) está por debajo del mínimo recomendado (${Math.round(minProt)}g/día). Incluye más huevos, legumbres, carnes magras o lácteos.`);
      }
    }

    // Comidas saltadas
    const saltadas = detectarComidasSaltadas(consumos);
    saltadas.forEach(({ tipo, porcentaje }) => {
      resultado.comidasSaltadas.push({
        tipo,
        mensaje: `Registras ${tipo} solo el ${porcentaje}% de los días. Saltarte el ${tipo} puede afectar tu energía y metabolismo.`,
      });
    });
  } else {
    resultado.alertas.push({
      tipo: 'sin_datos',
      mensaje: 'Aún no tienes consumos registrados. Empieza a registrar tus comidas para recibir recomendaciones personalizadas.',
      nivel: 'info',
    });
  }

  // ── 3. Recomendaciones por condición de salud ──
  condiciones.forEach(condicion => {
    const data = RECOMENDACIONES_CONDICION[condicion];
    if (!data) return;

    if (data.alimentacion?.length) {
      resultado.alimentacion.push(...data.alimentacion);
    }
    if (data.ejercicio?.length) {
      resultado.ejercicio.push(...data.ejercicio);
    }
    if (data.alimentos_limitar?.length) {
      resultado.alertas.push({
        tipo: `limitar_${condicion}`,
        mensaje: `Para tu condición (${condicion.replace(/-/g, ' ')}), limita: ${data.alimentos_limitar.join(', ')}.`,
        nivel: 'info',
      });
    }
  });

  // ── 4. Ejercicio por IMC (solo si hay IMC calculado) ──
  if (imc && resultado.ejercicio.length === 0) {
    resultado.ejercicio.push(...(EJERCICIO_IMC[imc.categoria] || []));
    resultado.ejercicioFuenteIMC = true;
  } else if (imc && resultado.ejercicio.length < 2) {
    resultado.ejercicio.unshift(EJERCICIO_IMC[imc.categoria]?.[0] || '');
  }

  // ── 5. Marcar cobertura real por sección ──
  // "cobertura real" = el contenido proviene de una condición de salud conocida
  // o de datos concretos del usuario (IMC, consumos), no de un fallback genérico.
  resultado.coberturaAlimentacion = condiciones.some(
    c => RECOMENDACIONES_CONDICION[c]?.alimentacion?.length > 0
  );
  resultado.coberturaEjercicio =
    condiciones.some(c => RECOMENDACIONES_CONDICION[c]?.ejercicio?.length > 0) ||
    !!imc; // el IMC sí provee consejos de ejercicio reales

  // Eliminar duplicados y vacíos
  resultado.alimentacion = [...new Set(resultado.alimentacion)].filter(Boolean);
  resultado.ejercicio    = [...new Set(resultado.ejercicio)].filter(Boolean);

  return resultado;
}

module.exports = { generarRecomendaciones };
