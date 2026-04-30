import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HomeFAQ, { FAQ_JSON_LD } from '../components/HomeFAQ';
import { useProducts } from '../lib/db/products';
import { useDocumentMeta, LOCAL_BUSINESS_LD } from '../lib/seo';
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

  useDocumentMeta({
    title: 'Camera & Lens Rental in Abu Dhabi | Sony, Sigma, DJI · Gear Rental',
    description:
      'Rent Sony cameras, lenses, gimbals and action cams in Abu Dhabi from AED 15/day. Reem Island pickup, Emirates ID accepted, multi-day discount from day 2. WhatsApp to book.',
    jsonLd: { '@graph': [LOCAL_BUSINESS_LD, FAQ_JSON_LD] },
  });

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
          <h1>Camera &amp; Lens Rental in Abu Dhabi</h1>
          <p>
            Rent Sony APS-C mirrorless bodies, native E-mount lenses, the Sigma 60-600 mm super-tele,
            DJI action cams and gimbals — picked up from <strong>Reem Island</strong>, Abu Dhabi.{' '}
            <strong>Emirates ID accepted</strong>, no passport hold for standard items.
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

      <section className="seo-intro">
        <h2>Camera and lens rental for creators in Abu Dhabi</h2>
        <p>
          Gear Rental is an owner-operated rental kit serving photographers, videographers and
          social-media creators across Abu Dhabi from <strong>Reem Island</strong>. We rent the
          Sony ZV-E10 and α6500 mirrorless bodies, six native E-mount lenses (16-50 mm kit, 35 mm
          f/1.8, 18-105 mm f/4 G OSS, 55-210 mm and the Yongnuo YN50 mm), the Sigma 60-600 mm
          super-tele zoom, the DJI Osmo Action 5 Pro action camera, the DJI Osmo Mobile 6
          smartphone gimbal, a National Geographic travel tripod, Tiffen ND filters and the Rode
          SmartLav+ lavalier microphone — everything most YouTube, Reels, event and corporate
          shoots need at honest day rates.
        </p>
        <p>
          Multi-day discount kicks in from day 2 (75% of the daily rate), with day 3+ at 60%.
          Bundles get cheaper too: 10% off on 3 or more items, 15% off on 5+. The full list of
          rates and refundable deposits is in the catalog above. Pickup is by appointment in Reem
          Island; deposit is refundable cash, and Emirates ID is accepted for standard items —
          for the Sigma 60-600 mm we also offer a passport-hold deposit option.
        </p>
      </section>

      <HomeFAQ />
    </>
  );
}
