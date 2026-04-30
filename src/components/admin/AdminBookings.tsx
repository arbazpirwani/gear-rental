import { useState } from 'react';
import { useBookings, updateBookingStatus, type BookingStatus } from '../../lib/db/bookings';
import { formatAed } from '../../lib/pricing';

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'picked_up', 'returned', 'cancelled'];

export default function AdminBookings() {
  const { bookings, loading } = useBookings();
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (loading) return <div className="muted">Loading bookings…</div>;
  if (bookings.length === 0) return <div className="muted">No bookings yet.</div>;

  async function setStatus(id: string, status: BookingStatus) {
    setPendingId(id);
    try {
      await updateBookingStatus(id, status);
    } catch (err) {
      alert('Failed to update: ' + (err instanceof Error ? err.message : 'unknown'));
    }
    setPendingId(null);
  }

  return (
    <div className="admin-bookings">
      {bookings.map((b) => {
        const created = new Date(b.createdAtMillis).toLocaleString('en-AE');
        return (
          <div key={b.id} className="booking-card-admin">
            <div className="booking-card-head">
              <div>
                <div className="booking-card-name">{b.customer.fullName}</div>
                <div className="muted small">{b.customer.phone} · {b.customer.email}</div>
              </div>
              <div className="booking-card-status">
                <select
                  value={b.status}
                  disabled={pendingId === b.id}
                  onChange={(e) => setStatus(b.id, e.target.value as BookingStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="booking-card-items">
              {b.items.map((i) => (
                <div key={i.productId} className="booking-card-item">
                  <span>{i.productId}</span>
                  <span className="muted">{i.startDate} → {i.endDate}</span>
                </div>
              ))}
            </div>
            <div className="booking-card-foot">
              <div className="muted small">{created} · {b.id}</div>
              <div>
                <strong>{formatAed(b.quote.rentalTotal)}</strong>
                <span className="muted small"> + deposit {formatAed(b.quote.depositTotal)}</span>
              </div>
            </div>
            {b.customer.pickupNotes && (
              <div className="booking-card-notes muted small">Note: {b.customer.pickupNotes}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
