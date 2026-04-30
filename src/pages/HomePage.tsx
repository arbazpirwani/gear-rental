import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../lib/db/products';
import type { Category } from '../types';

const FILTERS: Array<{ key: 'all' | Category; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'camera', label: 'Cameras' },
  { key: 'lens', label: 'Lenses' },
  { key: 'audio', label: 'Audio' },
  { key: 'filter', label: 'Filters' },
  { key: 'support', label: 'Support' },
  { key: 'gimbal', label: 'Gimbals' },
];

export default function HomePage() {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const { products, source } = useProducts();

  const visible = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => p.category === filter)),
    [filter, products],
  );

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Camera &amp; lens rental, made simple.</h1>
          <p>
            Sony mirrorless bodies, fast primes, an ultra-tele zoom, action cams and gimbals — all
            available for rent in Abu Dhabi. Pickup from <strong>Reem Island</strong>.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="btn btn-primary">Browse gear</a>
            <Link to="/agreement" className="btn btn-ghost">Read terms</Link>
          </div>
          <ul className="hero-bullets">
            <li>3+ items → 10% off · 5+ items → 15% off</li>
            <li>Day-2 at 75% · Day-3+ at 60% of daily rate</li>
            <li>Refundable security deposit · Emirates ID at pickup</li>
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
