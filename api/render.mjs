import fs from 'node:fs/promises';
import path from 'node:path';
import { render, robots, sitemap } from '../dist/server/entry-server.js';

// Vercel entry: same SSR as server/index.mjs, for every non-static route.
const templatePath = path.join(process.cwd(), 'dist/template.html');
let template;

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  try {
    template ??= await fs.readFile(templatePath, 'utf8');
    const url = new URL(req.url, 'http://localhost');
    const route = url.searchParams.get('__path') ?? '/';
    url.searchParams.delete('__path');
    if (route === '/robots.txt' || route === '/sitemap.xml') {
      const xml = route === '/sitemap.xml';
      return res
        .status(200)
        .setHeader('Content-Type', xml ? 'application/xml' : 'text/plain')
        .setHeader('Cache-Control', 'public, max-age=3600')
        .end(xml ? sitemap() : robots());
    }
    const rendered = render(route + url.search);
    res
      .status(rendered.status)
      .setHeader('Content-Type', 'text/html')
      .setHeader('Cache-Control', 'no-store')
      .end(
        template
          .replace('<!--app-head-->', rendered.head)
          .replace('<!--app-html-->', rendered.html),
      );
  } catch (error) {
    console.error(error);
    res.status(500).send('The page could not be loaded. Please refresh and try again.');
  }
}
