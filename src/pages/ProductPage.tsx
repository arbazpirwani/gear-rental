import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { daysBetween, formatAed, rentalForDays } from '../lib/pricing';
import { useCart } from '../lib/cartContext';
import { useProduct } from '../lib/db/products';
import { useBookedDates, isDateBlocked, rangesOverlap } from '../lib/db/availability';
import { useDocumentMeta, SITE_URL } from '../lib/seo';
import ProductImage from '../components/ProductImage';
import AvailabilityNotice from '../components/AvailabilityNotice';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function ProductPage() {
  const { id = '' } = useParams();
  const { product, source } = useProduct(id);
  const navigate = useNavigate();
  const { cart, setCart } = useCart();
  const existing = cart.find((c) => c.productId === id);

  const [startDate, setStartDate] = useState<string>(existing?.startDate ?? todayIso());
  const [endDate, setEndDate] = useState<string>(existing?.endDate ?? tomorrowIso());
  const [conflict, setConflict] = useState<string | null>(null);

  const { ranges, loading: loadingDates } = useBookedDates(id);

  useDocumentMeta({
    title: product
      ? `Rent ${product.title} in Abu Dhabi — AED ${product.pricePerDay}/day · Gear Rental`
      : 'Product · Gear Rental',
    description: product
      ? `Rent the ${product.title} in Abu Dhabi from AED ${product.pricePerDay}/day. ${product.shortDescription} Pickup from Reem Island. Emirates ID accepted, multi-day discount from day 2.`
      : undefined,
    image: product ? `${SITE_URL}${product.image}` : undefined,
    jsonLd: product
      ? {
          '@graph': [
            {
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.title,
              description: product.description,
              brand: { '@type': 'Brand', name: product.brand },
              image: `${SITE_URL}${product.image}`,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'AED',
                price: product.pricePerDay,
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  priceCurrency: 'AED',
                  price: product.pricePerDay,
                  referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'DAY' },
                },
                availability: product.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                seller: { '@type': 'Organization', name: 'Gear Rental — Reem Island' },
                areaServed: 'Abu Dhabi, UAE',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Camera Rental Abu Dhabi', item: SITE_URL },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: product.title,
                  item: `${SITE_URL}/product/${product.id}`,
                },
              ],
            },
          ],
        }
      : undefined,
  });

  useEffect(() => {
    if (!startDate || !endDate || ranges.length === 0) {
      setConflict(null);
      return;
    }
    const overlaps = ranges.filter((r) =>
      rangesOverlap(startDate, endDate, r.startDate, r.endDate),
    );
    if (overlaps.length === 0) {
      setConflict(null);
      return;
    }
    const r = overlaps[0];
    setConflict(`Already booked ${r.startDate} → ${r.endDate} (${r.status}).`);
  }, [startDate, endDate, ranges]);

  if (source === 'loading' && !product) {
    return <div className="empty"><h2>Loading…</h2></div>;
  }

  if (!product) {
    return (
      <div className="empty">
        <h2>Product not found.</h2>
        <Link to="/" className="btn btn-primary">Back to catalog</Link>
      </div>
    );
  }

  const days = daysBetween(startDate, endDate);
  const subtotal = rentalForDays(product.pricePerDay, days);
  const valid = days > 0 && !conflict && product.inStock;
  const startBlocked = isDateBlocked(startDate, ranges);
  const endBlocked = isDateBlocked(endDate, ranges);

  function addToCart() {
    if (!valid) return;
    setCart((c) => {
      const others = c.filter((i) => i.productId !== product!.id);
      return [...others, { productId: product!.id, startDate, endDate }];
    });
    navigate('/cart');
  }

  return (
    <article className="product-detail">
      <div className="product-detail-media">
        <ProductImage product={product} large />
      </div>
      <div className="product-detail-info">
        <div className="brand-pill">{product.brand}</div>
        <h1>{product.title}</h1>
        <p className="lead">{product.description}</p>

        <ul className="highlights">
          {product.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>

        <div className="rate-row">
          <div>
            <div className="rate-label">Daily rate</div>
            <div className="rate-value">{formatAed(product.pricePerDay)}</div>
          </div>
          <div>
            <div className="rate-label">Refundable deposit</div>
            <div className="rate-value">{formatAed(product.deposit)}</div>
          </div>
        </div>

        <div className="booking-card">
          <h3>Pick your dates</h3>
          <AvailabilityNotice ranges={ranges} loading={loadingDates} />
          <div className="date-row">
            <label>
              Pickup
              <input
                type="date"
                min={todayIso()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-invalid={startBlocked || undefined}
              />
            </label>
            <label>
              Return
              <input
                type="date"
                min={startDate || todayIso()}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-invalid={endBlocked || undefined}
              />
            </label>
          </div>

          {conflict && <div className="error">{conflict}</div>}
          {!product.inStock && <div className="error">This item is currently unavailable.</div>}

          {valid && (
            <div className="quote-line">
              {days} day(s) → <strong>{formatAed(subtotal)}</strong>{' '}
              <span className="muted">+ {formatAed(product.deposit)} refundable deposit</span>
            </div>
          )}
          <div className="actions">
            <button className="btn btn-primary" onClick={addToCart} disabled={!valid}>
              {existing ? 'Update in cart' : 'Add to cart'}
            </button>
            <Link to="/" className="btn btn-ghost">Back to catalog</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
