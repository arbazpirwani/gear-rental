import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../lib/cartContext';
import { useProducts } from '../lib/db/products';
import { quote, formatAed } from '../lib/pricing';
import { buildBookingMessage, whatsappLink } from '../lib/whatsapp';
import { clearCart } from '../lib/storage';
import { isFirebaseConfigured } from '../lib/firebase';
import { createBooking } from '../lib/db/bookings';
import Modal from '../components/Modal';
import AgreementContent from '../components/AgreementContent';
import { useDocumentMeta } from '../lib/seo';
import type { CustomerInfo } from '../types';

export default function CheckoutPage() {
  const { cart, setCart } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();
  const [info, setInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    pickupNotes: '',
    agreed: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  useDocumentMeta({ title: 'Request your equipment · Gear Rental', noindex: true });

  const lookup = useMemo(
    () => (id: string) => products.find((p) => p.id === id),
    [products],
  );
  const q = quote(cart, lookup);

  if (cart.length === 0) {
    return (
      <div className="empty">
        <h2>Cart is empty.</h2>
        <Link to="/" className="btn btn-primary">Browse gear</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!info.fullName.trim() || !info.phone.trim() || !info.email.trim()) {
      setError('Please fill name, phone and email.');
      return;
    }
    if (!info.agreed) {
      setError('Please tick the rental agreement before submitting.');
      return;
    }
    setSubmitting(true);
    let bookingId: string | null = null;
    try {
      if (isFirebaseConfigured) {
        bookingId = await createBooking(info, cart, q);
      }
    } catch (err) {
      console.error('Booking write failed:', err);
      setError(
        'We could not save your request to our system, but you can still send it via WhatsApp. ' +
          (err instanceof Error ? err.message : ''),
      );
      setSubmitting(false);
      return;
    }
    const message = buildBookingMessage(info, q, bookingId ?? undefined);
    const url = whatsappLink(message);
    window.open(url, '_blank', 'noopener');
    clearCart();
    setCart([]);
    navigate(`/thank-you${bookingId ? `?id=${bookingId}` : ''}`);
  }

  function set<K extends keyof CustomerInfo>(key: K, value: CustomerInfo[K]) {
    setInfo((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="checkout">
      <h1>Request your equipment</h1>
      <p className="lead">
        Use this form to submit your equipment list. Our rental coordinator will WhatsApp you back
        with a final quote, confirm availability, and share bank-transfer details for the 30% advance.{' '}
        <strong>Please note that submitting this list does not guarantee equipment availability.</strong>
      </p>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Your details</h2>
          <label>
            Full name (as on Emirates ID)
            <input
              type="text"
              required
              value={info.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              placeholder="e.g. Mohammed Al Mansouri"
            />
          </label>
          <label>
            Phone / WhatsApp
            <input
              type="tel"
              required
              value={info.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+971 5x xxx xxxx"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              required
              value={info.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Pickup notes (optional)
            <textarea
              rows={3}
              value={info.pickupNotes}
              onChange={(e) => set('pickupNotes', e.target.value)}
              placeholder="Preferred pickup time, building name in Reem Island, etc."
            />
          </label>

          <div className="agreement-block">
            <label className="check">
              <input
                type="checkbox"
                checked={info.agreed}
                onChange={(e) => set('agreed', e.target.checked)}
              />
              <span>
                I have read and agree to the{' '}
                <button
                  type="button"
                  className="link-inline"
                  onClick={(e) => {
                    e.preventDefault();
                    setAgreementOpen(true);
                  }}
                >
                  Rental Agreement
                </button>
                . I will present my Emirates ID at pickup, accept liability for damage and loss as
                described, and authorise deductions from the refundable deposit accordingly.
              </span>
            </label>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit booking request'}
          </button>
          <p className="muted small">
            Your details are stored securely in our booking system. Emirates ID is never uploaded
            online — we record it in person at pickup.
          </p>
        </form>

        <aside className="checkout-summary">
          <h2>Summary</h2>
          {q.lines.map((l) => (
            <div className="summary-row" key={l.productId}>
              <span>{l.title} <span className="muted small">× {l.days} day(s)</span></span>
              <span>{formatAed(l.subtotal)}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row">
            <span>Rental subtotal</span>
            <span>{formatAed(q.rentalSubtotal)}</span>
          </div>
          {q.itemDiscountPercent > 0 && (
            <div className="summary-row quote-discount">
              <span>Bundle discount ({q.itemDiscountPercent}%)</span>
              <span>−{formatAed(q.itemDiscountAmount)}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Rental total</span>
            <strong>{formatAed(q.rentalTotal)}</strong>
          </div>
          <div className="summary-row muted">
            <span>Refundable deposit</span>
            <span>{formatAed(q.depositTotal)}</span>
          </div>
          <hr />
          <div className="summary-row">
            <span>Advance to confirm</span>
            <strong>{formatAed(q.advance)}</strong>
          </div>
          <div className="summary-row muted">
            <span>Balance at pickup</span>
            <span>{formatAed(q.balanceAtPickup)}</span>
          </div>
        </aside>
      </div>

      <Modal
        open={agreementOpen}
        onClose={() => setAgreementOpen(false)}
        title="Rental Agreement"
      >
        <div className="legal legal-modal">
          <AgreementContent />
          <div className="actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                set('agreed', true);
                setAgreementOpen(false);
              }}
            >
              I agree
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAgreementOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
