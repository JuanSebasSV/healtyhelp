# AGENTS.md — HealtyHelp

Repo-level guidance for OpenCode sessions. Project overview / Spanish product documentation lives in `client/README.md` — do not duplicate it here.

## Layout

Three independent npm projects (not workspaces — no root `npm install` drives children):

- **root** — only `sharp` + `compress-images.js` (standalone image CLI). No app code.
- `client/` — React 19 + Vite SPA (`name: healtyhelp`).
- `server/` — Express 5 + MongoDB API (`name: healthyhelp-server`).

Real entrypoints:
- `server/server.js` → mounts `/api/{auth,admin,users,recipes,consumos,chat,terms,notifications,utils,recomendaciones,contacto,favoritos}`.
- `client/src/main.jsx` → `client/src/App.jsx`.

## Install & run

Three installs required (no workspaces):

```
npm install                 # root (only sharp, for compress-images.js)
(cd server && npm install)
(cd client && npm install)
```

Dev (two terminals):

```
(cd server && npm run dev)  # nodemon on PORT (default 5000)
(cd client && npm run dev)  # Vite on :5173
```

Other useful commands (run in the relevant subdir):

- `(cd server && npm start)` — production node
- `(cd client && npm run build)` / `(cd client && npm run preview)`
- `(cd client && npm run lint)` — ESLint flat config at `client/eslint.config.js`
- `node compress-images.js [inputDir] [outputDir]` — root image→WebP utility, sharp-based

**There is no test runner** (no `test` script in either package.json, no Jest/Vitest config) and no typecheck (no TS). Verification = lint (client) + manual run.

## First-time server setup gotchas

`server/server.js` calls `process.exit(1)` if `MONGO_URI` fails — the server will not start without a reachable MongoDB.

On first successful boot the server auto-runs `server/scripts/seedTerms.js` (idempotent — only inserts if `TermsDocument` collection is empty). No action needed.

The **first admin** is not auto-created. Run it manually, once:

```
(cd server && node scripts/initSuperAdmin.js)
```

It reads `SUPER_ADMIN_*` from `server/.env` and exits if the email already exists. After login, change that password immediately (the script logs a warning to that effect).

## Environment files

`.env` files are gitignored at every level. The committed `*.example` is not used — variables are documented inline in `server/.env` (don't commit your real one; rotate any secrets that ever leaked).

- `server/.env` — required: `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `SUPER_ADMIN_*`, `RESEND_API_KEY`, `CLOUDINARY_*`, `GROQ_API_KEY`. Optional: `PORT`, `FRONTEND_URL`, `BACKEND_URL`, `EMAIL_FROM`, `CONTACT_EMAIL`, `NODE_ENV`.
- `client/.env` — only `VITE_API_URL` (consumed in `client/src/api/axios.js`, defaults to `http://localhost:5000/api`).

Google OAuth callback URL is derived as `${BACKEND_URL}/api/auth/google/callback` (`server/config/passport.js`) — keep `BACKEND_URL` in sync with the actual public host, or auth will silently fail.

## Security middleware (server)

Don't remove or reorder these without a reason — they are wired in `server/server.js:15-62`:

- `cors` allowlist (localhost:5173, localhost:3000, plus two production origins)
- `helmet`, `hpp`
- `express-rate-limit`: 500/15min on `/api/*`, stricter (200 dev / 20 prod) on `/api/auth/login`
- Global XSS sanitizer that recursively walks `req.body` strings via `xss`
- `express.json({ limit: '10mb' })` + `urlencoded` same limit

JWT is read from `Authorization: Bearer …` on the client side (`client/src/api/axios.js`); 401s clear `localStorage.token`+`user` and redirect to `/login` unless on a public route.

## File / formatting conventions

- `.gitattributes` forces LF on `*.js`, `*.jsx`, `*.css`, `*.html`, `*.json`. Don't commit CRLF.
- ESLint (`client/eslint.config.js`) tolerates unused vars matching `^[A-Z_]` — use that for intentionally-exported-only constants.
- `client/src/components/**` co-locates each component with its `.css` (e.g. `Login.jsx` + `Login.css`). Keep the pairing when adding new components.
- Routes on the server are split per resource under `server/routes/` and per-controller under `server/controllers/`. Mongoose models live in `server/models/`.

## MCP / skills

- `opencode.json` enables `codebase-memory-mcp`. Prefer its graph tools (`search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, `get_architecture`) over grep/glob for code discovery.
- A large skill library is locked under `.agents/skills/` (see `skills-lock.json`) — load via the `skill` tool when the task matches (e.g. `web-design-guidelines`, `security-review`, `vercel-react-best-practices`, `nodejs-backend-patterns`, `webapp-testing`).
- OpenCode subagents already configured in `opencode.json`: `explore`, `scout`, `code-reviewer`. `plan` agent has edit+bash denied — use it for read-only planning.

## Things to watch for

- `server/scripts/seedTerms.js` runs on every boot — only writes when collection is empty, so it's safe to restart, but editing it changes the seeded payload silently.
- No CI workflows exist (`.github/` is absent). Don't assume `npm test` exists.
- `client/src/components/layout/PrivateRoute.jsx` accepts a `?preview=true` query param that bypasses auth — leave that alone unless you're explicitly changing preview behavior.
- Several Spanish strings are hardcoded in user-facing UI; keep new UI strings consistent with the existing tone and language unless told otherwise.