# AGENTS.md — Healthy Help

Monorepo with two independent Node packages. **No** root `npm` workspace: each package installs and runs on its own.

## Layout

- `client/` — Vite 7 + React 19 + React Router 7 (ESM, JSX, no TS). Entry: `src/main.jsx` → `src/App.jsx`.
- `server/` — Express 5 + Mongoose 8 (CommonJS, no TS). Entry: `server.js`.
- `images/` — image assets. Output of root utility goes to `images/compressed/`.
- `compress-images.js` — standalone root script. Only declares `sharp` (root `package.json` has **only** `sharp` as a dep).
- `.agents/skills/` — installed agent skills (see `skills-lock.json`).

## Dev commands

```bash
# Server (port 5000)
cd server
npm install
npm run dev          # nodemon server.js
npm start            # node server.js

# Client (port 5173)
cd client
npm install
npm run dev          # vite
npm run build        # vite build → dist/
npm run lint         # eslint . (flat config)
npm run preview

# One-off image compression (root)
node compress-images.js                    # ./images → ./images/compressed
node compress-images.js ./fotos ./salida   # custom in/out
```

There is **no test script, no typecheck, no formatter, no CI workflow**. Do not invent them.

## Server notes

- Connects to MongoDB via `MONGO_URI`. Connection failure exits the process (`server.js:80`).
- On successful connect, **automatically seeds** `TermsDocument v1.0.0` via `scripts/seedTerms.js` if the collection is empty (`server.js:71`).
- One-time super-admin creation (no `npm` script — run directly):
  ```bash
  cd server && node scripts/initSuperAdmin.js
  ```
  Uses `SUPER_ADMIN_*` env vars. Skips if the email already exists.
- Security middleware order in `server.js`: `cors` → `helmet` → `hpp` → `express-rate-limit` (500/15min on `/api/`, stricter on `/api/auth/login`: 20 prod / 200 dev) → JSON body (10MB) → XSS sanitizer on body → `passport.initialize()`. Static `/uploads` is served from `__dirname/uploads`.
- Auth: JWT bearer (`Authorization: Bearer <token>`), Google OAuth via `/api/auth/google` (`config/passport.js`). Middleware: `protect`, `admin`, `restrictTo(...roles)` in `middleware/auth.js`.
- Cloudinary: `uploadAvatar` (2MB, `healtyhelp/avatars`, 400×400) and `uploadResena` (5MB, `healtyhelp/resenas`, 1200×1200). Folder and limits are defined in `config/cloudinary.js`.
- Routes mounted in `server.js:86-97`. Many controllers/middleware live directly under `controllers/` and `middleware/` (no `src/` wrapper).

## Client notes

- API base URL: `import.meta.env.VITE_API_URL` (`client/.env` → `http://localhost:5000/api`). 10s timeout.
- `src/api/axios.js` adds `Authorization` from `localStorage.token` on every request; on `401` it clears token+user and redirects to `/login` unless the current path is public (`/login`, `/registro`, `/recuperar`, `/reset-password`, `/verificar-email`, `/`).
- All routes are `lazy()`-loaded in `App.jsx`. Wrap them in `<Suspense>` if you add new top-level components.
- localStorage/cookie keys: `token`, `user`, `hh_cookie_consent`, `hh_terms_accepted`, `hh_terms_version` (declared in both `App.jsx:57-60` and `hooks/useTermsGuard.js:6-8` — keep in sync if you change them).
- SPA fallback for static hosts: `client/public/_redirects` (`/*    /index.html   200`). Don't delete when deploying to Netlify/Netlify-style hosts.
- ESLint flat config (`eslint.config.js`). Unused vars prefixed with `^[A-Z_]` are allowed — use for React components/constants.
- Style: co-located CSS per component (`Navbar.css` next to `Navbar.jsx`, etc.). No CSS-in-JS, no Tailwind.

## Environment

- Server `.env` keys: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `PORT`, `FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SUPER_ADMIN_*`, `EMAIL_FROM`, `RESEND_API_KEY`, `CONTACT_EMAIL`, `NODE_ENV`, `CLOUDINARY_*`, `GROQ_API_KEY`.
- Client `.env` key: `VITE_API_URL`.

## File / repo conventions

- `.gitattributes` forces **LF** for `.js`, `.jsx`, `.css`, `.html`, `.json`. Match this when adding new code files.
- `.gitignore` excludes `node_modules/`, `.env`, `dist/`.
- Code comments and many UI strings are in **Spanish** — match the existing language when adding user-facing copy.

## Things that will burn you

- `server/.env` and `client/.env` are tracked in git and contain real-looking production credentials (Mongo URI with password, JWT secret, Google OAuth, Cloudinary, Resend, Groq, super-admin password). Treat them as compromised: **rotate the keys before sharing the repo or pushing anywhere public**. Do not commit new secrets — use `.env` (gitignored) + a template.
- The root `package.json` is **not** a workspace manifest. Don't add shared deps there expecting them to be installed by `npm install` in subpackages.
- `server.js:132-133` runs `require('./models/AdminLog')` and prints its enum at startup — this is intentional startup logging, not a bug.
- `scripts/seedTerms.js` is idempotent (no-op if any `TermsDocument` exists) but the **content is hardcoded in Spanish** — if you change it, you're effectively changing the published v1 terms.
- CORS allowlist in `server.js` includes `https://healthyhelpoficial.com/` (trailing slash) and `https://api.healthyhelpoficial.com/api` — keep these in sync with the production hostnames.
- `motorRecomendaciones.js` is ~67KB and central — changes there are high-risk; read it fully before editing.
- `client/README.md` is a generated Spanish doc of `App.jsx` (~91KB) — not a setup guide. The repo has no real top-level README.

## Available skills (`.agents/skills/`)

Loaded via `opencode.json`. Relevant for this repo:
- `nodejs-backend-patterns` — Express/Mongoose work.
- `vercel-react-best-practices` — React/Vite client work.
- `security-review` — auth, XSS, rate-limit, secret handling audits.
- `responsive-web-design`, `fixing-motion-performance`, `web-design-guidelines` — UI work.
- `webapp-testing` — local Playwright checks (no test suite ships in the repo).
- `cavecrew`, `git-commit` — workflow helpers.