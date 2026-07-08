# AGENTS.md

Healthy Help — nutrition SPA (React 19 + Vite) backed by an Express 5 / Mongoose API. Operated from Colombia; all timestamps use `America/Bogota`.

## Layout (monorepo without workspaces)
Two independent Node projects share this repo via folder convention only — there are no npm/pnpm/yarn workspaces and no root scripts.

- `client/` — React 19 + Vite 7 + react-router-dom 7 + ESLint 9. Entry: `src/main.jsx` → `src/App.jsx`. API client at `src/api/axios.js`.
- `server/` — Express 5, Mongoose 8, Passport (JWT + Google OAuth 2.0), Cloudinary, Groq SDK, Resend. Entry: `server.js` (port 5000). 11 routers mounted under `/api/*` (see `server.js`).
- Root `package.json` carries only `sharp` for the `compress-images.js` helper. Don't add client/server deps here.

## Install & run
Install per package; root has no installable app deps:

```
cd server && npm install
cd ../client && npm install
```

Dev servers (two terminals):

- Backend: `cd server && npm run dev` (nodemon on `:5000`)
- Frontend: `cd client && npm run dev` (Vite on `:5173`)

`App.jsx` pings `/api/terms` up to 10× before rendering data — pages stay empty until the backend answers. Start the server first.

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

## Verification
- Lint: `cd client && npm run lint` (eslint .). Server has no lint script.
- No typecheck (plain JS, no tsconfig). Don't run `tsc`.
- No test runner (no jest/vitest/playwright configs). Don't run `npm test`.
- No CI workflows (`.github/` does not exist). No pre-commit hooks.

## Environment
- `client/.env` must define `VITE_API_URL` (default fallback in `src/api/axios.js` is `http://localhost:5000/api`). Vars without the `VITE_` prefix are not exposed to the bundle.
- `server/.env` must define: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME`, `RESEND_API_KEY`, `EMAIL_FROM`, `CONTACT_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GROQ_API_KEY`, `PORT`, `NODE_ENV`. Missing vars crash startup.
- `.env` is gitignored at root, client, and server.

## Server quirks
- On Mongo connect, `server.js` calls `scripts/seedTerms.js` automatically — inserts Terms v1.0.0 only when the `termsdocuments` collection is empty. No-op thereafter.
- One-time admin bootstrap: `cd server && node scripts/initSuperAdmin.js` (uses `SUPER_ADMIN_*` env vars). Script is idempotent and exits 0 if admin exists.
- CORS whitelist is hardcoded in `server.js` — adding a new frontend origin requires editing that file, not just an env var.
- Rate limits (also hardcoded): 500 req/15min per IP on `/api/`, 20/15min on `/api/auth/login` in production (200 in dev).
- Body limit 10mb. XSS sanitizer (`xss` package) walks every `req.body` before route handlers.
- Static uploads served from `server/uploads/` at `/uploads`.
- The tail of `server.js` logs `AdminLog.schema.path('action').enumValues` — that's a leftover debug line, not intentional startup output.

## Client quirks
- Every lazy view is wrapped by `safeLazy` and `SinConexionBoundary` in `App.jsx` so dynamic-import failures (offline) degrade silently instead of crashing the SPA. Preserve both when adding new routes.
- Custom `wheel`/scroll/middle-click handlers in `App.jsx` cap wheel delta and skip a long list of modal selectors — touching these without re-reading the selector list regresses scroll behavior in modals.
- Auth state lives in `src/context/AuthProvider.jsx` (reads `localStorage.token`, runs inactivity auto-logout, refreshes user via `/api/auth/check`). Axios 401 interceptor clears the token and redirects to `/login` (skipping public routes listed in `src/api/axios.js`).
- Cookie consent + Terms versioning have cookie/localStorage/sessionStorage fallbacks orchestrated in `App.jsx` (`getPersisted`/`setPersisted`/`migrarSessionACookies`). Refactor carefully — these are coupled to the persistence contract used by `useTermsGuard.js`.
- Routes are mostly Spanish (`VistaInicio`, `VistaSeguimiento`, `Dashboard`, etc.); keep new routes consistent.
- Images: Cloudinary cloud `dqwqmipco` for uploads; Google avatars are auto-upgraded to 400px in `server/config/passport.js`.

## Deploy hints
- Both client and server are deployed on Render.
  - Frontend: https://www.healthyhelpoficial.com/
  - Backend: https://api.healthyhelpoficial.com/
- Production frontend domains hardcoded in `server.js` CORS: `healthyhelpoficial.com`, `api.healthyhelpoficial.com`.
- LF line endings are enforced via `.gitattributes`; keep new files LF.

## What to skip
- `client/README.md` is a 2900+ line manual of component-by-component Spanish prose, not a setup guide. Treat the code as source of truth, not the README.
- `client/src/assets/` is large binary art — don't try to read it.
- `.agents/skills/` are community skill packs (webapp-testing, security-review, git-commit, etc.) — auto-loaded by the `skill` tool when relevant; ignore unless a task matches.
