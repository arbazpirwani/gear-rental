import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../lib/cartContext';
import { useProducts } from '../lib/db/products';
import { formatAed, quote } from '../lib/pricing';
import ProductImage from '../components/ProductImage';

export default function CartPage() {
  const { cart, setCart } = useCart();
  const { products } = useProducts();
  const lookup = useMemo(
    () => (id: string) => products.find((p) => p.id === id),
    [products],
  );
  const q = quote(cart, lookup);

  if (cart.length === 0) {
    return (
      <div className="empty">
        <h2>Your cart is empty.</h2>
        <p>Browse the catalog and pick the gear you want for your shoot.</p>
        <Link to="/" className="btn btn-primary">Browse gear</Link>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Your booking</h1>

      <div className="cart-list">
        {cart.map((item) => {
          const product = lookup(item.productId);
          if (!product) return null;
          const line = q.lines.find((l) => l.productId === product.id);
          return (
            <div key={item.productId} className="cart-row">
              <div className="cart-row-thumb">
                <ProductImage product={product} />
              </div>
              <div className="cart-row-body">
                <div className="cart-row-title">{product.title}</div>
                <div className="cart-row-meta">
                  {item.startDate} → {item.endDate} · {line?.days ?? 0} day(s)
                </div>
                <div className="cart-row-actions">
                  <Link to={`/product/${product.id}`} className="link">Change dates</Link>
                  <button
                    className="link link-danger"
                    onClick={() => setCart((c) => c.filter((i) => i.productId !== item.productId))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="cart-row-amount">
                <div>{formatAed(line?.subtotal ?? 0)}</div>
                <div className="muted small">deposit {formatAed(line?.deposit ?? 0)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="quote-card">
        <div className="quote-row">
          <span>Rental subtotal</span>
          <span>{formatAed(q.rentalSubtotal)}</span>
        </div>
        {q.itemDiscountPercent > 0 && (
          <div className="quote-row quote-discount">
            <span>Bundle discount ({q.itemDiscountPercent}%)</span>
            <span>−{formatAed(q.itemDiscountAmount)}</span>
          </div>
        )}
        <div className="quote-row">
          <span>Rental total</span>
          <strong>{formatAed(q.rentalTotal)}</strong>
        </div>
        <div className="quote-row muted">
          <span>Refundable deposit</span>
          <span>{formatAed(q.depositTotal)}</span>
        </div>
        <hr />
        <div className="quote-row">
          <span>Advance to confirm (30%, min AED 100)</span>
          <strong>{formatAed(q.advance)}</strong>
        </div>
        <div className="quote-row muted">
          <span>Balance + deposit at pickup</span>
          <span>{formatAed(q.balanceAtPickup)}</span>
        </div>
        <div className="cart-cta">
          <Link to="/checkout" className="btn btn-primary btn-lg">Continue to request</Link>
        </div>
        <p className="muted small">
          Submitting this list does <strong>not guarantee availability</strong>. Our rental coordinator
          will confirm availability and share bank-transfer details for the advance. Payment by bank
          transfer or cash at pickup; card payments are not accepted.
        </p>
      </div>
    </div>
  );
}
