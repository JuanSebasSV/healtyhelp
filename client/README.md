Documentación Proyecto Healthy Help
ARCHIVO 1: App.jsx
________________________________________
IMPORTACIONES INICIALES
import { useState, useEffect } from 'react'
import './App.css'
•	useState: Es una herramienta de React que permite crear variables que cuando cambian, actualizan automáticamente lo que se ve en pantalla
•	useEffect: Es una herramienta que ejecuta código cuando algo específico cambia en la aplicación
•	import './App.css': Trae los estilos visuales desde el archivo CSS
________________________________________
COMPONENTES (Piezas Reutilizables de la Interfaz)
1. Componente Nav (Barra de Navegación)
const Nav = ({ cambiarVista, usuarioActivo, cerrarSesion, abrirMenu, menuAbierto, modoOscuro, toggleModoOscuro })
Parámetros que recibe:
•	cambiarVista: Función para cambiar entre diferentes páginas (inicio, historial, favoritos, etc.)
•	usuarioActivo: Información del usuario que inició sesión (o null si no hay nadie)
•	cerrarSesion: Función para cerrar la sesión del usuario
•	abrirMenu: Función para abrir/cerrar el menú en móviles
•	menuAbierto: Variable que indica si el menú está abierto (true) o cerrado (false)
•	modoOscuro: Variable que indica si está activado el modo oscuro (true) o modo claro (false)
•	toggleModoOscuro: Función para cambiar entre modo oscuro y claro
Elementos del componente:
•	nav className="nav": Contenedor principal de la navegación
•	nav-logo: Logo y nombre de la aplicación (clickeable para volver a inicio)
•	nav-hamburguesa: Botón de menú que solo aparece en móviles (3 líneas horizontales)
•	nav-menu: Lista de enlaces de navegación (Inicio, Historial, Favoritos, Contacto)
•	btn-tema: Botón para cambiar entre modo claro/oscuro (muestra sol o luna según el modo)
________________________________________
2. Componente RobotIA (Asistente Virtual)
const RobotIA = ({ activo, toggleIA })
Parámetros:
•	activo: Indica si el chat está abierto (true) o cerrado (false)
•	toggleIA: Función para abrir/cerrar el chat
Estados internos (useState):
const [mensaje, setMensaje] = useState('');
const [chat, setChat] = useState([]);
•	mensaje: Guarda lo que el usuario está escribiendo actualmente
•	setMensaje: Función para actualizar el mensaje
•	chat: Array (lista) que guarda todos los mensajes de la conversación
•	setChat: Función para agregar nuevos mensajes al chat
Función principal:
const enviarMensaje = () => {
  if (!mensaje.trim()) return;
  // Agrega mensaje del usuario
  setChat([...chat, { tipo: 'usuario', texto: mensaje }]);
  
  // Simula respuesta de IA después de 500ms
  setTimeout(() => {
    setChat(prev => [...prev, { 
      tipo: 'ia', 
      texto: '¡Hola! Soy tu asistente culinario...' 
    }]);
  }, 500);
  
  setMensaje('');
}
•	if (!mensaje.trim()) return: Si el mensaje está vacío, no hace nada
•	...chat: Copia todos los mensajes anteriores
•	setTimeout: Espera medio segundo antes de mostrar la respuesta
•	prev: Representa el estado anterior del chat
________________________________________
3. Componente FondoAnimado
Este componente crea el fondo visual animado de la aplicación con ondas sinusoidales.
Elementos:
•	gradient-mesh: Capa de fondo con gradiente de colores
•	svg: Definiciones de efectos de brillo (glow)
•	onda-linea: Tres capas de ondas animadas con diferentes velocidades
Propósito: Crear un fondo atractivo y dinámico sin afectar el rendimiento.
________________________________________
4. Componente NutricionGrafico (Panel Nutricional)
const NutricionGrafico = ({ nutri, onModalChange })
Parámetros:
•	nutri: Objeto con toda la información nutricional de la receta
•	onModalChange: Función que notifica cuando se abre/cierra el modal detallado
Estado interno:
const [verDetalle, setVerDetalle] = useState(false);
•	verDetalle: Controla si el modal de información detallada está visible
Cálculos importantes:
const totalMacros = nutri.gras + nutri.carb + nutri.prot;
const porcGras = Math.round((nutri.gras / totalMacros) * 100);
•	totalMacros: Suma total de grasas, carbohidratos y proteínas
•	porcGras: Porcentaje que representan las grasas del total
•	Math.round: Redondea al número entero más cercano
Funciones para el gráfico circular:
const crearArco = (startAngle, endAngle) => { ... }
const polarACartesiano = (centerX, centerY, radius, angleInDegrees) => { ... }
•	Estas funciones convierten ángulos en coordenadas para dibujar el gráfico de pastel
•	polarACartesiano: Convierte coordenadas polares (ángulo y radio) a coordenadas cartesianas (x, y)
Elementos visuales:
•	Gráfico circular (pie chart) que muestra distribución de macronutrientes
•	Tabla con totales vs objetivos nutricionales
•	Botón para ver información detallada
________________________________________
5. Componente ModalNutricionDetallada
const ModalNutricionDetallada = ({ nutri, cerrar })
useEffect importante:
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = 'unset';
  };
}, []);
•	Cuando se abre el modal: Deshabilita el scroll del body (overflow = 'hidden')
•	return () => {...}: Función de limpieza que se ejecuta cuando el modal se cierra
•	overflow = 'unset': Restaura el scroll normal
•	[]: Array vacío significa que solo se ejecuta al montar/desmontar el componente
Secciones del modal:
1.	Objetivos Nutricionales: Tabla con nutrientes principales
2.	Vitaminas y Minerales: Grid con micronutrientes y su % del valor diario
3.	Azúcares: Diferentes tipos de azúcares
4.	Grasas: Tipos de grasas (saturadas, monoinsaturadas, etc.)
5.	Ácidos Grasos: Omega-3, Omega-6, etc.
6.	Aminoácidos: Componentes de las proteínas
Cálculo de porcentajes:
{Math.round((nutri.calcio / 1000) * 100)}%
•	Divide el valor actual entre el valor diario recomendado
•	Multiplica por 100 para obtener porcentaje
•	Math.round redondea al entero más cercano
________________________________________
6. Componente TarjetaReceta
const TarjetaReceta = ({ receta, toggleFav, esFav })
Parámetros:
•	receta: Objeto con toda la información de la receta
•	toggleFav: Función para agregar/quitar de favoritos
•	esFav: Boolean que indica si la receta ya está en favoritos
Estado:
const [verDetalle, setVerDetalle] = useState(false);
•	Controla si el modal de detalle está abierto
Evento importante:
onClick={(e) => {
  e.stopPropagation();
  toggleFav(receta.id);
}}
•	e.stopPropagation(): Evita que el click se propague al contenedor padre
•	Esto permite que el botón de favoritos funcione sin abrir el detalle de la receta
________________________________________
7. Componente DetalleReceta
const DetalleReceta = ({ receta, cerrar })
Estado:
const [verNutriDetalle, setVerNutriDetalle] = useState(false);
•	Rastrea si el modal de nutrición detallada está abierto
•	Se usa para ocultar el botón de cerrar principal cuando el modal secundario está abierto
Estructura del modal:
•	modal-overlay: Fondo oscuro que cubre toda la pantalla
•	modal-contenedor-receta: Contenedor con dos columnas 
o	Columna izquierda: Imagen, descripción, ingredientes, pasos, comentarios
o	Columna derecha: Panel nutricional con gráfico
Evento de propagación:
<div className="modal-overlay" onClick={cerrar}>
  <div className="modal-contenedor-receta" onClick={(e) => e.stopPropagation()}>
•	Click en el overlay (fondo) cierra el modal
•	Click dentro del contenido NO cierra el modal (stopPropagation)
________________________________________
VISTAS PRINCIPALES
8. VistaLogin
const VistaLogin = ({ cambiarVista, iniciarSesion })
Estados:
const [email, setEmail] = useState('');
const [pass, setPass] = useState('');
Función de submit:
const manejarSubmit = () => {
  if (email && pass) {
    iniciarSesion({ email, nombre: 'Usuario' });
    cambiarVista('inicio');
  }
}
•	Verifica que email y contraseña no estén vacíos
•	Llama a la función para iniciar sesión
•	Cambia a la vista de inicio
Evento onKeyPress:
onKeyPress={(e) => e.key === 'Enter' && manejarSubmit()}
•	Si la tecla presionada es Enter, ejecuta el submit
•	&&: Operador lógico "Y" - ejecuta lo de la derecha solo si lo de la izquierda es verdadero
________________________________________
9. VistaRegistro
const [datos, setDatos] = useState({ 
  nombre: '', 
  email: '', 
  pass: '', 
  passConf: '' 
});
•	Guarda múltiples valores en un solo objeto
Actualización de objeto:
onChange={(e) => setDatos({...datos, nombre: e.target.value})}
•	{...datos}: Crea una copia del objeto datos
•	nombre: e.target.value: Actualiza solo el campo nombre
•	Esto es necesario porque en React no debes modificar el estado directamente
________________________________________
10. VistaInicio (La más compleja)
Estados:
const [filtrosActivos, setFiltrosActivos] = useState([]);
const [filtroAbierto, setFiltroAbierto] = useState(false);
Arrays de datos:
const categorias = [
  { id: 'todas', nombre: 'Todas', icono: '<svg>...</svg>' },
  // ...
];

const condicionesSalud = [
  { id: 'diabetes', nombre: 'Diabetes', icono: '<svg>...</svg>' },
  // ...
];
Función toggleFiltro:
const toggleFiltro = (filtroId) => {
  setFiltrosActivos(prev => 
    prev.includes(filtroId) 
      ? prev.filter(f => f !== filtroId)  // Si existe, lo quita
      : [...prev, filtroId]                // Si no existe, lo agrega
  );
};
•	prev.includes(filtroId): Verifica si el filtro ya está activo
•	filter(f => f !== filtroId): Crea un nuevo array sin ese filtro
•	[...prev, filtroId]: Crea un nuevo array con el filtro agregado
Filtrado de recetas:
const recetasFiltradas = recetas.filter(r => {
  const coincideCategoria = categoriaActiva === 'todas' || r.cat === categoriaActiva;
  
  if (filtrosActivos.length === 0) {
    return coincideCategoria;
  }
  
  const cumpleTodosFiltros = filtrosActivos.every(filtro =>
    r.salud.includes(filtro)
  );
  
  return coincideCategoria && cumpleTodosFiltros;
});
•	filter: Crea un nuevo array solo con elementos que cumplan la condición
•	every: Verifica que TODOS los filtros estén en la receta
•	includes: Verifica si un elemento está en un array
________________________________________
11. VistaHistorial
const [periodo, setPeriodo] = useState('hoy');
const historialRecetas = recetas.slice(0, 3);
•	slice(0, 3): Toma solo las primeras 3 recetas del array
•	periodo: Guarda qué periodo está seleccionado (hoy, semana, mes)
________________________________________
12. VistaFavoritos
const recetasFav = recetas.filter(r => favoritos.includes(r.id));
•	Filtra solo las recetas cuyo ID está en el array de favoritos
Renderizado condicional:
{recetasFav.length === 0 ? (
  <div className="vacio">...</div>
) : (
  <div className="grid">...</div>
)}
•	? :: Operador ternario (if-else en una línea)
•	Si no hay favoritos, muestra mensaje vacío
•	Si hay favoritos, muestra el grid
________________________________________
13. VistaContacto
const [datosForm, setDatosForm] = useState({
  nombre: '',
  email: '',
  asunto: '',
  mensaje: ''
});
Función enviar:
const enviarMensaje = () => {
  if (datosForm.nombre && datosForm.email && datosForm.mensaje) {
    alert('Mensaje enviado correctamente');
    setDatosForm({ nombre: '', email: '', asunto: '', mensaje: '' });
  }
}
•	Verifica que los campos obligatorios estén llenos
•	Muestra alerta de confirmación
•	Limpia el formulario
________________________________________
COMPONENTE PRINCIPAL APP
Estados principales:
const [vista, setVista] = useState('inicio');
•	Controla qué vista se muestra actualmente
const [usuario, setUsuario] = useState(null);
•	Guarda la información del usuario (null = no logueado)
const [favoritos, setFavoritos] = useState([]);
•	Array de IDs de recetas favoritas
const [categoriaActiva, setCategoriaActiva] = useState('todas');
•	Categoría seleccionada en el filtro
const [robotActivo, setRobotActivo] = useState(false);
•	Controla si el chat IA está abierto
const [menuAbierto, setMenuAbierto] = useState(false);
•	Controla si el menú móvil está abierto
Estado del modo oscuro con localStorage:
const [modoOscuro, setModoOscuro] = useState(() => {
  const guardado = localStorage.getItem('modoOscuro');
  if (guardado !== null) {
    return guardado === 'true';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
});
Explicación paso a paso:
1.	localStorage.getItem: Busca si hay una preferencia guardada
2.	guardado !== null: Si existe algo guardado
3.	guardado === 'true': Convierte el string a boolean
4.	window.matchMedia: Si no hay nada guardado, detecta la preferencia del sistema
5.	() => {...}: Función inicializadora que solo se ejecuta una vez
Función toggle:
const toggleModoOscuro = () => {
  setModoOscuro(prev => {
    const nuevo = !prev;
    localStorage.setItem('modoOscuro', nuevo);
    return nuevo;
  });
};
•	Invierte el valor actual
•	Guarda la nueva preferencia en localStorage
•	Retorna el nuevo valor
________________________________________
Array de recetas (23 recetas con toda su información)
Cada receta tiene esta estructura:
{
  id: 1,                    // Identificador único
  nombre: 'Nombre',         // Título
  desc: 'Descripción',      // Descripción corta
  img: 'url',              // URL de la imagen
  cat: 'almuerzo',         // Categoría
  salud: [],               // Array de condiciones de salud
  puntos: 4.8,             // Calificación
  ingredientes: [],        // Lista de ingredientes
  pasos: [],               // Pasos de preparación
  nutri: {...},            // Objeto con >60 valores nutricionales
  comentarios: []          // Array de comentarios de usuarios
}
________________________________________
Funciones principales de App:
const toggleFav = (id) => {
  setFavoritos(prev =>
    prev.includes(id) 
      ? prev.filter(f => f !== id)  // Quita de favoritos
      : [...prev, id]                // Agrega a favoritos
  );
};
const iniciarSesion = (datos) => {
  setUsuario(datos);
};
const cerrarSesion = () => {
  setUsuario(null);
  setVista('inicio');
};
________________________________________
Renderizado condicional de vistas:
{vista === 'login' && <VistaLogin ... />}
{vista === 'registro' && <VistaRegistro ... />}
{vista === 'recuperar' && <VistaRecuperar ... />}
{vista === 'inicio' && <VistaInicio ... />}
// etc...
•	&&: Solo renderiza si la condición es verdadera
•	Solo se muestra UNA vista a la vez
________________________________________
Renderizado condicional de vistas completo:
{vista === 'login' && <VistaLogin cambiarVista={(nuevaVista) => {
  setVista(nuevaVista);
  setMenuAbierto(false);
}} iniciarSesion={iniciarSesion} />}
•	Muestra el formulario de login
•	Cuando cambia de vista, cierra el menú móvil automáticamente
{vista === 'registro' && <VistaRegistro cambiarVista={(nuevaVista) => {
  setVista(nuevaVista);
  setMenuAbierto(false);
}} />}
•	Muestra el formulario de registro
•	También cierra el menú al cambiar de vista
{vista === 'recuperar' && <VistaRecuperar cambiarVista={(nuevaVista) => {
  setVista(nuevaVista);
  setMenuAbierto(false);
}} />}
•	Muestra el formulario de recuperación de contraseña
•	Cierra el menú móvil
{vista === 'inicio' && (
  <VistaInicio
    recetas={recetas}
    toggleFav={toggleFav}
    favoritos={favoritos}
    cambiarCategoria={setCategoriaActiva}
    categoriaActiva={categoriaActiva}
  />
)}
•	Muestra la página principal con todas las recetas
•	Pasa todas las funciones y datos necesarios
{vista === 'historial' && (
  <VistaHistorial 
    recetas={recetas} 
    toggleFav={toggleFav} 
    favoritos={favoritos} 
  />
)}
•	Muestra el historial de recetas vistas
{vista === 'favoritos' && (
  <VistaFavoritos 
    recetas={recetas} 
    toggleFav={toggleFav} 
    favoritos={favoritos} 
  />
)}
•	Muestra solo las recetas marcadas como favoritas
{vista === 'contacto' && <VistaContacto />}
•	Muestra la página de contacto con formulario e información
________________________________________
Componentes siempre visibles:
<RobotIA activo={robotActivo} toggleIA={() => setRobotActivo(!robotActivo)} />
•	El asistente IA está siempre disponible (botón flotante)
•	Se puede abrir/cerrar desde cualquier vista
<footer className="footer">
  <div className="footer-contenido">
    <div className="footer-seccion">
      <h3>Healthy Help</h3>
      <p>Tu compañero en el camino hacia una alimentación más saludable y balanceada.</p>
    </div>
    <div className="footer-seccion">
      <h4>Enlaces Rápidos</h4>
      <ul>
        <li onClick={() => setVista('inicio')}>Inicio</li>
        <li onClick={() => setVista('historial')}>Historial</li>
        <li onClick={() => setVista('favoritos')}>Favoritos</li>
      </ul>
    </div>
    <div className="footer-seccion">
      <h4>Contacto</h4>
      <p>Email: info@healthyhelp.com</p>
      <p>Teléfono: +1 (555) 123-4567</p>
    </div>
  </div>
  <div className="footer-copy">
    © 2024 Healthy Help. Todos los derechos reservados. | Powered by Readdy
  </div>
</footer>
•	Footer siempre visible en todas las vistas
•	Contiene información de la app, enlaces rápidos y datos de contacto
________________________________________
ARCHIVO 2: App.css
________________________________________
SECCIÓN 1: VARIABLES Y RESET
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
•	asterisco (*): Selecciona TODOS los elementos HTML
•	margin: 0: Elimina el espacio exterior de todos los elementos
•	padding: 0: Elimina el espacio interior de todos los elementos
•	box-sizing: border-box: Hace que el ancho y alto incluyan el padding y border (más predecible)
:root {
  --verde-bosque: #1a4d2e;
  --verde-hoja: #4f772d;
  --naranja: #f77f00;
  --blanco: #ffffff;
  --gris-claro: #f8f9fa;
  --gris-medio: #dee2e6;
  --gris-oscuro: #2d2d2d;
  --negro: #000000;
  --sombra: 0 4px 6px rgba(0, 0, 0, 0.1);
  --sombra-hover: 0 8px 16px rgba(0, 0, 0, 0.15);
  --transicion: all 0.3s ease;
}
•	:root: Selector que representa el elemento raíz del documento (el HTML completo)
•	--nombre: Variables CSS personalizadas (custom properties)
•	Se pueden reusar en todo el archivo escribiendo var(--nombre)
•	rgba(0, 0, 0, 0.1): Negro con 10% de opacidad (0.1 = transparencia)
•	all 0.3s ease: Anima TODAS las propiedades durante 0.3 segundos con aceleración suave
________________________________________
SECCIÓN 2: MODO OSCURO
.modo-oscuro {
  --verde-bosque: #2d5a3d;
  --verde-hoja: #6b9e4a;
  --naranja: #ff9a3c;
  --blanco: #1a1a1a;
  --gris-claro: #2d2d2d;
  --gris-medio: #404040;
  --gris-oscuro: #e0e0e0;
  --negro: #ffffff;
  --sombra: 0 4px 6px rgba(0, 0, 0, 0.4);
  --sombra-hover: 0 8px 16px rgba(0, 0, 0, 0.6);
}
•	Cuando la clase modo-oscuro está activa, REDEFINE las variables
•	Los colores se invierten: el blanco se vuelve oscuro, el negro se vuelve claro
•	Las sombras se hacen más intensas para contrastar con el fondo oscuro
.modo-oscuro body {
  background: transparent;
}
•	En modo oscuro, el body tiene fondo transparente para que se vea el fondo animado
.modo-oscuro .nav {
  background: rgba(26, 26, 26, 0.95);
}
•	La navegación en modo oscuro tiene fondo casi negro con 95% de opacidad
.modo-oscuro .filtro-salud,
.modo-oscuro .auth-card,
.modo-oscuro .tarjeta-receta,
.modo-oscuro .modal-contenido,
.modo-oscuro .contacto-form,
.modo-oscuro .info-item {
  background: rgba(45, 45, 45, 0.95);
  color: var(--gris-oscuro);
}
•	coma (,): Aplica los mismos estilos a MÚLTIPLES selectores
•	Todos estos elementos tendrán el mismo fondo gris oscuro en modo oscuro
.modo-oscuro .modal-nutri-detalle {
  background: rgba(45, 45, 45, 0.95);
}

.modo-oscuro .modal-nutri-detalle h2 {
  color: var(--verde-hoja);
}
•	El modal de nutrición tiene fondo oscuro
•	Sus títulos h2 usan el color verde-hoja
.modo-oscuro .nutri-panel {
  background: rgba(64, 64, 64, 0.5);
}
•	Panel nutricional con fondo gris más claro y 50% de transparencia
.modo-oscuro .hero {
  background: rgba(20, 20, 20, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}
•	backdrop-filter: Efecto de desenfoque en el contenido detrás del elemento
•	blur(20px): Desenfoca 20 píxeles
•	saturate(180%): Aumenta la saturación de color al 180%
•	-webkit-backdrop-filter: Versión para navegadores Safari/Chrome antiguos
•	border: Borde muy sutil blanco con 10% opacidad
.modo-oscuro .hero::before {
  opacity: 1;
  filter: brightness(0.5) contrast(1.1);
}
•	::before: Pseudoelemento que existe ANTES del contenido
•	brightness(0.5): Reduce el brillo a la mitad (oscurece)
•	contrast(1.1): Aumenta el contraste un 10%
.modo-oscuro .auth-card h2,
.modo-oscuro .modal-contenido h2,
.modo-oscuro .contacto-form h2,
.modo-oscuro .tarjeta-info h3 {
  color: var(--verde-hoja);
}
•	Todos los títulos h2 y h3 de estos elementos usan verde-hoja en modo oscuro
.modo-oscuro .cat-btn,
.modo-oscuro .filtro-card {
  background: rgba(64, 64, 64, 0.9);
  border-color: #505050;
  color: var(--gris-oscuro);
}
•	Botones de categoría y tarjetas de filtro con fondo gris oscuro
.modo-oscuro .cat-btn:hover,
.modo-oscuro .filtro-card:hover {
  border-color: var(--verde-hoja);
}
•	:hover: Se activa cuando el mouse pasa sobre el elemento
•	El borde cambia a verde-hoja al hacer hover
.modo-oscuro .cat-btn.activo {
  background: var(--naranja);
  color: var(--blanco);
  border-color: var(--naranja);
}
•	.activo: Clase que indica que el botón está seleccionado
•	Fondo naranja cuando está activo
.modo-oscuro .filtro-card.activo {
  background: var(--verde-hoja);
  border-color: var(--verde-hoja);
  color: var(--blanco);
}
•	Filtros activos usan verde-hoja en lugar de naranja
.modo-oscuro .filtro-header {
  background: linear-gradient(135deg, #1a2820, #2d5a3d);
}
•	linear-gradient: Degradado lineal de colores
•	135deg: Ángulo del degradado (diagonal de esquina inferior izquierda a superior derecha)
•	Va de un verde muy oscuro a verde bosque
.modo-oscuro .recetas-grid h2,
.modo-oscuro .vista-historial h1,
.modo-oscuro .vista-favoritos h1,
.modo-oscuro .vista-contacto h1,
.modo-oscuro .contacto-subtitulo {
  color: var(--gris-oscuro);
}
•	Todos los títulos principales de las vistas usan gris-oscuro (que en modo oscuro es claro)
.modo-oscuro .historial-item,
.modo-oscuro .robot-chat {
  background: rgba(45, 45, 45, 0.95);
}
•	Items del historial y el chat del robot tienen fondo gris oscuro
.modo-oscuro .historial-info h3,
.modo-oscuro .info-item h3 {
  color: var(--verde-hoja);
}
•	Títulos h3 dentro de historial e info usan verde-hoja
.modo-oscuro .robot-header {
  background: var(--verde-hoja);
}
•	Cabecera del robot IA con fondo verde-hoja
.modo-oscuro .robot-bienvenida,
.modo-oscuro .robot-mensaje.ia,
.modo-oscuro .nutri-item,
.modo-oscuro .comentario {
  background: rgba(64, 64, 64, 0.8);
  color: var(--gris-oscuro);
}
•	Mensajes de bienvenida, mensajes de IA, items nutricionales y comentarios con fondo gris medio
.modo-oscuro .robot-mensaje.usuario {
  background: var(--verde-hoja);
}
•	Los mensajes del usuario tienen fondo verde-hoja (diferente a los de la IA)
.modo-oscuro .auth-form input,
.modo-oscuro .contacto-form input,
.modo-oscuro .contacto-form textarea,
.modo-oscuro .robot-input input {
  background: rgba(64, 64, 64, 0.8);
  border-color: #505050;
  color: var(--gris-oscuro);
}
•	Todos los campos de entrada (input y textarea) tienen fondo gris oscuro
.modo-oscuro .auth-form input:focus,
.modo-oscuro .contacto-form input:focus,
.modo-oscuro .contacto-form textarea:focus {
  border-color: var(--verde-hoja);
}
•	:focus: Se activa cuando el usuario hace click en el campo
•	El borde cambia a verde-hoja cuando el campo está activo
.modo-oscuro .periodo-btns button {
  background: rgba(64, 64, 64, 0.95);
  color: var(--gris-oscuro);
}

.modo-oscuro .periodo-btns button:hover {
  background: var(--verde-hoja);
  color: var(--blanco);
}

.modo-oscuro .periodo-btns button.activo {
  background: var(--naranja);
  color: var(--blanco);
}
•	Botones de periodo (hoy, semana, mes): 
o	Estado normal: gris oscuro
o	Al pasar el mouse: verde-hoja
o	Cuando está activo: naranja
.modo-oscuro .footer {
  background: #1a1a1a;
}
•	Footer con fondo negro puro en modo oscuro
.modo-oscuro .modal-cerrar {
  background: rgba(64, 64, 64, 0.9);
  color: var(--gris-oscuro);
}

.modo-oscuro .modal-cerrar:hover {
  background: var(--naranja);
  color: var(--blanco);
}
•	Botón de cerrar modal: gris por defecto, naranja al hacer hover
.modo-oscuro .vacio {
  background: rgba(45, 45, 45, 0.95);
}

.modo-oscuro .vacio-icono {
  color: #606060;
}
•	Mensaje de "vacío" (sin favoritos) con fondo oscuro e icono gris medio
.modo-oscuro .tarjeta-puntuacion,
.modo-oscuro .modal-seccion h3 {
  color: var(--naranja);
}
•	Puntuaciones y títulos de secciones en naranja
.modo-oscuro .comentario strong {
  color: var(--verde-hoja);
}

.modo-oscuro .nutri-item strong {
  color: var(--verde-hoja);
}
•	Texto en negrita dentro de comentarios e items nutricionales usa verde-hoja
.modo-oscuro .modal-overlay {
  background: rgba(0, 0, 0, 0.9);
}
•	Fondo de modales más oscuro (90% de opacidad) para mejor contraste
________________________________________
SECCIÓN 3: BOTÓN DE TEMA (SOL/LUNA)
.btn-tema {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: var(--transicion);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}
•	rem: Unidad relativa al tamaño de fuente raíz (1rem = 16px por defecto)
•	border-radius: 50px: Bordes muy redondeados (botón ovalado)
•	cursor: pointer: Cambia el cursor a manita al pasar sobre el botón
•	display: flex: Activa flexbox para centrar contenido
•	align-items: center: Centra verticalmente
•	justify-content: center: Centra horizontalmente
.btn-tema svg {
  stroke: var(--blanco);
  transition: var(--transicion);
}
•	stroke: Color del trazo/borde del SVG (icono)
•	El icono es blanco por defecto
.modo-oscuro .btn-tema svg {
  stroke: var(--naranja);
}
•	En modo oscuro, el icono cambia a naranja
.btn-tema:hover {
  transform: scale(1.1) rotate(20deg);
  background: rgba(255, 255, 255, 0.2);
}
•	transform: Aplica transformaciones visuales
•	scale(1.1): Agranda el botón a 110% de su tamaño
•	rotate(20deg): Rota 20 grados en sentido horario
•	El fondo se hace un poco más visible al hacer hover
.modo-oscuro .btn-tema {
  background: rgba(0, 0, 0, 0.2);
}

.modo-oscuro .btn-tema:hover {
  background: rgba(0, 0, 0, 0.3);
}
•	En modo oscuro, el fondo es negro en lugar de blanco
________________________________________
SECCIÓN 4: ESTILOS DEL BODY Y APP
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--gris-oscuro);
  background: transparent;
  position: relative;
  overflow-x: hidden;
  line-height: 1.6;
  overflow-x: hidden;
}
•	font-family: Lista de fuentes en orden de preferencia 
o	Intenta usar 'Inter'
o	Si no está, usa la fuente del sistema (-apple-system para Mac)
o	Y así sucesivamente hasta llegar a sans-serif genérico
•	overflow-x: hidden: Esconde el scroll horizontal (aparece dos veces, podría quitarse una)
•	line-height: 1.6: Altura de línea = 160% del tamaño de fuente (más legible)
•	position: relative: Permite posicionar elementos hijos de forma absoluta
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
•	min-height: 100vh: Altura mínima = 100% de la altura de la ventana (vh = viewport height)
•	flex-direction: column: Los elementos se apilan verticalmente
•	Esto hace que el footer siempre esté al fondo aunque haya poco contenido
________________________________________
SECCIÓN 5: NAVEGACIÓN
.nav {
  background: rgba(26, 77, 46, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--sombra);
}
•	position: sticky: Se comporta normal hasta que llegas a su posición, luego se "pega"
•	top: 0: Se pega en la parte superior de la ventana
•	z-index: 1000: Asegura que esté por encima de otros elementos (mayor número = más arriba)
•	El nav siempre será visible al hacer scroll
.nav-contenedor {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
•	max-width: 1400px: No crece más allá de 1400px
•	margin: 0 auto: Centra horizontalmente (0 arriba/abajo, auto izquierda/derecha)
•	justify-content: space-between: Distribuye espacio entre elementos (logo a la izquierda, menú a la derecha)
.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: var(--transicion);
}

.nav-logo:hover {
  transform: scale(1.05);
}
•	gap: Espacio entre elementos flex (separación entre icono y texto)
•	Al hacer hover, crece 5%
.logo-icono {
  font-size: 2rem;
}

.logo-icono svg {
  stroke: #ffffff;
  transition: var(--transicion);
}

.nav-logo:hover .logo-icono svg {
  stroke: var(--naranja);
}
•	El SVG es blanco normalmente
•	Al hacer hover en el logo, el icono cambia a naranja
.logo-texto {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Georgia', serif;
}
•	font-weight: 700: Negrita (valores de 100 a 900, 400 es normal)
•	serif: Fuente con "pies" o serifas (como Times New Roman)
.modo-oscuro .logo-icono svg {
  stroke: #ffffff;
}

.modo-oscuro .logo-texto {
  color: #ffffff;
}
•	En modo oscuro, el logo permanece blanco (no cambia)
.nav-hamburguesa {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}
•	display: none: Por defecto está oculto (solo visible en móviles)
•	flex-direction: column: Las tres líneas se apilan verticalmente
.nav-hamburguesa span {
  width: 25px;
  height: 3px;
  background: var(--blanco);
  border-radius: 3px;
  transition: var(--transicion);
}
•	Cada "span" es una línea del icono de hamburguesa
•	25px de ancho, 3px de alto
•	Bordes redondeados para suavizar
.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}
•	list-style: none: Quita los bullets (puntos) de la lista
•	gap: 2rem: 32px de separación entre cada item del menú
.nav-menu li {
  color: var(--blanco);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transicion);
  position: relative;
}
•	font-weight: 500: Peso medio (entre normal y negrita)
•	position: relative: Necesario para posicionar el pseudo-elemento ::after
.nav-menu li:not(:has(button)):hover {
  color: var(--naranja);
}
•	:not(): Selector de negación - "no"
•	:has(button): Selecciona elementos que contienen un botón
•	:not(:has(button)): Elementos que NO contienen botones
•	Solo los items que no tienen botones cambian de color al hacer hover
.nav-menu li:not(:has(button))::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--naranja);
  transition: var(--transicion);
}
•	::after: Crea un elemento después del contenido
•	content: '': El elemento existe pero está vacío
•	position: absolute: Se posiciona relativo al li (que tiene position: relative)
•	bottom: -5px: 5px debajo del texto
•	width: 0: Inicialmente invisible (ancho cero)
•	Este será la línea naranja que aparece debajo al hacer hover
.modo-oscuro .nav-menu li {
  color: #ffffff !important;
}
•	!important: Fuerza este estilo por encima de cualquier otro
•	En modo oscuro, los items siempre son blancos
.nav-menu li:not(:has(button)):hover::after {
  width: 100%;
}
•	Al hacer hover, la línea crece de 0% a 100% del ancho del texto
•	Crea un efecto de subrayado animado
________________________________________
SECCIÓN 6: BOTONES
.btn-primario,
.btn-secundario {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transicion);
  font-size: 1rem;
}
•	Estilos base compartidos por ambos tipos de botón
•	padding: 0.75rem 1.5rem: 12px arriba/abajo, 24px izquierda/derecha
.btn-primario {
  background: var(--naranja);
  color: var(--blanco);
  box-shadow: var(--sombra);
}

.btn-primario:hover {
  background: #d66e00;
  transform: translateY(-2px);
  box-shadow: var(--sombra-hover);
}
•	background: #d66e00: Naranja más oscuro al hacer hover
•	translateY(-2px): Mueve el botón 2px hacia arriba
•	box-shadow: La sombra se hace más grande y notoria
•	Efecto de "levantamiento" al hacer hover
.btn-secundario {
  background: transparent;
  color: var(--blanco);
  border: 2px solid var(--blanco);
}

.btn-secundario:hover {
  background: var(--blanco);
  color: var(--verde-bosque);
}
•	Botón transparente con borde blanco
•	Al hacer hover, se rellena de blanco y el texto cambia a verde-bosque
•	Efecto de inversión de colores
________________________________________
SECCIÓN 7: MAIN
.main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}
•	flex: 1: Crece para ocupar todo el espacio disponible
•	Esto empuja el footer hacia abajo
•	width: 100%: Ocupa todo el ancho disponible hasta el max-width
•	Centrado con margin auto
________________________________________
SECCIÓN 8: HERO (Sección Principal)
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  margin-bottom: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease;
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
•	backdrop-filter: Efecto glassmorphism (vidrio esmerilado)
•	saturate(180%): Aumenta la intensidad de colores detrás
•	animation: fadeIn durante 0.6 segundos con aceleración suave
•	overflow: hidden: Esconde contenido que sale de los bordes
•	isolation: isolate: Crea un nuevo contexto de apilamiento (para que ::before funcione correctamente)
.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  opacity: 1;
  filter: brightness(0.5);
}
•	::before: Crea un pseudo-elemento ANTES del contenido
•	position: absolute: Se posiciona respecto al .hero (que tiene position: relative)
•	top: 0; left: 0; right: 0; bottom: 0: Ocupa todo el espacio del contenedor padre
•	background-image: url(): Imagen de fondo (foto de comida de Unsplash)
•	background-size: cover: La imagen cubre todo el espacio sin deformarse
•	background-position: center: Centra la imagen
•	background-repeat: no-repeat: La imagen no se repite
•	z-index: 0: Está detrás del contenido (números negativos o 0 = atrás)
•	filter: brightness(0.5): Oscurece la imagen al 50% para que el texto sea legible
.hero h1,
.hero p {
  position: relative;
  z-index: 1;
}
•	z-index: 1: Asegura que el texto esté por encima de la imagen de fondo
•	Sin esto, el texto quedaría detrás de ::before
.hero h1 {
  font-size: 2.5rem;
  color: #ffffff !important;
  margin-bottom: 1.5rem;
  font-family: 'Georgia', serif;
  line-height: 1.3;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
}
•	font-size: 2.5rem: 40px (2.5 × 16px)
•	!important: Fuerza que sea blanco siempre
•	line-height: 1.3: Espacio entre líneas = 130% del tamaño de fuente
•	text-shadow: Sombra de texto para legibilidad 
o	2px horizontal
o	2px vertical
o	8px de desenfoque
o	Negro casi opaco (0.9 = 90% de opacidad)
.hero p {
  font-size: 1.2rem;
  color: #ffffff !important;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}
•	max-width: 800px: El párrafo no crece más allá de 800px
•	margin-left: auto; margin-right: auto: Centra el párrafo horizontalmente
.modo-oscuro .hero h1 {
  color: #ff9a3c !important;
  text-shadow: none
}

.modo-oscuro .hero p {
  color: #ffffff !important;
}
•	En modo oscuro, el h1 cambia a naranja y se quita la sombra
•	El párrafo permanece blanco
________________________________________
SECCIÓN 9: CATEGORÍAS
.categorias {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}
•	flex-wrap: wrap: Los elementos se envuelven a la siguiente línea si no caben
•	justify-content: center: Centra los botones
.cat-btn {
  background: rgba(255, 255, 255, 0.95);
  border: 3px solid transparent;
  padding: 1rem 2rem;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transicion);
  box-shadow: var(--sombra);
}
•	border: 3px solid transparent: Borde transparente de 3px 
o	Reserva espacio para el borde aunque no se vea
o	Previene "saltos" cuando el borde se hace visible
•	flex-direction: column: Icono arriba, texto abajo
.cat-btn:hover {
  transform: translateY(-5px);
  box-shadow: var(--sombra-hover);
}
•	Al hacer hover, el botón "flota" 5px hacia arriba
•	La sombra se hace más grande para enfatizar la elevación
.cat-btn.activo {
  background: var(--naranja);
  color: var(--blanco);
  border-color: var(--naranja);
}
•	.activo: Clase que se agrega cuando la categoría está seleccionada
•	Fondo naranja sólido
.cat-icono {
  font-size: 2rem;
}

.cat-icono svg {
  stroke: var(--verde-bosque);
  transition: var(--transicion);
}

.cat-btn.activo .cat-icono svg {
  stroke: var(--blanco);
}
•	Iconos verdes normalmente
•	Iconos blancos cuando el botón está activo
.modo-oscuro .cat-icono svg {
  stroke: var(--verde-hoja);
}

.modo-oscuro .cat-btn.activo .cat-icono svg {
  stroke: var(--blanco);
}
•	En modo oscuro, los iconos usan verde-hoja (más claro)
.cat-btn span:not(.cat-icono) {
  color: var(--verde-bosque);
}

.cat-btn.activo span:not(.cat-icono) {
  color: var(--blanco);
}
•	:not(.cat-icono): Selecciona el span del texto, NO el del icono
•	Texto verde normalmente, blanco cuando está activo
.modo-oscuro .cat-btn span:not(.cat-icono) {
  color: var(--gris-oscuro);
}

.modo-oscuro .cat-btn.activo span:not(.cat-icono) {
  color: var(--blanco);
}
•	En modo oscuro, el texto usa gris-oscuro (que es claro en modo oscuro)
________________________________________
SECCIÓN 10: FILTRO SALUD MEJORADO
.filtro-salud {
  background: rgba(255, 255, 255, 0.07);
  padding: 0;
  border-radius: 20px;
  margin-bottom: 3rem;
  box-shadow: var(--sombra);
  overflow: hidden;
}
•	padding: 0: Sin relleno en el contenedor principal 
o	El padding se aplica individualmente a las secciones internas
•	overflow: hidden: Asegura que el border-radius funcione correctamente
.filtro-header {
  padding: 2rem;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: var(--transicion);
  background: linear-gradient(135deg, var(--verde-bosque), var(--verde-hoja));
  position: relative;
}
•	cursor: pointer: Indica que es clickeable (para expandir/colapsar)
•	position: relative: Necesario para posicionar el ícono de toggle
.filtro-header:hover {
  background: linear-gradient(135deg, var(--verde-hoja), var(--verde-bosque));
}
•	Al hacer hover, el gradiente se invierte (los colores cambian de lugar)
.filtro-header h2 {
  color: var(--blanco);
  margin: 0;
  font-size: 1.8rem;
}
•	margin: 0: Quita el margen por defecto de h2 para centrado perfecto
.filtro-toggle {
  position: absolute;
  right: 2rem;
  font-size: 1.5rem;
  color: var(--blanco);
  transition: var(--transicion);
}
•	position: absolute: Se posiciona independiente del flujo normal
•	right: 2rem: 32px desde el borde derecho
•	Este es el ícono ▼ o ▲
.filtro-contenido {
  padding: 2rem;
  animation: slideDown 0.3s ease;
}
•	animation: slideDown: Referencia a la animación definida más abajo
•	Efecto de deslizamiento hacia abajo al expandirse
.filtro-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
•	Contiene el texto descriptivo y el botón de limpiar
•	space-between: Separa el texto y el botón a los extremos
.filtro-info p {
  color: var(--blanco);
  margin: 0;
  flex: 1;
  min-width: 250px;
}
•	flex: 1: El párrafo crece para ocupar el espacio disponible
•	min-width: 250px: Ancho mínimo antes de envolver a la siguiente línea
.btn-limpiar {
  padding: 0.75rem 1.5rem;
  background: var(--naranja);
  color: var(--blanco);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transicion);
  white-space: nowrap;
}
•	white-space: nowrap: El texto no se envuelve (se mantiene en una línea)
.btn-limpiar:hover {
  background: #d66e00;
  transform: translateY(-2px);
}
•	Naranja más oscuro y se eleva al hacer hover
.filtro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
•	display: grid: Sistema de cuadrícula
•	repeat(auto-fill, ...): Crea tantas columnas como quepan
•	minmax(200px, 1fr): Cada columna mínimo 200px, máximo una fracción igual del espacio
•	1fr: Una fracción del espacio disponible
•	Esto crea una cuadrícula responsive automática
.filtro-card {
  position: relative;
  padding: 1.25rem;
  background: var(--gris-claro);
  border: 3px solid var(--gris-medio);
  border-radius: 15px;
  cursor: pointer;
  transition: var(--transicion);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  min-height: 100px;
}
•	position: relative: Para posicionar el check mark absolutamente
•	min-height: 100px: Todas las tarjetas tienen la misma altura mínima
.filtro-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--sombra);
  border-color: var(--verde-hoja);
}
•	Efecto de elevación y cambio de color de borde al hacer hover
.filtro-card.activo {
  background: var(--verde-bosque);
  border-color: var(--verde-bosque);
  color: var(--blanco);
}
•	Las tarjetas activas tienen fondo verde-bosque
.filtro-icono {
  font-size: 2rem;
}

.filtro-icono svg {
  stroke: var(--verde-bosque);
  fill: none;
  stroke-width: 2;
}
•	fill: none: El interior del SVG es transparente (solo se ve el trazo)
•	stroke-width: 2: Grosor del trazo
.filtro-card.activo .filtro-icono svg {
  stroke: var(--blanco);
}
•	Iconos blancos cuando la tarjeta está activa
.modo-oscuro .filtro-icono svg {
  stroke: var(--verde-hoja);
}

.modo-oscuro .filtro-card.activo .filtro-icono svg {
  stroke: var(--blanco);
}
•	En modo oscuro, iconos verde-hoja normalmente, blancos cuando activos
.filtro-nombre {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
}
•	Texto del nombre del filtro en semi-negrita
.filtro-card .filtro-nombre {
  color: var(--verde-bosque);
}

.filtro-card.activo .filtro-nombre {
  color: var(--blanco);
}
•	Verde normalmente, blanco cuando está activo
.modo-oscuro .filtro-card .filtro-nombre {
  color: var(--gris-oscuro);
}

.modo-oscuro .filtro-card.activo .filtro-nombre {
  color: var(--blanco);
}
•	En modo oscuro, gris-oscuro (que es claro) normalmente
.modo-oscuro .filtro-info p {
  color: #ffffff !important;
}
•	El texto descriptivo es blanco puro en modo oscuro
.filtro-check {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--naranja);
  color: var(--blanco);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}
•	border-radius: 50%: Hace un círculo perfecto (50% de un cuadrado = círculo)
•	position: absolute; top: 0.5rem; right: 0.5rem: Posicionado en esquina superior derecha
•	Este es el check mark ✓ naranja
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}
•	@keyframes: Define una animación reutilizable
•	from: Estado inicial (invisible y altura 0)
•	to: Estado final (visible y altura 2000px)
•	max-height: Se anima la altura máxima, no la altura directa 
o	Permite animación suave sin conocer la altura exacta del contenido
o	2000px es suficientemente grande para cualquier contenido
________________________________________
RESPONSIVE PARA FILTROS
@media (max-width: 968px) {
  .filtro-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }
•	@media: Regla condicional que solo se aplica en ciertas condiciones
•	(max-width: 968px): Solo cuando la ventana es 968px o menor
•	En tablets, las columnas son un poco más estrechas (160px en vez de 200px)
  .filtro-card {
    padding: 1rem;
    min-height: 90px;
  }
•	Tarjetas más compactas en tablets
  .filtro-icono {
    font-size: 1.5rem;
  }

  .filtro-nombre {
    font-size: 0.85rem;
  }
•	Iconos y texto más pequeños
  .filtro-header h2 {
    font-size: 1.4rem;
  }
}
•	Título del filtro más pequeño en tablets
@media (max-width: 640px) {
  .filtro-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }
•	En móviles (640px o menos), columnas aún más estrechas
  .filtro-card {
    padding: 0.75rem;
    min-height: 80px;
  }
•	Tarjetas más compactas en móviles
  .filtro-info {
    flex-direction: column;
    align-items: stretch;
  }
•	flex-direction: column: El texto y botón se apilan verticalmente
•	align-items: stretch: Ambos ocupan todo el ancho
  .filtro-info p {
    min-width: 100%;
  }

  .btn-limpiar {
    width: 100%;
  }
•	El botón de limpiar ocupa todo el ancho en móviles
  .filtro-header {
    padding: 1.5rem;
  }

  .filtro-header h2 {
    font-size: 1.2rem;
  }
}
•	Padding y fuente más pequeños en móviles
________________________________________
SECCIÓN 11: GRID DE RECETAS
.recetas-grid {
  animation: fadeIn 0.6s ease;
}
•	Toda la sección se desvanece suavemente al aparecer
.recetas-grid h2 {
  text-align: center;
  color: var(--blanco);
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-family: 'Georgia', serif;
}
•	Título "Recetas Recomendadas" centrado y grande
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}
•	Cuadrícula responsive
•	Cada tarjeta mínimo 320px de ancho
•	2rem (32px) de separación entre tarjetas
.sin-resultados {
  text-align: center;
  color: var(--blanco);
  font-size: 1.2rem;
  padding: 3rem;
}
•	Mensaje que aparece cuando no hay recetas que coincidan con los filtros
________________________________________
SECCIÓN 12: TARJETA RECETA
.tarjeta-receta {
  background: var(--blanco);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--transicion);
  box-shadow: var(--sombra);
}
•	overflow: hidden: Asegura que la imagen no se salga de los bordes redondeados
.tarjeta-receta:hover {
  transform: translateY(-8px);
  box-shadow: var(--sombra-hover);
}
•	Al hacer hover, la tarjeta se eleva 8px
.tarjeta-img {
  position: relative;
  height: 220px;
  overflow: hidden;
}
•	position: relative: Para posicionar el botón de favoritos
•	height: 220px: Todas las imágenes tienen la misma altura
.tarjeta-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transicion);
}
•	width: 100%; height: 100%: La imagen llena todo el contenedor
•	object-fit: cover: La imagen se recorta para llenar el espacio sin deformarse 
o	Similar a background-size: cover pero para elementos img
.tarjeta-receta:hover .tarjeta-img img {
  transform: scale(1.1);
}
•	Al hacer hover en la tarjeta, la imagen se agranda a 110%
•	Como el contenedor tiene overflow: hidden, crea efecto de zoom
.btn-fav {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 45px;
  height: 45px;
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transicion);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
•	position: absolute: Se posiciona sobre la imagen
•	top: 1rem; right: 1rem: 16px desde arriba y derecha
•	width: 45px; height: 45px: Área clickeable cuadrada
•	background: none: Sin fondo (transparente)
•	padding: 0: Sin relleno (el tamaño es exacto)
.btn-fav svg {
  width: 28px;
  height: 28px;
  stroke: var(--negro);
  stroke-width: 2;
  fill: none;
  transition: var(--transicion);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
•	stroke: Color del borde del corazón (negro por defecto)
•	fill: none: Interior del corazón vacío (solo borde)
•	filter: drop-shadow: Sombra alrededor del SVG completo 
o	0 horizontal
o	2px vertical
o	4px de desenfoque
o	Negro con 20% opacidad
.btn-fav:hover svg {
  stroke: #dc2626;
  transform: scale(1.15);
  filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.4));
}
•	#dc2626: Rojo intenso al hacer hover
•	scale(1.15): Crece 15%
•	La sombra se hace roja y más grande
.btn-fav.activo svg {
  fill: #dc2626;
  stroke: #dc2626;
  filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.5));
}
•	.activo: Cuando la receta está en favoritos
•	fill: #dc2626: El corazón se rellena de rojo
•	stroke: #dc2626: El borde también es rojo
•	Corazón completamente rojo y con sombra roja
.modo-oscuro .btn-fav svg {
  stroke: var(--blanco);
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}
•	En modo oscuro, el borde del corazón es blanco
•	Sombra blanca para contrastar con fondos oscuros
.modo-oscuro .btn-fav:hover svg {
  stroke: #dc2626;
  filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.4));
}
•	Mismo comportamiento de hover (rojo) en modo oscuro
.modo-oscuro .btn-fav.activo svg {
  fill: #dc2626;
  stroke: #dc2626;
  filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.5));
}
•	Favoritos activos se ven igual en modo oscuro (rojo)
.tarjeta-info {
  padding: 1.5rem;
}
•	Sección de información debajo de la imagen
.tarjeta-info h3 {
  color: var(--verde-bosque);
  margin-bottom: 0.75rem;
  font-size: 1.3rem;
}
•	Nombre de la receta en verde-bosque
.tarjeta-info p {
  color: var(--gris-oscuro);
  margin-bottom: 1rem;
  line-height: 1.5;
}
•	Descripción de la receta
.tarjeta-puntuacion {
  color: var(--naranja);
  font-weight: 600;
  font-size: 1.1rem;
}
•	Puntuación (⭐ 4.8/5) en naranja y negrita
________________________________________
SECCIÓN 13: MODAL DETALLE
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}
•	position: fixed: Se mantiene en posición incluso al hacer scroll
•	top: 0; left: 0; right: 0; bottom: 0: Cubre toda la pantalla
•	z-index: 2000: Por encima de todo (incluso del nav que tiene 1000)
•	background: rgba(0, 0, 0, 0.8): Fondo negro con 80% opacidad
•	display: flex: Para centrar el modal
•	padding: 2rem: Margen alrededor del modal
.modal-contenido {
  background: var(--blanco);
  border-radius: 20px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 2rem;
  animation: slideUp 0.3s ease;
}
•	max-width: 800px: El modal no crece más allá de 800px
•	max-height: 90vh: Máximo 90% de la altura de la ventana
•	overflow-y: auto: Scroll vertical si el contenido es muy largo
•	animation: slideUp: Se desliza desde abajo al aparecer
.modal-cerrar {
  position: fixed;
  top: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: var(--blanco);
  color: var(--gris-oscuro);
  font-size: 1.5rem;
  font-weight: 300;
  cursor: pointer;
  transition: var(--transicion);
  z-index: 2001;
  box-shadow: var(--sombra-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}
•	position: fixed: Permanece en su posición al hacer scroll
•	z-index: 2001: Por encima del overlay (2000)
•	border-radius: 12px: Bordes redondeados (pero no completamente circular)
•	font-weight: 300: Fuente delgada para la X
.modal-cerrar:hover {
  background: var(--naranja);
  color: var(--blanco);
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(247, 127, 0, 0.4);
}
•	Al hacer hover, se vuelve naranja con sombra naranja
.modo-oscuro .modal-cerrar {
  background: rgba(45, 45, 45, 0.95);
  color: var(--gris-oscuro);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
•	En modo oscuro, fondo oscuro con borde sutil blanco
.modo-oscuro .modal-cerrar:hover {
  background: var(--naranja);
  color: var(--blanco);
  border-color: var(--naranja);
  box-shadow: 0 8px 24px rgba(255, 154, 60, 0.4);
}
•	Hover naranja también en modo oscuro
.modal-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 1.5rem;
}
•	Imagen de la receta al inicio del modal
•	300px de alto, cubre todo el ancho
.modal-contenido h2 {
  color: var(--verde-bosque);
  font-size: 2rem;
  margin-bottom: 1rem;
}
•	Título de la receta (nombre)
.modal-desc {
  color: var(--gris-oscuro);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}
•	Descripción de la receta con buena legibilidad
.modal-seccion {
  margin-bottom: 2rem;
}
•	Cada sección (ingredientes, pasos, etc.) tiene espacio debajo
.modal-seccion h3 {
  color: var(--verde-hoja);
  font-size: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--gris-medio);
  padding-bottom: 0.5rem;
}
•	border-bottom: Línea horizontal debajo del título
•	padding-bottom: Espacio entre el texto y la línea
•	Títulos de secciones (Ingredientes, Preparación, etc.)
.modal-seccion ul,
.modal-seccion ol {
  padding-left: 1.5rem;
}
•	padding-left: Sangría para las listas
•	ul: Lista sin orden (bullets)
•	ol: Lista ordenada (números)
.modal-seccion li {
  margin-bottom: 0.5rem;
  color: var(--gris-oscuro);
  line-height: 1.6;
}
•	Cada item de la lista tiene espacio debajo
•	Buena altura de línea para legibilidad
.nutri-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
•	auto-fit: Similar a auto-fill pero colapsa columnas vacías
•	Cuadrícula de valores nutricionales
.nutri-item {
  background: var(--gris-claro);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
}
•	Cada valor nutricional (calorías, proteínas, etc.)
.nutri-item span {
  display: block;
  color: var(--gris-oscuro);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
•	display: block: Cada span ocupa su propia línea
•	Nombre del nutriente (ej: "Calorías")
.nutri-item strong {
  display: block;
  color: var(--verde-bosque);
  font-size: 1.3rem;
}
•	Valor del nutriente (ej: "320")
•	En verde-bosque y más grande
.comentarios {
  margin-top: 1rem;
}
•	Sección de comentarios
.comentario {
  background: var(--gris-claro);
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}
•	Cada comentario individual
.comentario strong {
  color: var(--verde-bosque);
  display: block;
  margin-bottom: 0.5rem;
}
•	Nombre del usuario que comentó
.comentario p {
  color: var(--gris-oscuro);
}
•	Texto del comentario
________________________________________
SECCIÓN 14: ROBOT IA
.robot-boton {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--naranja);
  border: none;
  cursor: pointer;
  box-shadow: var(--sombra-hover);
  z-index: 1500;
  transition: var(--transicion);
  animation: float 3s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}
•	position: fixed; bottom: 2rem; right: 2rem: Esquina inferior derecha
•	border-radius: 50%: Círculo perfecto
•	z-index: 1500: Por encima del contenido pero debajo de modales
•	animation: float: Animación que se repite infinitamente
.robot-boton:hover {
  transform: scale(1.1);
}
•	Crece 10% al hacer hover
.robot-icono {
  font-size: 2.5rem;
}
•	Tamaño del icono del robot
.robot-chat {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  width: 350px;
  max-height: 500px;
  background: var(--blanco);
  border-radius: 20px;
  box-shadow: var(--sombra-hover);
  z-index: 1500;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}
•	bottom: 6rem: 96px desde abajo (encima del botón que está a 2rem)
•	width: 350px: Ancho fijo
•	max-height: 500px: Altura máxima
•	flex-direction: column: Header, mensajes, input apilados verticalmente
.robot-header {
  background: var(--verde-bosque);
  color: var(--blanco);
  padding: 1rem;
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
•	border-radius: 20px 20px 0 0: Redondeado arriba, recto abajo 
o	Orden: arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda
.robot-header h3 {
  font-size: 1.2rem;
}
•	Título "Asistente IA"
.robot-header button {
  background: none;
  border: none;
  color: var(--blanco);
  font-size: 1.5rem;
  cursor: pointer;
  transition: var(--transicion);
}
•	Botón X para cerrar el chat
.robot-header button:hover {
  transform: rotate(90deg);
}
•	La X rota 90 grados al hacer hover (efecto visual interesante)
.robot-mensajes {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 350px;
}
•	flex: 1: Crece para ocupar el espacio disponible
•	overflow-y: auto: Scroll si hay muchos mensajes
•	Área de mensajes
.robot-bienvenida {
  background: var(--gris-claro);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  color: var(--gris-oscuro);
}
•	Mensaje inicial de bienvenida
.robot-mensaje {
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  max-width: 80%;
  word-wrap: break-word;
}
•	max-width: 80%: Los mensajes no ocupan todo el ancho
•	word-wrap: break-word: Palabras largas se dividen si es necesario
.robot-mensaje.usuario {
  background: var(--verde-hoja);
  color: var(--blanco);
  margin-left: auto;
}
•	margin-left: auto: Empuja el mensaje a la derecha
•	Mensajes del usuario alineados a la derecha
.robot-mensaje.ia {
  background: var(--gris-claro);
  color: var(--gris-oscuro);
}
•	Mensajes de la IA alineados a la izquierda (sin margin-left: auto)
.robot-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--gris-medio);
}
•	border-top: Línea separadora entre mensajes e input
•	Input y botón en la misma fila
.robot-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--gris-medio);
  border-radius: 50px;
  font-size: 0.9rem;
  background: var(--blanco);
  color: var(--negro);
}
•	flex: 1: El input crece para ocupar el espacio disponible
•	Bordes muy redondeados (estilo moderno)
.robot-input button {
  padding: 0.75rem 1.5rem;
  background: var(--naranja);
  color: var(--blanco);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transicion);
}
•	Botón "Enviar" naranja
.robot-input button:hover {
  background: #d66e00;
}
•	Naranja más oscuro al hacer hover
________________________________________
SECCIÓN 15: VISTAS AUTH (Login, Registro, Recuperar)
.vista-auth {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
•	min-height: 70vh: Mínimo 70% de la altura de la ventana
•	Centra el formulario vertical y horizontalmente
.auth-card {
  background: var(--blanco);
  padding: 3rem;
  border-radius: 20px;
  max-width: 450px;
  width: 100%;
  box-shadow: var(--sombra-hover);
  animation: fadeIn 0.6s ease;
}
•	Tarjeta centrada con el formulario
•	max-width: 450px: No crece más allá de 450px
•	width: 100%: Ocupa todo el ancho hasta el max-width
.auth-card h2 {
  text-align: center;
  color: var(--verde-bosque);
  font-size: 2rem;
  margin-bottom: 2rem;
  font-family: 'Georgia', serif;
}
•	Título del formulario (Iniciar Sesión, Crear Cuenta, etc.)
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
•	Los campos del formulario se apilan verticalmente con espacio entre ellos
.auth-form input {
  padding: 1rem;
  border: 2px solid var(--gris-medio);
  border-radius: 10px;
  font-size: 1rem;
  transition: var(--transicion);
  background: var(--blanco);
  color: var(--negro);
}
•	Campos de entrada del formulario
.auth-form input:focus {
  outline: none;
  border-color: var(--verde-hoja);
}
•	outline: none: Quita el borde azul por defecto del navegador
•	Borde verde cuando el campo está activo
.auth-card p {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--gris-oscuro);
}
•	Texto debajo del formulario (¿No tienes cuenta?, etc.)
.auth-card p span {
  color: var(--naranja);
  cursor: pointer;
  font-weight: 600;
}
•	Enlaces clickeables en naranja
.auth-card p span:hover {
  text-decoration: underline;
}
•	Subrayado al hacer hover
________________________________________
SECCIÓN 16: VISTA HISTORIAL
.vista-historial {
  animation: fadeIn 0.6s ease;
}
•	Toda la vista se desvanece al aparecer
.vista-historial h1 {
  text-align: center;
  color: var(--blanco);
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-family: 'Georgia', serif;
}
•	Título "Mi Historial"
.periodo-btns {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}
•	Botones de periodo (Hoy, Esta Semana, Este Mes)
•	flex-wrap: wrap: Se envuelven en móviles si no caben
.periodo-btns button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid transparent;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: var(--transicion);
  color: var(--gris-oscuro);
}
•	Botones de periodo con fondo blanco semi-transparente
•	Borde transparente para evitar "saltos" al cambiar a activo
.periodo-btns button:hover {
  background: var(--verde-hoja);
  color: var(--blanco);
}
•	Verde al hacer hover
.periodo-btns button.activo {
  background: var(--naranja);
  color: var(--blanco);
  border-color: var(--naranja);
}
•	Naranja cuando está seleccionado
.historial-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
•	flex-direction: column: Items apilados verticalmente
•	No es grid, es flex (a pesar del nombre de la clase)
.historial-item {
  background: var(--blanco);
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  box-shadow: var(--sombra);
  transition: var(--transicion);
}
•	Cada item del historial
•	display: flex: Imagen a la izquierda, info a la derecha
.historial-item:hover {
  transform: translateX(10px);
  box-shadow: var(--sombra-hover);
}
•	translateX(10px): Se mueve 10px a la derecha al hacer hover
•	Efecto de deslizamiento horizontal
.historial-item img {
  width: 200px;
  height: 200px;
  object-fit: cover;
}
•	Imagen cuadrada de 200x200px
.historial-info {
  color: var(--negro);
  padding: 1.5rem;
  flex: 1;
}
•	flex: 1: La info ocupa el espacio restante
•	Información de la receta
.historial-info h3 {
  color: var(--verde-bosque);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
•	Nombre de la receta
.historial-fecha {
  color: var(--negro);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
•	Fecha de visualización (ej: "2024-01-20")
________________________________________
SECCIÓN 17: VISTA FAVORITOS
.vista-favoritos {
  animation: fadeIn 0.6s ease;
}
•	Animación de aparición
.vista-favoritos h1 {
  text-align: center;
  color: var(--blanco);
  font-size: 2.5rem;
  margin-bottom: 3rem;
  font-family: 'Georgia', serif;
}
•	Título "Mis Recetas Favoritas"
.vacio {
  background: rgba(255, 255, 255, 0.95);
  padding: 4rem 2rem;
  border-radius: 20px;
  text-align: center;
}
•	Mensaje cuando no hay favoritos
•	Fondo blanco casi opaco
.vacio-icono {
  font-size: 5rem;
  color: var(--gris-medio);
  margin-bottom: 1rem;
}
•	Icono grande (♥) en gris
.vacio p {
  color: var(--gris-oscuro);
  font-size: 1.2rem;
}
•	Texto del mensaje vacío
________________________________________
SECCIÓN 18: VISTA CONTACTO
.vista-contacto {
  animation: fadeIn 0.6s ease;
}
•	Animación de aparición
.vista-contacto h1 {
  text-align: center;
  color: var(--blanco);
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-family: 'Georgia', serif;
}
•	Título "Contáctanos"
.contacto-subtitulo {
  text-align: center;
  color: var(--blanco);
  font-size: 1.1rem;
  margin-bottom: 3rem;
}
•	Subtítulo descriptivo
.contacto-contenedor {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}
•	grid-template-columns: 1fr 1fr: Dos columnas iguales
•	Información a la izquierda, formulario a la derecha
.contacto-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
•	Columna izquierda con items de información apilados
.info-item {
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 15px;
  display: flex;
  gap: 1rem;
  box-shadow: var(--sombra);
  transition: var(--transicion);
}
•	Cada item de información (email, teléfono, ubicación, horario)
•	display: flex: Icono a la izquierda, texto a la derecha
.info-item:hover {
  transform: translateX(-5px);
  box-shadow: var(--sombra-hover);
}
•	translateX(-5px): Se mueve 5px a la izquierda al hacer hover
•	Efecto opuesto al del historial
.info-icono {
  font-size: 2rem;
  flex-shrink: 0;
}
•	flex-shrink: 0: El icono no se encoge si falta espacio
•	Mantiene su tamaño de 2rem siempre
.info-item h3 {
  color: var(--verde-bosque);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}
•	Título del item (Correo, Teléfono, etc.)
.info-item p {
  color: var(--gris-oscuro);
}
•	Contenido del item (dirección de email, número, etc.)
.contacto-form {
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--sombra);
}
•	Formulario de contacto (columna derecha)
.contacto-form h2 {
  color: var(--verde-bosque);
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}
•	Título del formulario
.contacto-form input,
.contacto-form textarea {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid var(--gris-medio);
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: var(--transicion);
  background: var(--blanco);
  color: var(--negro);
}
•	width: 100%: Ocupan todo el ancho del formulario
•	font-family: inherit: Usan la misma fuente que el resto de la página
.contacto-form input:focus,
.contacto-form textarea:focus {
  outline: none;
  border-color: var(--verde-hoja);
}
•	Borde verde al hacer focus
.contacto-form textarea {
  resize: vertical;
  min-height: 120px;
}
•	resize: vertical: Solo se puede redimensionar verticalmente (no horizontalmente)
•	min-height: 120px: Altura mínima del textarea
________________________________________
SECCIÓN 19: FOOTER
.footer {
  background: var(--verde-bosque);
  color: var(--blanco);
  padding: 3rem 2rem 1rem;
  margin-top: 4rem;
}
•	padding: 3rem 2rem 1rem: 48px arriba, 32px lados, 16px abajo
•	margin-top: 4rem: Separación del contenido principal
.footer-contenido {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}
•	repeat(auto-fit, minmax(250px, 1fr)): Columnas flexibles 
o	Mínimo 250px cada una
o	Se adaptan automáticamente al espacio disponible
.footer-seccion h3,
.footer-seccion h4 {
  margin-bottom: 1rem;
  font-family: 'Georgia', serif;
}
•	Títulos de secciones del footer
.footer-seccion ul {
  list-style: none;
}
•	Listas sin bullets
.footer-seccion li {
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: var(--transicion);
}
•	Items de lista clickeables
.footer-seccion li:hover {
  color: var(--naranja);
  transform: translateX(5px);
}
•	Cambian a naranja y se mueven a la derecha al hacer hover
.footer-copy {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}
•	border-top: Línea separadora sutil blanca
•	color: rgba(255, 255, 255, 0.7): Blanco con 70% opacidad (texto más tenue)
•	Copyright y créditos
________________________________________
SECCIÓN 20: ANIMACIONES
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
•	Aparición gradual de invisible (0) a visible (1)
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
•	Deslizamiento desde 30px abajo hacia su posición normal
•	Combina opacidad y movimiento
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
•	0%, 100%: Al inicio y al final, posición normal
•	50%: A la mitad, sube 10px
•	Crea efecto de flotación (el botón del robot sube y baja continuamente)
________________________________________
SECCIÓN 21: FONDO ANIMADO
.fondo-animado {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}
•	position: fixed: Se mantiene fijo al hacer scroll
•	z-index: -1: Detrás de todo el contenido
•	Contenedor del fondo
.gradient-mesh {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      #1a4d2e 0%,
      #2d5a3d 50%,
      #4f772d 100%);
}
•	Gradiente de tres tonos de verde
•	135deg: Diagonal de abajo-izquierda a arriba-derecha
•	0%, 50%, 100%: Posiciones de los colores en el gradiente
.modo-oscuro .gradient-mesh {
  background: linear-gradient(135deg,
      #0f1a14 0%,
      #1a2820 50%,
      #2d3d2f 100%);
}
•	Versión más oscura del gradiente para modo oscuro
.onda-linea {
  position: absolute;
  width: 100%;
  height: 200px;
  left: 0;
  pointer-events: none;
}
•	pointer-events: none: No interfiere con clicks del mouse 
o	Los clicks "atraviesan" las ondas hacia el contenido debajo
.onda-linea svg {
  position: absolute;
  width: 200%;
  height: 100%;
  left: 0;
}
•	width: 200%: El SVG es el doble de ancho de la pantalla 
o	Necesario para la animación de desplazamiento infinito
.onda-linea-1 {
  top: 20%;
  animation: ondaScroll1 20s linear infinite;
}
•	top: 20%: Posicionada al 20% desde arriba
•	linear: Velocidad constante (sin aceleración)
•	infinite: Se repite eternamente
.onda-linea-2 {
  top: 50%;
  animation: ondaScroll2 25s linear infinite;
}
•	Posicionada a la mitad
•	Más lenta (25s en vez de 20s)
.onda-linea-3 {
  top: 75%;
  animation: ondaScroll3 30s linear infinite;
}
•	Posicionada al 75%
•	La más lenta (30s)
@keyframes ondaScroll1 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
•	Se mueve de 0% a -50% horizontalmente
•	Como el SVG es 200% de ancho, mover -50% crea loop perfecto
@keyframes ondaScroll2 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}
•	Se mueve en dirección opuesta (positiva)
@keyframes ondaScroll3 {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.33%);
  }
}
•	Movimiento más lento (-33.33%)
.modo-oscuro .onda-linea-1 path {
  stroke: rgba(107, 158, 74, 0.6) !important;
}

.modo-oscuro .onda-linea-2 path {
  stroke: rgba(45, 90, 61, 0.5) !important;
}

.modo-oscuro .onda-linea-3 path {
  stroke: rgba(255, 154, 60, 0.15) !important;
}
•	Colores más sutiles para modo oscuro
•	La tercera onda usa naranja muy tenue
.onda-linea {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
•	will-change: transform: Optimización para el navegador 
o	Indica que esta propiedad cambiará, permitiendo mejor rendimiento
•	backface-visibility: hidden: Oculta la parte trasera del elemento 
o	Previene glitches visuales durante animaciones
•	-webkit-backface-visibility: Versión para navegadores webkit (Safari/Chrome)
________________________________________
SECCIÓN 22: MODAL RECETA DOS COLUMNAS
.modal-overlay {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
•	Agrega desenfoque al fondo del modal (efecto glassmorphism)
•	Se aplica además del fondo negro semi-transparente
.modal-contenedor-receta {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  width: 95%;
  max-height: 85vh;
  position: relative;
}
•	width: 95%: Ocupa 95% del ancho disponible
•	max-height: 85vh: Máximo 85% de la altura de la ventana
•	Contenedor que divide el modal en dos columnas
.modal-col {
  background: var(--blanco);
  border-radius: 20px;
  padding: 2rem;
  overflow-y: auto;
  box-shadow: var(--sombra-hover);
}
•	Cada columna tiene su propio fondo y scroll
.modal-col::-webkit-scrollbar {
  display: none;
}

.modal-col {
  scrollbar-width: none;
}
•	::-webkit-scrollbar: Selector específico de Chrome/Safari
•	scrollbar-width: none: Estándar para Firefox
•	Oculta las barras de scroll (pero mantiene la funcionalidad)
.modal-izq {
  flex: 1.2;
}

.modal-der {
  flex: 0.8;
}
•	flex: 1.2 vs flex: 0.8: Proporción 60%-40% 
o	La columna izquierda es más grande que la derecha
.modo-oscuro .modal-col {
  background: rgba(45, 45, 45, 0.95);
}
•	Fondo oscuro para las columnas en modo oscuro
________________________________________
SECCIÓN 23: PANEL NUTRICIÓN
.nutri-panel {
  background: var(--gris-claro);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  position: sticky;
  top: 0;
}
•	position: sticky; top: 0: Se pega en la parte superior al hacer scroll 
o	Solo dentro de su contenedor (la columna derecha)
.nutri-panel h3 {
  color: var(--verde-bosque);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
•	Título "Nutrición"
.modo-oscuro .nutri-panel h3 {
  color: var(--verde-hoja);
}
•	Verde más claro en modo oscuro
.nutri-chart {
  width: 200px;
  height: 200px;
  margin: 1rem auto;
  display: block;
}
•	margin: 1rem auto: Centrado horizontal
•	display: block: Necesario para que margin auto funcione
•	Tamaño del gráfico circular
.nutri-leyenda {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}
•	Leyenda del gráfico (Grasas, Carbohidratos, Proteínas)
•	flex-wrap: wrap: Se envuelve en pantallas pequeñas
.nutri-leyenda-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--gris-oscuro);
}
•	Cada item de la leyenda (cuadrito de color + texto)
.nutri-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  display: inline-block;
}
•	Cuadrito de color en la leyenda
•	border-radius: 3px: Bordes ligeramente redondeados
.nutri-tabla-container {
  margin: 1.5rem 0;
  overflow-x: auto;
}
•	overflow-x: auto: Scroll horizontal si la tabla es muy ancha en móviles
.nutri-tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
•	border-collapse: collapse: Los bordes de celdas adyacentes se fusionan 
o	Sin esto, habría espacio entre bordes
.nutri-tabla thead {
  background: var(--verde-bosque);
  color: var(--blanco);
}
•	Cabecera de la tabla con fondo verde
.modo-oscuro .nutri-tabla thead {
  background: var(--verde-hoja);
}
•	Verde más claro en modo oscuro
.nutri-tabla th,
.nutri-tabla td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--gris-medio);
}
•	text-align: left: Alineación a la izquierda (por defecto th está centrado)
•	border-bottom: Línea separadora entre filas
.nutri-tabla th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
•	text-transform: uppercase: Todo en mayúsculas
•	letter-spacing: 0.5px: Espacio entre letras para legibilidad
.nutri-tabla td {
  color: var(--gris-oscuro);
}
•	Color del contenido de las celdas
.nutri-tabla tbody tr:hover {
  background: rgba(79, 119, 45, 0.05);
}
•	Fila se ilumina sutilmente al hacer hover
.modo-oscuro .nutri-tabla tbody tr:hover {
  background: rgba(111, 158, 74, 0.1);
}
•	Iluminación un poco más fuerte en modo oscuro
.btn-nutri-detalle {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  font-size: 0.95rem;
}
•	Botón para abrir el modal de nutrición detallada
•	Ocupa todo el ancho del panel
________________________________________
SECCIÓN 24: MODAL NUTRICIÓN DETALLADA
.modal-nutri-detalle {
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
}
•	Modal más ancho para mostrar toda la información nutricional
.modal-nutri-amplio {
  max-width: 1100px !important;
}
•	Clase adicional para forzar el ancho amplio
•	!important asegura que no sea sobreescrito
.modal-nutri-detalle h2 {
  color: var(--verde-bosque);
  margin-bottom: 1.5rem;
  font-size: 2rem;
  text-align: center;
}
•	Título principal del modal
.modo-oscuro .modal-nutri-detalle h2 {
  color: var(--verde-hoja);
}
•	Verde más claro en modo oscuro
.nutri-detalle-seccion {
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--gris-medio);
}
•	Cada sección nutricional (Vitaminas, Grasas, etc.)
•	Línea separadora entre secciones
.nutri-detalle-seccion:last-child {
  border-bottom: none;
}
•	:last-child: Selecciona el último elemento
•	La última sección no tiene línea debajo
.nutri-detalle-seccion h3 {
  color: var(--verde-hoja);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--naranja);
  display: inline-block;
}
•	display: inline-block: El borde inferior solo cubre el ancho del texto 
o	Sin esto, cubriría todo el ancho del contenedor
.modo-oscuro .nutri-detalle-seccion h3 {
  color: var(--naranja);
}
•	Naranja en modo oscuro para mejor contraste
.tabla-nutri-completa {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
•	Tabla con toda la información nutricional
.tabla-nutri-completa thead {
  background: var(--verde-bosque);
  color: var(--blanco);
}
•	Cabecera verde
.modo-oscuro .tabla-nutri-completa thead {
  background: var(--verde-hoja);
}
•	Verde claro en modo oscuro
.tabla-nutri-completa th,
.tabla-nutri-completa td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--gris-medio);
}
•	Celdas de la tabla
.tabla-nutri-completa th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
}
•	Cabeceras en mayúsculas
.tabla-nutri-completa tbody tr:nth-child(even) {
  background: rgba(0, 0, 0, 0.02);
}
•	:nth-child(even): Selecciona filas pares (2, 4, 6...)
•	Filas alternadas con fondo muy sutil (efecto cebra)
.modo-oscuro .tabla-nutri-completa tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}
•	En modo oscuro, usa blanco en vez de negro
.tabla-nutri-completa tbody tr:hover {
  background: rgba(79, 119, 45, 0.08);
}
•	Hover más notorio que el efecto cebra
.modo-oscuro .tabla-nutri-completa tbody tr:hover {
  background: rgba(111, 158, 74, 0.15);
}
•	Hover más fuerte en modo oscuro
.nutri-grid-detalle {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}
•	Grid para vitaminas y minerales
•	Columnas de mínimo 250px
.nutri-grid-3col {
  grid-template-columns: repeat(3, 1fr) !important;
}
•	Fuerza exactamente 3 columnas
•	!important: Sobrescribe el auto-fill anterior
@media (max-width: 1200px) {
  .nutri-grid-3col {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
•	En pantallas de 1200px o menos, cambia a 2 columnas
@media (max-width: 640px) {
  .nutri-grid-3col {
    grid-template-columns: 1fr !important;
  }
}
•	En móviles, solo 1 columna
.nutri-item-detalle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--gris-claro);
  border-radius: 8px;
  border-left: 3px solid var(--verde-hoja);
}
•	justify-content: space-between: Nombre a la izquierda, valores a la derecha
•	border-left: Barra de color en el lado izquierdo
.modo-oscuro .nutri-item-detalle {
  background: rgba(64, 64, 64, 0.5);
  border-left-color: var(--naranja);
}
•	En modo oscuro, la barra lateral es naranja
.nutri-nombre {
  font-size: 0.85rem;
  color: var(--gris-oscuro);
  flex: 1;
}
•	flex: 1: Ocupa el espacio disponible
•	Nombre del nutriente (ej: "Vitamina C")
.nutri-valor {
  font-weight: 600;
  color: var(--verde-bosque);
  margin: 0 0.5rem;
}
•	Valor numérico del nutriente (ej: "90 mg")
•	Margen horizontal para separarlo del nombre y del porcentaje
.modo-oscuro .nutri-valor {
  color: var(--verde-hoja);
}
•	Verde claro en modo oscuro
.nutri-dv {
  font-size: 0.85rem;
  color: var(--naranja);
  font-weight: 600;
  min-width: 45px;
  text-align: right;
}
•	min-width: 45px: Ancho mínimo para alinear los porcentajes
•	text-align: right: Alineados a la derecha
•	Porcentaje del valor diario (ej: "100%")
.nutri-grid-simple {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}
•	Grid más simple para azúcares y grasas
•	Columnas más estrechas (200px vs 250px)
.nutri-item-simple {
  background: var(--gris-claro);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  border-top: 3px solid var(--naranja);
}
•	border-top: Barra naranja en la parte superior
•	text-align: center: Todo centrado (nombre y valor)
.modo-oscuro .nutri-item-simple {
  background: rgba(64, 64, 64, 0.5);
}
•	Fondo oscuro en modo oscuro
.nutri-item-simple span {
  display: block;
  color: var(--gris-oscuro);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
•	display: block: Cada span en su propia línea
•	Nombre del nutriente (ej: "Azúcar")
.nutri-item-simple strong {
  display: block;
  color: var(--verde-bosque);
  font-size: 1.2rem;
  font-weight: 700;
}
•	font-weight: 700: Negrita intensa
•	Valor del nutriente (ej: "5 g")
.modo-oscuro .nutri-item-simple strong {
  color: var(--verde-hoja);
}
•	Verde claro en modo oscuro
.nutri-dv-inline {
  display: block;
  color: var(--naranja);
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.25rem;
}
•	Porcentaje del valor diario para items simples
•	Más pequeño y debajo del valor principal
________________________________________
SECCIÓN 25: RESPONSIVE PARA NUTRICIÓN
@media (max-width: 968px) {
  .modal-dos-columnas {
    grid-template-columns: 1fr !important;
    gap: 1.5rem;
  }
•	.modal-dos-columnas: En tablets, cambia de 2 columnas a 1
•	Las columnas se apilan verticalmente
  .modal-scroll {
    max-height: none;
    overflow-y: auto;
  }
•	Quita la altura máxima
•	Permite scroll natural de toda la página
  .modal-receta-ampliado {
    max-height: 85vh;
  }
•	Mantiene altura máxima del 85% de la ventana
  .nutri-panel {
    position: static;
  }
•	position: static: Quita el sticky
•	En móviles, el panel no se pega arriba (no tiene sentido con una columna)
  .nutri-grid-detalle {
    grid-template-columns: 1fr;
  }
•	Solo una columna para el grid de nutrientes
  .nutri-grid-simple {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
•	Columnas más estrechas (150px) en tablets
@media (max-width: 640px) {
  .modal-receta-ampliado {
    padding: 1rem;
    width: 98%;
  }
•	Menos padding en móviles
•	Ocupa casi todo el ancho (98%)
  .modal-dos-columnas {
    gap: 1rem;
  }
•	Gap más pequeño entre secciones
  .nutri-chart {
    width: 180px;
    height: 180px;
  }
•	Gráfico más pequeño (180px vs 200px)
  .nutri-leyenda {
    gap: 1rem;
  }
•	Menos espacio entre items de la leyenda
  .nutri-tabla th,
  .nutri-tabla td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
•	Celdas más compactas
•	Texto más pequeño
  .tabla-nutri-completa th,
  .tabla-nutri-completa td {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
•	Lo mismo para la tabla completa
  .nutri-grid-simple {
    grid-template-columns: 1fr;
  }
}
•	Solo una columna en móviles para azúcares/grasas
________________________________________
SECCIÓN 26: RESPONSIVE GENERAL
@media (max-width: 968px) {
  .nav-hamburguesa {
    display: flex;
  }
•	display: flex: El icono hamburguesa se hace visible en tablets/móviles
  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(26, 77, 46, 0.98);
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: var(--transicion);
  }
•	position: absolute: Se posiciona debajo del nav
•	top: 100%: Justo debajo del nav (100% de la altura del nav)
•	left: 0; right: 0: Ocupa todo el ancho
•	transform: translateY(-100%): Inicialmente fuera de la pantalla (arriba)
•	opacity: 0: Invisible
•	pointer-events: none: No se puede interactuar con él
•	El menú está escondido por defecto
  .nav-menu.activo {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
•	.activo: Cuando se agrega esta clase (al hacer click en hamburguesa)
•	translateY(0): Vuelve a su posición normal
•	opacity: 1: Se hace visible
•	pointer-events: all: Se puede interactuar con él
•	El menú se desliza hacia abajo suavemente
  .hero h1 {
    font-size: 2rem;
  }
•	Título más pequeño en tablets (2rem vs 2.5rem)
  .categorias {
    gap: 0.75rem;
  }
•	Menos espacio entre botones de categoría
  .cat-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
•	Botones de categoría más compactos
  .grid {
    grid-template-columns: 1fr;
  }
•	Grid de recetas a una sola columna en tablets
  .contacto-contenedor {
    grid-template-columns: 1fr;
  }
•	Página de contacto a una columna
•	Información arriba, formulario abajo
  .historial-item {
    flex-direction: column;
  }
•	Items de historial cambian de horizontal a vertical
•	Imagen arriba, info abajo
  .historial-item img {
    width: 100%;
    height: 250px;
  }
•	Imagen ocupa todo el ancho
•	Altura fija de 250px
  .robot-chat {
    width: calc(100% - 2rem);
    right: 1rem;
    left: 1rem;
  }
•	calc(100% - 2rem): Ancho total menos 2rem (1rem de cada lado)
•	right: 1rem; left: 1rem: Centrado con margen
•	El chat ocupa casi todo el ancho en móviles
  .modal-contenido {
    padding: 1.5rem;
  }
•	Menos padding en modales
  .modal-img {
    height: 200px;
  }
•	Imagen del modal más pequeña (200px vs 300px)
  .modal-contenedor-receta {
    flex-direction: column;
    max-height: none;
    overflow-y: auto;
  }
•	flex-direction: column: Las dos columnas se apilan verticalmente
•	max-height: none: Sin límite de altura
•	overflow-y: auto: Scroll en toda la página
  .modal-col {
    max-height: none;
  }
•	Quita el límite de altura de las columnas
  .modal-izq,
  .modal-der {
    flex: 1;
  }
}
•	Ambas columnas tienen el mismo tamaño cuando están apiladas
________________________________________
SECCIÓN 27: RESPONSIVE MÓVILES (640px y MENOS)
@media (max-width: 640px) {
  .main {
    padding: 1rem;
  }
•	Menos padding en el contenedor principal
  .filtro-btns {
    gap: 0.5rem;
  }
•	Menos espacio entre botones de filtro
  .filtro-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
•	Botones de filtro más pequeños
  .auth-card {
    padding: 2rem 1.5rem;
  }
•	Menos padding en formularios de autenticación
  .footer {
    padding: 2rem 1rem;
  }
•	Footer más compacto
  .footer-contenido {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
•	Footer a una sola columna
•	Todas las secciones apiladas verticalmente

