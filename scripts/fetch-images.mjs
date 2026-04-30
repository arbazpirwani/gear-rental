// Fetch product photos from Wikimedia Commons.
// Run: node scripts/fetch-images.mjs
// For products missing on Commons, falls back to keeping the SVG illustration.
import { writeFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'images');
const UA = 'gear-rental/0.1 (https://github.com/arbazpirwani/gear-rental; arbazpirwani@gmail.com)';

// Each entry: id matches the product id, search is a Commons file-search query.
// width=1200 returns a reasonably-sized thumb.
const TARGETS = [
  { id: 'sony-zv-e10', search: 'Sony ZV-E10 camera' },
  { id: 'sony-a6500', search: 'Sony Alpha ILCE-6500' },
  { id: 'sony-16-50', search: 'Sony E PZ 16-50mm SELP1650' },
  { id: 'sony-35-1.8', search: 'Sony E 35mm F1.8 OSS SEL35F18' },
  { id: 'sony-18-105', search: 'Sony E PZ 18-105 G OSS SELP18105G' },
  { id: 'yongnuo-yn50', search: 'Yongnuo YN50mm lens' },
  { id: 'sony-55-210', search: 'Sony E 55-210mm SEL55210' },
  { id: 'sigma-60-600', search: 'Sigma 60-600mm DG DN OS Sports' },
  { id: 'rode-smartlav', search: 'Rode SmartLav lavalier microphone' },
  { id: 'tiffen-nd09-49', search: 'Tiffen neutral density filter' },
  { id: 'tiffen-nd09-72', search: 'Tiffen neutral density filter' },
  { id: 'natgeo-tripod', search: 'aluminium camera tripod' },
  { id: 'dji-action-5', search: 'DJI Osmo Action camera' },
  { id: 'dji-osmo-mobile-6', search: 'DJI Osmo Mobile gimbal smartphone' },
];

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&srlimit=10`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`search ${r.status}`);
  const j = await r.json();
  return j.query?.search ?? [];
}

async function getFileUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1200&format=json`;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) return null;
  const j = await r.json();
  const pages = j.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  // Skip tiff/svg — we want jpgs/pngs
  const mime = info.mime ?? '';
  if (!mime.startsWith('image/')) return null;
  if (mime.includes('tiff') || mime.includes('svg')) return null;
  // Prefer the rescaled thumbnail; fall back to the original
  return { url: info.thumburl || info.url, mime };
}

function curlDownload(url, outPath) {
  // Use curl with the same UA so Wikimedia is happy
  execSync(`curl -sSfL -A '${UA}' -o '${outPath}' '${url}'`, { stdio: 'pipe' });
}

const results = [];
for (const t of TARGETS) {
  process.stdout.write(`${t.id}: `);
  try {
    const hits = await searchCommons(t.search);
    let saved = false;
    for (const hit of hits) {
      const file = await getFileUrl(hit.title);
      if (!file) continue;
      const ext = file.mime === 'image/png' ? 'png' : 'jpg';
      const outPath = resolve(OUT, `${t.id}.${ext}`);
      try {
        curlDownload(file.url, outPath);
        const sz = statSync(outPath).size;
        if (sz < 5_000) {
          // tiny / likely error html — skip
          continue;
        }
        results.push({ id: t.id, ext, source: hit.title, bytes: sz });
        process.stdout.write(`✓ ${hit.title} (${ext}, ${(sz / 1024).toFixed(0)} KB)\n`);
        saved = true;
        break;
      } catch (err) {
        // Try next hit
      }
    }
    if (!saved) {
      results.push({ id: t.id, ext: null });
      process.stdout.write(`✗ no usable hit\n`);
    }
  } catch (err) {
    results.push({ id: t.id, ext: null, error: err.message });
    process.stdout.write(`✗ ${err.message}\n`);
  }
}

writeFileSync(resolve(__dirname, 'fetch-images.report.json'), JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.ext).length;
console.log(`\n${ok}/${TARGETS.length} images fetched. Report: scripts/fetch-images.report.json`);
