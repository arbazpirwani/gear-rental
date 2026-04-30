import { useState } from 'react';
import { addMissingProducts, resetProductsToSeed } from '../../lib/db/products';

export default function AdminSettings() {
  const [busy, setBusy] = useState<'add' | 'reset' | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function runAddMissing() {
    setBusy('add');
    setMsg(null);
    try {
      const { added, skipped } = await addMissingProducts();
      setMsg(
        added === 0
          ? `Nothing to add — all ${skipped} seed products already exist in Firestore.`
          : `Added ${added} new product(s). Skipped ${skipped} that were already there. Switch to Products to verify.`,
      );
    } catch (err) {
      setMsg('Add failed: ' + (err instanceof Error ? err.message : 'unknown'));
    }
    setBusy(null);
  }

  async function runReset() {
    if (!confirm(
      'DESTRUCTIVE. This will overwrite every seed-id product in Firestore with the seed-file values, ' +
      'discarding any prices/titles/descriptions you have edited in /admin. Continue?',
    )) return;
    if (!confirm('Are you absolutely sure? Type cancel in your head if not.')) return;
    setBusy('reset');
    setMsg(null);
    try {
      const n = await resetProductsToSeed();
      setMsg(`Reset ${n} products to the seed defaults.`);
    } catch (err) {
      setMsg('Reset failed: ' + (err instanceof Error ? err.message : 'unknown'));
    }
    setBusy(null);
  }

  return (
    <div className="admin-settings">
      <h2>Settings</h2>

      <section className="setting-card">
        <h3>Add missing products</h3>
        <p className="muted">
          Safe to run any time. Only creates Firestore docs for seed products that
          don't exist yet — your edited prices and descriptions are preserved.
          Run this after pulling new products into <code>src/data/products.ts</code>.
        </p>
        <button className="btn btn-primary" disabled={busy !== null} onClick={runAddMissing}>
          {busy === 'add' ? 'Adding…' : 'Add missing products'}
        </button>
      </section>

      <section className="setting-card">
        <h3>Reset all products to seed defaults</h3>
        <p className="muted">
          <strong>Destructive.</strong> Overwrites every seed-id product in Firestore
          with the values from <code>src/data/products.ts</code>. Use only when you
          want a factory reset. Two confirmations required.
        </p>
        <button className="btn btn-ghost" disabled={busy !== null} onClick={runReset}>
          {busy === 'reset' ? 'Resetting…' : 'Reset all to defaults'}
        </button>
      </section>

      {msg && <div className="quote-line" style={{ marginTop: 12 }}>{msg}</div>}

      <section className="setting-card">
        <h3>Calendar policy</h3>
        <p className="muted">
          When a customer submits a booking, a <code>bookedDates</code> entry is
          created with status <strong>pending</strong>. The catalog shows pending
          dates as already-blocked to prevent overlapping requests. When you
          mark a booking as <strong>confirmed</strong>, the block flips to
          confirmed automatically. When you mark a booking as{' '}
          <strong>cancelled</strong>, the matching blocks are deleted and the
          dates become available again.
        </p>
      </section>
    </div>
  );
}
