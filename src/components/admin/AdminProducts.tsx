import { useState } from 'react';
import { useProducts, updateProductFields } from '../../lib/db/products';
import { formatAed } from '../../lib/pricing';
import type { Product } from '../../types';

export default function AdminProducts() {
  const { products, source } = useProducts();
  const [editingId, setEditingId] = useState<string | null>(null);

  if (source === 'seed') {
    return (
      <div className="empty">
        <h2>No products in Firestore yet.</h2>
        <p>Go to <strong>Settings → Seed defaults</strong> to populate from the seed list.</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      {products.map((p) => (
        <ProductRow
          key={p.id}
          product={p}
          editing={editingId === p.id}
          onEdit={() => setEditingId(p.id)}
          onCancel={() => setEditingId(null)}
          onSaved={() => setEditingId(null)}
        />
      ))}
    </div>
  );
}

function ProductRow({
  product,
  editing,
  onEdit,
  onCancel,
  onSaved,
}: {
  product: Product;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(product.title);
  const [pricePerDay, setPrice] = useState(String(product.pricePerDay));
  const [deposit, setDeposit] = useState(String(product.deposit));
  const [shortDescription, setShort] = useState(product.shortDescription);
  const [inStock, setInStock] = useState(product.inStock);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateProductFields(product.id, {
        title,
        pricePerDay: Number(pricePerDay) || 0,
        deposit: Number(deposit) || 0,
        shortDescription,
        inStock,
      });
      onSaved();
    } catch (err) {
      alert('Save failed: ' + (err instanceof Error ? err.message : 'unknown'));
    }
    setSaving(false);
  }

  if (!editing) {
    return (
      <div className="admin-product-row">
        <div>
          <div className="cart-row-title">{product.title}</div>
          <div className="muted small">{product.shortDescription}</div>
        </div>
        <div className="admin-product-stats">
          <span><strong>{formatAed(product.pricePerDay)}</strong>/day</span>
          <span className="muted">deposit {formatAed(product.deposit)}</span>
          <span className={`pill pill-${product.inStock ? 'confirmed' : 'pending'}`}>
            {product.inStock ? 'in stock' : 'unavailable'}
          </span>
        </div>
        <button className="btn btn-ghost" onClick={onEdit}>Edit</button>
      </div>
    );
  }

  return (
    <div className="admin-product-row admin-product-edit">
      <div className="admin-product-fields">
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Short description<input value={shortDescription} onChange={(e) => setShort(e.target.value)} /></label>
        <div className="date-row">
          <label>Price/day (AED)<input type="number" value={pricePerDay} onChange={(e) => setPrice(e.target.value)} /></label>
          <label>Deposit (AED)<input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></label>
        </div>
        <label className="check">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <span>Available for booking</span>
        </label>
      </div>
      <div className="actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
