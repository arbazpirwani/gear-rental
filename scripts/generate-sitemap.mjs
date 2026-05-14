// Build-time sitemap + robots generator. Reads the seed product list and
// emits dist/sitemap.xml + dist/robots.txt after `vite build`.
//
// If you point a custom domain at the site, update SITE_URL here and in
// src/lib/seo.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE_URL = 'https://arbazpirwani.github.io/gear-rental';

// Parse product IDs straight from the seed file to avoid pulling TS tooling
// into a build script. Looks for `id: '...'` lines.
const seed = readFileSync(resolve(ROOT, 'src/data/products.ts'), 'utf8');
const productIds = [...seed.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);

const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/about`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE_URL}/agreement`, priority: '0.4', changefreq: 'monthly' },
  ...productIds.map((id) => ({
    loc: `${SITE_URL}/product/${id}`,
    priority: '0.8',
    changefreq: 'weekly',
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart
Disallow: /checkout
Disallow: /thank-you
Disallow: /report

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');
writeFileSync(resolve(DIST, 'robots.txt'), robots, 'utf8');
console.log(`Wrote sitemap.xml (${urls.length} urls) and robots.txt`);
