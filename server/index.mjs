import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// This server renders the frontend only. Business endpoints belong in /backend.
const root = fileURLToPath(new URL('..', import.meta.url));
const production = process.argv.includes('--production');
const port = Number(process.env.PORT || 5173);
const app = express();
app.disable('x-powered-by');
let vite;
if (production) {
  app.use(
    '/assets',
    express.static(path.join(root, 'dist/client/assets'), { immutable: true, maxAge: '1y' }),
  );
  app.use(express.static(path.join(root, 'dist/client'), { index: false }));
} else {
  const { createServer } = await import('vite');
  vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
  app.use(vite.middlewares);
}
app.use(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.sendStatus(405);
  if (/\.(?:jpg|png|webp|svg|ico|js|css|woff2?)$/i.test(req.path)) return res.sendStatus(404);
  try {
    let template = await fs.readFile(
      path.join(root, production ? 'dist/client/index.html' : 'index.html'),
      'utf8',
    );
    if (vite) template = await vite.transformIndexHtml(req.originalUrl, template);
    const { render, robots, sitemap } = vite
      ? await vite.ssrLoadModule('/src/entry-server.tsx')
      : await import('../dist/server/entry-server.js');
    if (req.path === '/robots.txt') return res.type('text/plain').send(robots());
    if (req.path === '/sitemap.xml') return res.type('application/xml').send(sitemap());
    const rendered = render(req.originalUrl);
    res
      .status(rendered.status)
      .set('Content-Type', 'text/html')
      .set('Cache-Control', 'no-store')
      .end(
        template
          .replace('<!--app-head-->', rendered.head)
          .replace('<!--app-html-->', rendered.html),
      );
  } catch (error) {
    vite?.ssrFixStacktrace(error);
    console.error(error);
    res.status(500).send('The page could not be loaded. Please refresh and try again.');
  }
});
const server = app.listen(port, '127.0.0.1', () =>
  console.log(`UrDesigner frontend: http://localhost:${port}`),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    await vite?.close();
    server.close(() => process.exit(0));
  });
