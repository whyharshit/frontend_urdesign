import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './app/App';
import { getPageMetadata } from './app/metadata';
import { CITIES, SITE_URL } from './config/catalog';
import { seedProviders } from './data/seed';
import { slugify } from './lib/format';

const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

export function render(url: string) {
  const metadata = getPageMetadata(url);
  const title = escape(metadata.title);
  const description = escape(metadata.description);
  // Public pages get a canonical link and a link-preview card; private and missing pages don't.
  const indexable = !metadata.private && metadata.status === 200;
  const canonical = `${SITE_URL}${metadata.path}`;
  const share = indexable
    ? [
        `<link rel="canonical" href="${escape(canonical)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="UrDesigner" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${description}" />`,
        `<meta property="og:url" content="${escape(canonical)}" />`,
        `<meta property="og:image" content="${escape(SITE_URL + metadata.image)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
      ].join('')
    : '<meta name="robots" content="noindex,nofollow" />';
  return {
    html: renderToString(
      <StaticRouter location={url}>
        <App />
      </StaticRouter>,
    ),
    head: `<title>${title}</title><meta name="description" content="${description}" />${share}`,
    status: metadata.status,
  };
}

/** Every public, indexable page: home, search (all India and per city), profiles and projects. */
export function sitemap() {
  const published = seedProviders.filter((p) => p.status === 'published');
  const cities = CITIES.filter((c) =>
    published.some((p) => [p.city, ...(p.workCities || [])].some((w) => slugify(w) === slugify(c))),
  );
  const paths = [
    '/',
    '/architects',
    ...cities.map((c) => `/architects/${slugify(c)}`),
    ...published.flatMap((p) => [
      `/p/${p.slug}`,
      ...p.projects.map((project) => `/p/${p.slug}/project/${project.id}`),
    ]),
    '/terms',
    '/privacy',
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((path) => `  <url><loc>${escape(SITE_URL + path)}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
}

export const robots = () =>
  `User-agent: *\nDisallow: /dashboard\nDisallow: /admin\nDisallow: /my-enquiries\nDisallow: /enquiry/\nDisallow: /playground\nSitemap: ${SITE_URL}/sitemap.xml\n`;
