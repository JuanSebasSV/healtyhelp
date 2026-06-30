
// Cada entrada lista todas las formas en que puede aparecer un mismo ingrediente.

const SINONIMOS = [
    // Frutas
    ['banano', 'banana', 'platano', 'platano maduro', 'guineo'],
    ['piña', 'ananas', 'anana', 'pina'],
    ['fresa', 'frutilla', 'strawberry'],
    ['mora', 'blackberry', 'zarzamora'],
    ['maracuya', 'passion fruit', 'fruta de la pasion', 'parcha'],
    ['lulo', 'naranjilla'],
    ['guayaba', 'guava'],
    ['papaya', 'lechosa', 'mamao', 'fruta bomba'],
    ['mango', 'manga'],
    ['aguacate', 'avocado', 'palta'],
    ['limon', 'lima', 'limon tahiti', 'limon sutil'],
    ['naranja', 'china', 'mandarina'],
    ['tomate de arbol', 'tamarillo'],
    ['uchuva', 'uvilla', 'cape gooseberry', 'physalis'],
    ['curuba', 'taxo', 'banana passion fruit'],
    ['pitahaya', 'dragon fruit'],
    ['ciruela', 'plum', 'claudia'],
    ['durazno', 'melocoton', 'peach'],
    ['cereza', 'cherry'],
    ['uva', 'grape', 'uvas'],
    ['coco', 'coco rallado', 'leche de coco', 'crema de coco', 'aceite de coco'],
    ['sandia', 'watermelon', 'patilla'],
    ['melon', 'cantalupo'],
    ['higo', 'breva', 'fig'],
  
    // Verduras y hortalizas
    ['apio', 'celery'],
    ['zanahoria', 'carrot'],
    ['brocoli', 'brocoli'],
    ['coliflor', 'cauliflower'],
    ['espinaca', 'spinach'],
    ['lechuga', 'lettuce'],
    ['pepino', 'pepino cohombro', 'cucumber'],
    ['calabacin', 'zucchini', 'zapallito', 'calabacita'],
    ['berenjena', 'eggplant', 'aubergine'],
    ['pimiento', 'pimenton', 'capsicum', 'chile dulce', 'aji dulce'],
    ['cebolla', 'cebolla de rama', 'cebolla cabezona', 'cebolla blanca', 'cebolla morada'],
    ['cebolla larga', 'cebolla de verdeo', 'cebolleta', 'cebolla china'],
    ['ajo', 'garlic'],
    ['tomate', 'jitomate', 'tomato'],
    ['papa', 'patata', 'potato'],
    ['yuca', 'mandioca', 'cassava', 'tapioca'],
    ['platano verde', 'platano', 'toston'],
    ['ñame', 'name', 'yam'],
    ['arracacha', 'apio criollo', 'arracacia'],
    ['mazorca', 'choclo', 'elote', 'maiz tierno', 'corn'],
    ['habichuela', 'vainita', 'ejote', 'green bean'],
    ['arveja', 'guisante', 'chicharo', 'pea'],
    ['garbanzo', 'chickpea'],
    ['lenteja', 'lentil'],
    ['frijol', 'frejol', 'poroto', 'judias', 'bean', 'frijoles'],
    ['remolacha', 'betabel', 'beet', 'betarraga'],
    ['nabo', 'turnip'],
    ['rabano', 'radish'],
    ['acelga', 'swiss chard'],
    ['repollo', 'col', 'cabbage'],
    ['col morada', 'repollo morado', 'red cabbage'],
    ['alcachofa', 'artichoke'],
    ['esparragos', 'asparagus'],
    ['champiñon', 'champignon', 'hongo', 'seta', 'mushroom'],
    ['ahuyama', 'calabaza', 'auyama', 'zapallo', 'pumpkin', 'squash'],
  
    // Proteínas animales
    ['pollo', 'chicken', 'pechuga', 'muslo de pollo', 'contramuslo'],
    ['res', 'carne de res', 'carne molida', 'beef', 'bistec', 'lomo'],
    ['cerdo', 'pork', 'carne de cerdo', 'tocino', 'bacon', 'pernil'],
    ['salmon', 'salmón'],
    ['atun', 'tuna'],
    ['tilapia', 'mojarra'],
    ['sardina', 'sardine'],
    ['camaron', 'gambas', 'shrimp', 'langostino'],
    ['pulpo', 'octopus'],
    ['calamar', 'squid'],
    ['mariscos', 'seafood', 'frutos del mar'],
    ['huevo', 'egg', 'clara de huevo', 'yema'],
  
    // Lácteos
    ['leche', 'milk', 'leche entera', 'leche descremada'],
    ['queso', 'cheese', 'queso blanco', 'queso campesino', 'queso mozarela', 'mozzarella'],
    ['yogur', 'yogurt', 'yoghurt'],
    ['crema', 'crema de leche', 'nata', 'cream', 'heavy cream'],
    ['mantequilla', 'butter', 'margarina'],
    ['leche condensada', 'condensed milk'],
    ['lactosa', 'lactose'],
  
    // Cereales y harinas
    ['trigo', 'wheat', 'harina de trigo', 'gluten'],
    ['avena', 'oats', 'oatmeal'],
    ['arroz', 'rice', 'harina de arroz'],
    ['maiz', 'corn', 'harina de maiz', 'arepas', 'mazamorra'],
    ['centeno', 'rye'],
    ['cebada', 'barley'],
    ['quinoa', 'quinua'],
    ['amaranto', 'amaranth'],
    ['pan', 'bread', 'pan integral', 'pan blanco', 'pan de molde'],
    ['pasta', 'fideos', 'espagueti', 'macarrones', 'noodles'],
  
    // Frutos secos y semillas
    ['mani', 'cacahuate', 'cacahuete', 'peanut', 'mantequilla de mani'],
    ['almendra', 'almond'],
    ['nuez', 'walnut', 'nueces'],
    ['anacardo', 'marañon', 'cashew'],
    ['pistacho', 'pistachio'],
    ['avellana', 'hazelnut'],
    ['semilla de girasol', 'sunflower seed'],
    ['semilla de chia', 'chia'],
    ['linaza', 'flaxseed', 'semilla de lino'],
    ['sesamo', 'ajonjoli', 'tahini', 'sesame'],
    ['pine nut', 'piñon'],
  
    // Endulzantes
    ['azucar', 'sugar', 'azucar blanca', 'azucar morena', 'panela', 'piloncillo'],
    ['miel', 'honey', 'miel de abeja'],
    ['stevia', 'estevia'],
    ['agave', 'miel de agave'],
  
    // Aceites y grasas
    ['aceite de oliva', 'olive oil'],
    ['aceite vegetal', 'aceite de girasol', 'aceite de canola', 'aceite de maiz'],
  
    // Salsas y condimentos
    ['salsa de soja', 'soya', 'soja', 'soy sauce'],
    ['mostaza', 'mustard'],
    ['mayonesa', 'mayonnaise'],
    ['ketchup', 'salsa de tomate'],
  
    // Especias y hierbas
    ['cilantro', 'coriander'],
    ['perejil', 'parsley'],
    ['albahaca', 'basil'],
    ['oregano', 'oregano'],
    ['curcuma', 'turmeric'],
    ['jengibre', 'ginger'],
    ['canela', 'cinnamon'],
    ['comino', 'cumin'],
    ['pimienta', 'pepper', 'pimienta negra'],
  ];
  
  // Construye un mapa de búsqueda rápida:
  // { 'banano' -> ['banano','banana','platano',...], 'banana' -> [...mismos], etc. }
  const MAPA_SINONIMOS = new Map();
  
  for (const grupo of SINONIMOS) {
    for (const palabra of grupo) {
      MAPA_SINONIMOS.set(palabra, grupo);
    }
  }
  
  /**
   * Dado un término de alergia, devuelve todos sus sinónimos (incluido él mismo).
   * Normaliza el texto antes de buscar.
   */
  export const obtenerSinonimos = (termino) => {
    const normalizado = termino
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  
    return MAPA_SINONIMOS.get(normalizado) ?? [normalizado];
  };
  
  /**
   * Dado el texto completo de una receta y una lista de alergias,
   * devuelve true si la receta NO contiene ningún alérgeno.
   */
  export const recetaEsSegura = (textoReceta, alergias) => {
    const textoNorm = textoReceta
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  
    for (const alergia of alergias) {
      const sinonimos = obtenerSinonimos(alergia);
      for (const sin of sinonimos) {
        if (textoNorm.includes(sin)) return false;
      }
    }
    return true;
  };