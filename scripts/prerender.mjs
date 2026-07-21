#!/usr/bin/env node
import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'client', 'dist');
const CLIENT_NM = path.join(ROOT, 'client', 'node_modules');
const requireFromClient = createRequire(path.join(CLIENT_NM, 'puppeteer'));
const puppeteer = requireFromClient('puppeteer');

const PORT = 4179;
const BASE_URL = `http://localhost:${PORT}`;
const RENDER_TIMEOUT_MS = 20000;

const ROUTES = [
  '/',
  '/login',
  '/registro',
  '/recuperar',
  '/reset-password',
  '/verificar-email',
  '/contacto',
];

const MOCK_RESPONSES = {
  '/api/terms': {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      terms: { _id: 'prerender', version: '2.2.0', content: '<p>Terms</p>', activeVersion: '2.2.0' },
      activeVersion: '2.2.0',
    }),
  },
  '/api/auth/me': {
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ user: null }),
  },
  '/api/auth/check': {
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ user: null }),
  },
  '/api/favoritos': {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ favoritos: [] }),
  },
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return MIME[ext] || 'application/octet-stream';
}

async function startStaticServer() {
  const distIndexHtml = path.join(DIST, 'index.html');
  const html = await fs.readFile(distIndexHtml, 'utf8');

  const server = createServer(async (req, res) => {
    const urlPath = req.url.split('?')[0];

    for (const [mockPath, mock] of Object.entries(MOCK_RESPONSES)) {
      if (urlPath === mockPath) {
        res.writeHead(mock.status, {
          'Content-Type': mock.contentType,
          'Access-Control-Allow-Origin': '*',
        });
        res.end(mock.body);
        return;
      }
    }

    let filePath = path.join(DIST, urlPath);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      filePath = distIndexHtml;
    }

    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': mimeFor(filePath) });
      res.end(data);
    } catch {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    }
  });

  await new Promise((resolve) => server.listen(PORT, resolve));
  return server;
}

async function prerenderRoute(browser, route) {
  const url = `${BASE_URL}${route}`;
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const rUrl = req.url();
    if (rUrl.startsWith('http://localhost:5000/')) {
      const apiPath = rUrl.replace('http://localhost:5000', '');
      const corsHeaders = {
        'Access-Control-Allow-Origin': BASE_URL,
        'Access-Control-Allow-Credentials': 'true',
      };
      if (MOCK_RESPONSES[apiPath]) {
        const m = MOCK_RESPONSES[apiPath];
        req.respond({
          status: m.status,
          contentType: m.contentType,
          body: m.body,
          headers: corsHeaders,
        });
        return;
      }
      if (apiPath.startsWith('/api/')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
          headers: corsHeaders,
        });
        return;
      }
    }
    req.continue();
  });

  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error') {
      const text = msg.text();
      if (text.includes('Failed to load resource')) return;
      console.log(`    [${type}] ${text.slice(0, 200)}`);
    }
  });
  page.on('pageerror', (err) => {
    console.log(`    [pageerror] ${err.message.slice(0, 300)}`);
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT_MS });
  } catch (e2) {
    console.error(`  ✗ ${route} → ${e2.message.split('\n')[0]}`);
    await page.close();
    return null;
  }

  try {
    await page.waitForFunction(
      function () {
        var root = document.getElementById('root');
        return root && root.children && root.children.length > 0 && root.innerText.length > 50;
      },
      { timeout: 15000 }
    );
  } catch (e) {
    console.log(`    [timeout] root vacío tras 15s`);
  }

  await new Promise((r) => setTimeout(r, 1200));

  const html = await page.content();
  const rootLen = await page.evaluate(function () {
    var r = document.getElementById('root');
    return r && r.innerHTML ? r.innerHTML.length : 0;
  });
  console.log(`    [root innerHTML] ${rootLen} chars`);

  await page.close();
  return html;
}

async function main() {
  console.log(`▶ Prerenderizando ${ROUTES.length} rutas contra ${BASE_URL}`);

  const server = await startStaticServer();

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: process.env.PUPPETEER_CHROME || '/snap/bin/chromium',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    for (const route of ROUTES) {
      process.stdout.write(`  · ${route}\n`);
      const html = await prerenderRoute(browser, route);
      if (!html) continue;

      const outDir = path.join(DIST, route === '/' ? '' : route);
      await fs.mkdir(outDir, { recursive: true });
      const outPath = path.join(outDir, 'index.html');
      await fs.writeFile(outPath, html, 'utf8');
      console.log(`    → ${path.relative(DIST, outPath)} (${(html.length / 1024).toFixed(1)} KB)`);
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  console.log('✓ Pre-render completo');
}

main().catch((e) => {
  console.error('✗ Error:', e);
  process.exit(1);
});
