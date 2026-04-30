// One-off generator: creates an SVG illustration per product so the catalog
// looks intentional before manufacturer/personal photos are added. Each file
// is named to match the seed data's image path. Re-run with: node scripts/generate-placeholders.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'images');

// Stylised illustrations per category. SVG strings are kept compact.
const ILLUSTRATIONS = {
  camera: ({ brand, label }) => `
    <g transform="translate(75 120)">
      <rect x="50" y="-22" width="80" height="22" rx="4" fill="#1f2737"/>
      <rect x="60" y="-30" width="60" height="10" rx="3" fill="#0a0e18"/>
      <path d="M0 35 Q0 0 35 0 H260 Q280 0 280 25 V125 Q280 150 260 150 H30 Q0 150 0 115 Z" fill="url(#body)"/>
      <circle cx="225" cy="22" r="13" fill="#0a0e18" stroke="#475569" stroke-width="1.2"/>
      <circle cx="55" cy="22" r="7" fill="#f59e0b"/>
      <circle cx="170" cy="85" r="58" fill="#000" stroke="#3a4358" stroke-width="2"/>
      <circle cx="170" cy="85" r="44" fill="#0b1020"/>
      <circle cx="170" cy="85" r="32" fill="#000"/>
      <circle cx="170" cy="85" r="22" fill="#0b1020"/>
      <circle cx="226" cy="85" r="3" fill="#f59e0b"/>
      <text x="14" y="142" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
      <text x="266" y="142" text-anchor="end" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
    </g>`,

  // Cylindrical lens illustration
  lens: ({ brand, label }) => `
    <g transform="translate(60 120)">
      <!-- lens hood ring -->
      <rect x="0" y="40" width="20" height="80" rx="3" fill="#1f2737"/>
      <!-- main barrel -->
      <rect x="20" y="30" width="270" height="100" rx="6" fill="url(#body)"/>
      <!-- focus ring textured -->
      <rect x="60" y="30" width="60" height="100" fill="#0f172a"/>
      <g stroke="#3a4358" stroke-width="0.8">
        ${Array.from({ length: 14 }, (_, i) => `<line x1="${65 + i * 4}" y1="35" x2="${65 + i * 4}" y2="125"/>`).join('')}
      </g>
      <!-- zoom ring -->
      <rect x="170" y="30" width="60" height="100" fill="#0a0e18"/>
      <g stroke="#3a4358" stroke-width="0.8">
        ${Array.from({ length: 14 }, (_, i) => `<line x1="${175 + i * 4}" y1="35" x2="${175 + i * 4}" y2="125"/>`).join('')}
      </g>
      <!-- mount ring -->
      <rect x="290" y="40" width="22" height="80" rx="3" fill="#1f2737"/>
      <!-- front element glass -->
      <circle cx="10" cy="80" r="34" fill="#0a0e18" stroke="#3a4358" stroke-width="2"/>
      <circle cx="10" cy="80" r="26" fill="#0b1020"/>
      <circle cx="10" cy="80" r="18" fill="#000"/>
      <circle cx="6" cy="74" r="6" fill="#1e293b" opacity="0.6"/>
      <!-- gold band -->
      <rect x="240" y="30" width="3" height="100" fill="#f59e0b"/>
      <!-- labels -->
      <text x="20" y="-8" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
      <text x="312" y="-8" text-anchor="end" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
    </g>`,

  audio: ({ brand, label }) => `
    <g transform="translate(180 100)">
      <!-- lav capsule -->
      <ellipse cx="60" cy="0" rx="22" ry="28" fill="url(#body)" stroke="#3a4358" stroke-width="1.5"/>
      <circle cx="60" cy="-2" r="14" fill="#0a0e18"/>
      <g stroke="#475569" stroke-width="0.6">
        ${Array.from({ length: 6 }, (_, i) => `<circle cx="60" cy="-2" r="${4 + i * 1.5}" fill="none"/>`).join('')}
      </g>
      <!-- cable -->
      <path d="M60 28 Q56 80 30 130 Q10 170 -20 200" fill="none" stroke="#0a0e18" stroke-width="3"/>
      <path d="M60 28 Q56 80 30 130 Q10 170 -20 200" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="2 3"/>
      <!-- clip behind capsule -->
      <rect x="48" y="20" width="24" height="6" rx="1.5" fill="#1f2737"/>
      <text x="-30" y="60" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
      <text x="-30" y="78" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
    </g>`,

  filter: ({ brand, label }) => `
    <g transform="translate(140 80)">
      <circle cx="100" cy="100" r="92" fill="#0a0e18" stroke="#3a4358" stroke-width="3"/>
      <circle cx="100" cy="100" r="78" fill="url(#body)"/>
      <!-- ridged outer ring -->
      <g stroke="#475569" stroke-width="0.6">
        ${Array.from({ length: 36 }, (_, i) => {
          const a = (i * 10) * Math.PI / 180;
          const x1 = 100 + Math.cos(a) * 82;
          const y1 = 100 + Math.sin(a) * 82;
          const x2 = 100 + Math.cos(a) * 92;
          const y2 = 100 + Math.sin(a) * 92;
          return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
        }).join('')}
      </g>
      <!-- glass tint -->
      <circle cx="100" cy="100" r="60" fill="#1f2937" opacity="0.85"/>
      <circle cx="80" cy="80" r="14" fill="#475569" opacity="0.18"/>
      <!-- ND label -->
      <text x="100" y="106" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="22" font-weight="800" fill="#f59e0b" letter-spacing="2">ND 0.9</text>
      <text x="100" y="130" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
      <text x="100" y="-12" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
    </g>`,

  support: ({ brand, label }) => `
    <g transform="translate(120 60)">
      <!-- head -->
      <rect x="100" y="0" width="40" height="22" rx="3" fill="#1f2737"/>
      <rect x="115" y="-8" width="10" height="10" fill="#0a0e18"/>
      <circle cx="120" cy="22" r="10" fill="#0a0e18"/>
      <!-- center column -->
      <rect x="115" y="32" width="10" height="80" fill="url(#body)"/>
      <!-- legs -->
      <line x1="120" y1="112" x2="40" y2="240" stroke="#1f2737" stroke-width="6" stroke-linecap="round"/>
      <line x1="120" y1="112" x2="120" y2="240" stroke="#0a0e18" stroke-width="6" stroke-linecap="round"/>
      <line x1="120" y1="112" x2="200" y2="240" stroke="#1f2737" stroke-width="6" stroke-linecap="round"/>
      <!-- leg locks -->
      <circle cx="80" cy="180" r="3" fill="#f59e0b"/>
      <circle cx="120" cy="180" r="3" fill="#f59e0b"/>
      <circle cx="160" cy="180" r="3" fill="#f59e0b"/>
      <!-- labels -->
      <text x="-30" y="60" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
      <text x="-30" y="78" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
    </g>`,

  gimbal: ({ brand, label }) => `
    <g transform="translate(150 70)">
      <!-- handle -->
      <rect x="78" y="160" width="22" height="80" rx="3" fill="url(#body)"/>
      <!-- handle grip texture -->
      <g stroke="#3a4358" stroke-width="0.8">
        ${Array.from({ length: 8 }, (_, i) => `<line x1="80" y1="${172 + i * 8}" x2="98" y2="${172 + i * 8}"/>`).join('')}
      </g>
      <!-- joystick + screen -->
      <rect x="76" y="130" width="26" height="26" rx="2" fill="#0a0e18"/>
      <circle cx="89" cy="143" r="4" fill="#475569"/>
      <!-- arm -->
      <path d="M89 130 L89 80 L150 80 L150 30" fill="none" stroke="#1f2737" stroke-width="6" stroke-linecap="round"/>
      <!-- phone mount -->
      <rect x="115" y="-10" width="70" height="40" rx="4" fill="#1f2737"/>
      <rect x="125" y="-2" width="50" height="24" rx="2" fill="#0a0e18"/>
      <!-- labels -->
      <text x="-30" y="100" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
      <text x="-30" y="118" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
    </g>`,

  action: ({ brand, label }) => `
    <g transform="translate(160 110)">
      <!-- body -->
      <rect x="0" y="0" width="160" height="110" rx="14" fill="url(#body)" stroke="#3a4358" stroke-width="2"/>
      <!-- front lens -->
      <circle cx="40" cy="55" r="32" fill="#000" stroke="#3a4358" stroke-width="2"/>
      <circle cx="40" cy="55" r="22" fill="#0b1020"/>
      <circle cx="40" cy="55" r="14" fill="#000"/>
      <circle cx="36" cy="51" r="4" fill="#1e293b" opacity="0.6"/>
      <!-- screen -->
      <rect x="86" y="20" width="60" height="70" rx="4" fill="#0a0e18"/>
      <rect x="92" y="26" width="48" height="54" rx="2" fill="#1e293b"/>
      <!-- record dot -->
      <circle cx="100" cy="36" r="3" fill="#dc2626"/>
      <!-- shutter on top -->
      <circle cx="80" cy="-6" r="6" fill="#f59e0b"/>
      <text x="0" y="-12" font-family="-apple-system,system-ui,sans-serif" font-size="11" font-weight="800" fill="#f59e0b" letter-spacing="2">${brand}</text>
      <text x="160" y="-12" text-anchor="end" font-family="-apple-system,system-ui,sans-serif" font-size="9" fill="#94a3b8" letter-spacing="1">${label}</text>
    </g>`,
};

const PRODUCTS = [
  { id: 'sony-zv-e10', brand: 'SONY', label: 'ZV-E10', illustration: 'camera', cat: 'MIRRORLESS' },
  { id: 'sony-a6500', brand: 'SONY', label: 'α 6500', illustration: 'camera', cat: 'ALPHA APS-C' },
  { id: 'sony-16-50', brand: 'SONY', label: '16-50 OSS', illustration: 'lens', cat: 'KIT ZOOM' },
  { id: 'sony-35-1.8', brand: 'SONY', label: '35 F1.8', illustration: 'lens', cat: 'PRIME' },
  { id: 'sony-18-105', brand: 'SONY', label: '18-105 G F4', illustration: 'lens', cat: 'G ZOOM' },
  { id: 'yongnuo-yn50', brand: 'YONGNUO', label: 'YN50 F1.8', illustration: 'lens', cat: 'PRIME' },
  { id: 'sony-55-210', brand: 'SONY', label: '55-210 OSS', illustration: 'lens', cat: 'TELE ZOOM' },
  { id: 'sigma-60-600', brand: 'SIGMA', label: '60-600 SPORTS', illustration: 'lens', cat: 'SUPER TELE' },
  { id: 'rode-smartlav', brand: 'RODE', label: 'SMARTLAV+', illustration: 'audio', cat: 'LAVALIER' },
  { id: 'tiffen-nd09-49', brand: 'TIFFEN', label: '49 mm', illustration: 'filter', cat: 'NEUTRAL DENSITY' },
  { id: 'tiffen-nd09-72', brand: 'TIFFEN', label: '72 mm', illustration: 'filter', cat: 'NEUTRAL DENSITY' },
  { id: 'natgeo-tripod', brand: 'NAT GEO', label: 'NGPH001', illustration: 'support', cat: 'TRAVEL TRIPOD' },
  { id: 'dji-action-5', brand: 'DJI', label: 'OSMO ACTION 5', illustration: 'action', cat: 'ACTION CAM' },
  { id: 'dji-osmo-mobile-6', brand: 'DJI', label: 'OSMO MOBILE 6', illustration: 'gimbal', cat: 'GIMBAL' },
];

const wrapper = (catLabel, illustration, footerLabel) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" role="img" aria-label="${footerLabel}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="body" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#3a4358"/>
      <stop offset="100%" stop-color="#1f2737"/>
    </linearGradient>
  </defs>
  <rect width="480" height="360" fill="url(#bg)"/>
  <text x="40" y="46" font-family="-apple-system,system-ui,sans-serif" font-size="11" letter-spacing="2" fill="#94a3b8" font-weight="700">${catLabel}</text>
  ${illustration}
  <text x="240" y="328" text-anchor="middle" font-family="-apple-system,system-ui,sans-serif" font-size="13" fill="#cbd5e1" font-weight="600">${footerLabel}</text>
</svg>
`;

let written = 0;
for (const p of PRODUCTS) {
  const fn = ILLUSTRATIONS[p.illustration];
  if (!fn) {
    console.warn(`No illustration for ${p.illustration} (${p.id})`);
    continue;
  }
  const inner = fn({ brand: p.brand, label: p.label });
  const svg = wrapper(`${p.brand} · ${p.cat}`, inner, `${p.brand} ${p.label}`);
  const path = resolve(OUT, `${p.id}.svg`);
  writeFileSync(path, svg, 'utf8');
  written++;
}
console.log(`Wrote ${written} SVG illustrations to ${OUT}`);
