# AGENTS.md

Healthy Help — SPA de nutrición (React 19 + Vite) respaldada por una API Express 5 / Mongoose. Operada desde Colombia; todas las marcas de tiempo usan `America/Bogota`.

## Estructura (monorepo sin workspaces)
Dos proyectos de Node independientes comparten este repositorio solo por convención de carpetas — no hay workspaces de npm/pnpm/yarn ni scripts en la raíz.

- `client/` — React 19 + Vite 7 + react-router-dom 7 + ESLint 9. Entrada: `src/main.jsx` → `src/App.jsx`. Cliente de API en `src/api/axios.js`.
- `server/` — Express 5, Mongoose 8, Passport (JWT + Google OAuth 2.0), Cloudinary, OpenAI SDK (apunta a MiniMax-M3 vía `https://api.minimax.io/v1`), Resend. Entrada: `server.js` (puerto 5000). 11 routers montados bajo `/api/*` (ver `server.js`).
- El `package.json` raíz solo contiene `sharp` para el helper `compress-images.js`. No agregues dependencias de client/server aquí.

## Instalación y ejecución
Instalar por paquete; la raíz no tiene dependencias de app instalables:

```
cd server && npm install
cd ../client && npm install
```

Servidores de desarrollo (dos terminales):

- Backend: `cd server && npm run dev` (nodemon en `:5000`)
- Frontend: `cd client && npm run dev` (Vite en `:5173`)

`App.jsx` hace ping a `/api/terms` hasta 10 veces antes de renderizar datos — las páginas quedan vacías hasta que el backend responde. Iniciá primero el servidor.

## Reglas obligatorias de edición

- Hablar en el idioma español

- No poner comentarios en el código

- Antes de escribir cualquier selector condicional por tema (claro/oscuro), buscá primero dónde se aplica la clase que lo controla:
   grep -rn "modo-oscuro" src/App.jsx src/**/*.jsx | grep -i "classname\|classlist"
   Confirmá si la clase va en <html>, <body>, o algún contenedor específico, ANTES de decidir si usar :root, body, o un selector de clase directo.

- La convención de este proyecto (ya la vas a encontrar documentada en AGENTS.md) es:
    Oscuro: .modo-oscuro .selector
    Claro:  body:not(.modo-oscuro) .selector
   NUNCA uses :root:not(.modo-oscuro) en este proyecto. Si en algún momento dudás si :root es lo correcto, no lo uses sin antes confirmar en qué elemento vive la clase.

- Cuando "separes" o reescribas selectores de tema (claro/oscuro) en cualquier archivo, tu verificación de éxito no puede ser solo "stylelint pasa" ni "no hay duplicados". Stylelint valida sintaxis, no lógica de aplicación. Tenés que verificar también:
   a) Que el selector de cada bloque solo puede ser verdadero en el tema que le corresponde (no ambos a la vez, no siempre).
   b) Que la especificidad de ambos bloques (claro vs oscuro) sea comparable, para que no haya uno que gane siempre en la cascada sin importar el orden en el archivo.

- Si un cambio de color "no se refleja" después de editar y confirmar (sintaxis correcta, sin duplicados, servidor corriendo bien), antes de asumir caché o bug de Vite, revisá la especificidad y validez lógica del selector como primera hipótesis, no la última. Es una causa mucho más común de "esto no se aplica nunca" que problemas de build.

### CSS
- Antes de editar cualquier archivo .css, leelo COMPLETO (no solo grep de fragmentos) para
  entender selectores existentes relacionados al cambio pedido.
- Nunca dejes dos definiciones del mismo selector en el archivo. Si encontrás una duplicada
  al editar, eliminá la vieja en la misma operación.
- Modo claro y modo oscuro deben vivir en bloques separados y comentados
  (/* MODO CLARO */ / /* MODO OSCURO */), nunca intercalados.
- No hagas commit de cambios en archivos .css hasta después de correr y resolver la
  validación de stylelint sobre esos archivos.
- Después de editar cualquier archivo .css, corré:
  npx stylelint $(git diff --name-only --diff-filter=ACM -- '*.css')
  Si no hay archivos .css modificados, este comando no revisa nada (no es un error).
  Si reporta duplicados o errores, corregilos antes de dar la tarea por terminada.
- Al terminar, verificá con grep -c que cada selector que tocaste aparece exactamente 1 vez,
  y reportá ese conteo en tu respuesta final.

### Modo oscuro (convención del proyecto)
La clase `.modo-oscuro` se aplica sobre `<body>`, NUNCA sobre `<html>`. Para estilos
condicionales por tema, usá siempre:
- Oscuro: `.modo-oscuro .selector`
- Claro:  `body:not(.modo-oscuro) .selector`
NUNCA uses `:root:not(.modo-oscuro)` — `:root` es `<html>`, no `<body>`, así que esa
condición es siempre verdadera y rompe el modo oscuro silenciosamente (bug real ya
ocurrido en FiltrosSalud.css).

### Git
- NUNCA ejecutes git checkout, git reset, git restore, ni git stash sin pedirme
  confirmación explícita primero, sin importar la situación.

### Diagnóstico de "no se reflejan los cambios"
- Antes de asumir que es caché del navegador, corré:
  ps aux | grep -E "vite|node" | grep -v grep
  Si hay más de un proceso del mismo dev server, matalos todos y arrancá uno limpio
  ANTES de seguir diagnosticando.

## Verificación
- Lint: `cd client && npm run lint` (eslint .). El servidor no tiene script de lint.
- Sin typecheck (JS plano, sin tsconfig). No corras `tsc`.
- Sin ejecutor de pruebas (sin configuraciones de jest/vitest/playwright). No corras `npm test`.
- Sin workflows de CI (`.github/` no existe). Sin hooks de pre-commit.

### React Doctor
- Después de cualquier cambio en archivos .jsx o .js del client, corré:
  cd client && npm run doctor
- El score no debe bajar respecto al último commit. Si hay problemas nuevos introducidos
  por el cambio, corregilos antes de dar la tarea por terminada.
- Para arreglar por categorías (orden recomendado): performance → architecture → security.
No hagas commit hasta que npm run doctor pase sin nuevos problemas.

## Entorno
- `client/.env` debe definir `VITE_API_URL` (el valor por defecto en `src/api/axios.js` es `http://localhost:5000/api`). Las variables sin el prefijo `VITE_` no se exponen al bundle.
- `server/.env` debe definir: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `MINIMAX_API_KEY`, `PORT`, `NODE_ENV`. Las variables faltantes hacen fallar el arranque.
- `.env` está ignorado por git en la raíz, en client y en server.

## Particularidades del servidor
- Al conectar con Mongo, `server.js` llama automáticamente a `scripts/seedTerms.js` — inserta los Términos v1.0.0 solo cuando la colección `termsdocuments` está vacía. No hace nada después de eso.
- Inicialización única del admin: `cd server && node scripts/initSuperAdmin.js` (usa las variables de entorno `SUPER_ADMIN_*`). El script es idempotente y termina con código 0 si el admin ya existe.
- La lista blanca de CORS está codificada directamente en `server.js` — agregar un nuevo origen de frontend requiere editar ese archivo, no solo una variable de entorno.
- Límites de tasa (también codificados directamente): 500 solicitudes/15min por IP en `/api/`, 20/15min en `/api/auth/login` en producción (200 en desarrollo).
- Límite de cuerpo de 10mb. El sanitizador XSS (paquete `xss`) recorre cada `req.body` antes de los manejadores de rutas.
- Los archivos estáticos subidos se sirven desde `server/uploads/` en `/uploads`.
- El final de `server.js` registra en el log `AdminLog.schema.path('action').enumValues` — eso es una línea de depuración olvidada, no una salida de arranque intencional.

## Particularidades del cliente
- Cada vista lazy está envuelta por `safeLazy` y `SinConexionBoundary` en `App.jsx` para que los fallos de importación dinámica (sin conexión) degraden silenciosamente en lugar de romper la SPA. Preservá ambos al agregar nuevas rutas.
- Los manejadores personalizados de `wheel`/scroll/clic-medio en `App.jsx` limitan el delta de la rueda y omiten una larga lista de selectores de modales — tocar esto sin releer la lista de selectores hace retroceder el comportamiento de scroll en los modales.
- El estado de autenticación vive en `src/context/AuthProvider.jsx` (lee `localStorage.token`, ejecuta cierre de sesión automático por inactividad, refresca el usuario vía `/api/auth/check`). El interceptor 401 de Axios limpia el token y redirige a `/login` (saltando las rutas públicas listadas en `src/api/axios.js`).
- El consentimiento de cookies y el versionado de Términos tienen alternativas de cookie/localStorage/sessionStorage orquestadas en `App.jsx` (`getPersisted`/`setPersisted`/`migrarSessionACookies`). Refactorizar con cuidado — están acoplados al contrato de persistencia usado por `useTermsGuard.js`.
- Las rutas son mayormente en español (`VistaInicio`, `VistaSeguimiento`, `Dashboard`, etc.); mantené las nuevas rutas consistentes.
- Imágenes: nube de Cloudinary `dqwqmipco` para subidas; los avatares de Google se actualizan automáticamente a 400px en `server/config/passport.js`.

## Consejos de despliegue
- Tanto el client como el server están desplegados en Render.
  - Frontend: https://www.healthyhelpoficial.com/
  - Backend: https://api.healthyhelpoficial.com/
- Los dominios de frontend de producción están codificados directamente en el CORS de `server.js`: `healthyhelpoficial.com`, `api.healthyhelpoficial.com`.
- Los finales de línea LF se aplican mediante `.gitattributes`; mantené los archivos nuevos en LF.

## Qué omitir
- `client/README.md` es un manual de 2900+ líneas de prosa en español, componente por componente, no una guía de instalación. Tratá el código como la fuente de verdad, no el README.
- `client/src/assets/` es arte binario pesado — no intentes leerlo.
- `.agents/skills/` son paquetes de habilidades comunitarios (webapp-testing, security-review, git-commit, etc.) — se cargan automáticamente mediante la herramienta `skill` cuando corresponde; ignorar salvo que una tarea coincida.