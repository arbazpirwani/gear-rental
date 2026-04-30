// One-shot: update only the `image` field on each product doc in Firestore.
// Uses the access token persisted by `firebase-tools login` so we don't need
// a service account.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const PROJECT = 'gear-rental-ad';
const config = JSON.parse(
  readFileSync(`${homedir()}/.config/configstore/firebase-tools.json`, 'utf8'),
);
const token = config?.tokens?.access_token;
if (!token) {
  console.error('No firebase-tools access token found.');
  process.exit(1);
}

// Pull the current image map from the seed file by importing it.
const { PRODUCTS } = await import('../src/data/products.ts').catch(async () => {
  // fall back to a manual map matching the seed, in case the .ts import fails
  return {
    PRODUCTS: [
      { id: 'sony-zv-e10', image: '/images/sony-zv-e10.jpg' },
      { id: 'sony-a6500', image: '/images/sony-a6500.jpg' },
      { id: 'sony-16-50', image: '/images/sony-16-50.jpg' },
      { id: 'sony-35-1.8', image: '/images/sony-35-1.8.jpg' },
      { id: 'sony-18-105', image: '/images/sony-18-105.jpg' },
      { id: 'yongnuo-yn50', image: '/images/yongnuo-yn50.jpg' },
      { id: 'sony-55-210', image: '/images/sony-55-210.jpg' },
      { id: 'sigma-60-600', image: '/images/sigma-60-600.jpg' },
      { id: 'rode-smartlav', image: '/images/rode-smartlav.jpg' },
      { id: 'tiffen-nd09-49', image: '/images/tiffen-nd09-49.jpg' },
      { id: 'tiffen-nd09-72', image: '/images/tiffen-nd09-72.jpg' },
      { id: 'natgeo-tripod', image: '/images/natgeo-tripod.jpg' },
      { id: 'dji-action-5', image: '/images/dji-action-5.jpg' },
      { id: 'dji-osmo-mobile-6', image: '/images/dji-osmo-mobile-6.jpg' },
    ],
  };
});

let updated = 0;
let failed = 0;
for (const p of PRODUCTS) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/products/${encodeURIComponent(p.id)}?updateMask.fieldPaths=image`;
  const body = { fields: { image: { stringValue: p.image } } };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    console.log(`✓ ${p.id} → ${p.image}`);
    updated++;
  } else {
    const txt = await res.text();
    console.error(`✗ ${p.id}: ${res.status} ${txt.slice(0, 200)}`);
    failed++;
  }
}
console.log(`\n${updated} updated, ${failed} failed.`);
