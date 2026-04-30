import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../lib/db/products';
import { CATEGORY_ORDER, type Category } from '../types';

const FILTERS: Array<{ key: 'all' | Category; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'camera', label: 'Cameras' },
  { key: 'lens', label: 'Lenses' },
  { key: 'action', label: 'Action' },
  { key: 'gimbal', label: 'Gimbals' },
  { key: 'support', label: 'Tripods' },
  { key: 'filter', label: 'Filters' },
  { key: 'audio', label: 'Audio' },
];

export default function HomePage() {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const { products, source } = useProducts();

  const visible = useMemo(() => {
    const list = filter === 'all' ? products : products.filter((p) => p.category === filter);
    return [...list].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category);
      const bi = CATEGORY_ORDER.indexOf(b.category);
      const da = ai === -1 ? CATEGORY_ORDER.length : ai;
      const db = bi === -1 ? CATEGORY_ORDER.length : bi;
      if (da !== db) return da - db;
      return a.title.localeCompare(b.title);
    });
  }, [filter, products]);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Camera kit for creators — APS-C, made simple.</h1>
          <p>
            Sony mirrorless bodies, fast primes, an ultra-tele zoom, action cams and gimbals — for rent
            in Abu Dhabi, picked up from <strong>Reem Island</strong>.{' '}
            <strong>Emirates ID accepted</strong> — no passport hold for standard items.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="btn btn-primary">Browse gear</a>
            <Link to="/agreement" className="btn btn-ghost">Read terms</Link>
          </div>
          <ul className="hero-bullets">
            <li>Multi-day discount from <strong>day 2</strong> (75%) — not just week 1</li>
            <li>3+ items → 10% off · 5+ items → 15% off bundles</li>
            <li>Refundable cash deposit · Reem Island pickup &amp; drop-off</li>
          </ul>
        </div>
      </section>

      <section id="catalog" className="catalog">
        <div className="catalog-head">
          <h2>Catalog {source === 'loading' && <small className="muted">(loading…)</small>}</h2>
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`chip ${filter === f.key ? 'chip-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
