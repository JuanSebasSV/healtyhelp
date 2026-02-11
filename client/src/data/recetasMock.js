export const recetasMock = [
  {
    id: 1,
    nombre: "Ensalada César Saludable",
    desc: "Una versión ligera del clásico con pollo a la parrilla y aderezo bajo en grasa",
    cat: "almuerzo",
    img: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    puntos: 4.5,
    salud: ["bajo-grasa", "bajo-carbohidratos", "alto-proteina"],
    ingredientes: [
      "200g pechuga de pollo",
      "4 tazas lechuga romana",
      "2 cdas queso parmesano rallado",
      "1/4 taza croutones integrales",
      "Aderezo César light"
    ],
    pasos: [
      "Asar el pollo a la parrilla hasta que esté cocido",
      "Cortar la lechuga en trozos medianos",
      "Cortar el pollo en tiras",
      "Mezclar todos los ingredientes",
      "Agregar el aderezo y servir inmediatamente"
    ],
    nutri: {
      cal: 320,
      carb: 12,
      gras: 14,
      prot: 38,
      fiber: 3,
      sodio: 580,
      colesterol: 85
    },
    comentarios: [
      { usuario: "María G.", texto: "¡Deliciosa y muy fácil de preparar!" },
      { usuario: "Carlos R.", texto: "Perfecta para el almuerzo, me mantiene satisfecho" }
    ]
  },
  {
    id: 2,
    nombre: "Avena con Frutas",
    desc: "Desayuno nutritivo con avena, frutas frescas y nueces",
    cat: "desayuno",
    img: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400",
    puntos: 4.8,
    salud: ["vegano", "bajo-sodio", "sin-azucar", "alto-fibra"],
    ingredientes: [
      "1/2 taza avena integral",
      "1 taza leche de almendras",
      "1/2 plátano en rodajas",
      "1/4 taza arándanos",
      "1 cda nueces picadas",
      "Canela al gusto"
    ],
    pasos: [
      "Cocinar la avena con la leche de almendras",
      "Cuando esté cremosa, retirar del fuego",
      "Servir en un bowl",
      "Decorar con frutas y nueces",
      "Espolvorear canela al gusto"
    ],
    nutri: {
      cal: 285,
      carb: 45,
      gras: 8,
      prot: 9,
      fiber: 8,
      sodio: 120,
      colesterol: 0
    },
    comentarios: [
      { usuario: "Ana L.", texto: "Mi desayuno favorito, me da energía todo el día" },
      { usuario: "Pedro M.", texto: "Perfecta para diabéticos como yo" }
    ]
  },
  {
    id: 3,
    nombre: "Salmón a la Parrilla con Verduras",
    desc: "Filete de salmón con vegetales asados al horno",
    cat: "cena",
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    puntos: 4.9,
    salud: ["keto", "paleo", "bajo-carbohidratos", "sin-gluten"],
    ingredientes: [
      "200g filete de salmón",
      "1 taza brócoli",
      "1 taza zanahorias baby",
      "2 cdas aceite de oliva",
      "Limón y hierbas al gusto"
    ],
    pasos: [
      "Precalentar el horno a 200°C",
      "Sazonar el salmón con sal, pimienta y limón",
      "Colocar las verduras en una bandeja con aceite de oliva",
      "Hornear las verduras 15 minutos",
      "Agregar el salmón y hornear 12 minutos más"
    ],
    nutri: {
      cal: 420,
      carb: 18,
      gras: 24,
      prot: 36,
      fiber: 5,
      sodio: 380,
      colesterol: 75
    },
    comentarios: [
      { usuario: "Laura S.", texto: "Perfecta para mi dieta keto" },
      { usuario: "Roberto F.", texto: "El salmón quedó jugoso y delicioso" }
    ]
  },
  {
    id: 4,
    nombre: "Smoothie Verde Detox",
    desc: "Batido nutritivo con espinaca, manzana verde y jengibre",
    cat: "desayuno",
    img: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400",
    puntos: 4.6,
    salud: ["vegano", "sin-gluten", "bajo-calorias", "detox"],
    ingredientes: [
      "2 tazas espinaca fresca",
      "1 manzana verde",
      "1/2 pepino",
      "1 trozo jengibre (2cm)",
      "1 taza agua de coco",
      "Jugo de 1/2 limón"
    ],
    pasos: [
      "Lavar bien todos los ingredientes",
      "Cortar en trozos la manzana y pepino",
      "Agregar todo a la licuadora",
      "Licuar hasta obtener textura suave",
      "Servir inmediatamente con hielo"
    ],
    nutri: {
      cal: 145,
      carb: 32,
      gras: 1,
      prot: 3,
      fiber: 6,
      sodio: 85,
      colesterol: 0
    },
    comentarios: [
      { usuario: "Sofía T.", texto: "Increíble para empezar el día con energía" },
      { usuario: "Diego P.", texto: "No sabía que lo verde podía saber tan bien" }
    ]
  },
  {
    id: 5,
    nombre: "Tacos de Pescado",
    desc: "Tacos ligeros con pescado blanco, col morada y salsa de yogurt",
    cat: "almuerzo",
    img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400",
    puntos: 4.7,
    salud: ["bajo-grasa", "alto-proteina", "mediterranea"],
    ingredientes: [
      "300g pescado blanco (tilapia o mero)",
      "4 tortillas de maíz",
      "1 taza col morada rallada",
      "1/2 taza yogurt griego",
      "1 aguacate en rodajas",
      "Cilantro y limón"
    ],
    pasos: [
      "Sazonar el pescado con especias",
      "Asar el pescado en sartén hasta dorar",
      "Preparar salsa mezclando yogurt con limón",
      "Calentar las tortillas",
      "Armar los tacos con todos los ingredientes"
    ],
    nutri: {
      cal: 380,
      carb: 35,
      gras: 12,
      prot: 32,
      fiber: 7,
      sodio: 420,
      colesterol: 65
    },
    comentarios: [
      { usuario: "Miguel A.", texto: "Los mejores tacos saludables que he probado" },
      { usuario: "Carmen V.", texto: "La salsa de yogurt es el secreto" }
    ]
  },
  {
    id: 6,
    nombre: "Brownies de Chocolate Negro",
    desc: "Brownies sin azúcar refinada, endulzados con dátiles",
    cat: "postres-snacks",
    img: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400",
    puntos: 4.4,
    salud: ["sin-azucar", "vegetariano", "sin-gluten"],
    ingredientes: [
      "1 taza dátiles sin hueso",
      "1/2 taza cacao en polvo",
      "2 huevos",
      "1/4 taza aceite de coco",
      "1/2 taza harina de almendras",
      "1 cdta extracto de vainilla"
    ],
    pasos: [
      "Remojar los dátiles en agua caliente 10 minutos",
      "Licuar dátiles con huevos, aceite y vainilla",
      "Mezclar con cacao y harina de almendras",
      "Verter en molde engrasado",
      "Hornear a 180°C por 25 minutos"
    ],
    nutri: {
      cal: 195,
      carb: 22,
      gras: 11,
      prot: 5,
      fiber: 4,
      sodio: 25,
      colesterol: 40
    },
    comentarios: [
      { usuario: "Patricia H.", texto: "No puedo creer que no lleven azúcar" },
      { usuario: "Andrés K.", texto: "Perfectos para mi dieta sin gluten" }
    ]
  }
];