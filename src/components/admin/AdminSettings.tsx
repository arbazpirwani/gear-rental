import { useState } from 'react';
import { seedProducts } from '../../lib/db/products';

export default function AdminSettings() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function runSeed() {
    if (!confirm('Seed default products into Firestore? This will overwrite docs with the same IDs.')) return;
    setBusy(true);
    setMsg(null);
    try {
      const n = await seedProducts();
      setMsg(`Seeded ${n} products. Switch to the Products tab to verify.`);
    } catch (err) {
      setMsg('Seed failed: ' + (err instanceof Error ? err.message : 'unknown'));
    }
    setBusy(false);
  }

  return (
    <div className="admin-settings">
      <h2>Settings</h2>

      <section className="setting-card">
        <h3>Seed default products</h3>
        <p className="muted">
          One-time setup: writes the 14 products from the seed list into the <code>products</code>
          {' '}collection. Run this immediately after creating the Firestore database.
        </p>
        <button className="btn btn-primary" disabled={busy} onClick={runSeed}>
          {busy ? 'Seeding…' : 'Seed defaults'}
        </button>
        {msg && <div className="quote-line" style={{ marginTop: 12 }}>{msg}</div>}
      </section>

      <section className="setting-card">
        <h3>Calendar policy</h3>
        <p className="muted">
          When a customer submits a booking, a <code>bookedDates</code> entry is created with
          status <strong>pending</strong>. The catalog shows pending dates as already-blocked
          to prevent overlapping requests. To free a date, change the booking status to{' '}
          <strong>cancelled</strong> and the related block can be removed manually from the
          Firestore console.
        </p>
      </section>
    </div>
  );
}
