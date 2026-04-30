import type { BookedRange } from '../lib/db/availability';

export default function AvailabilityNotice({
  ranges,
  loading,
}: {
  ranges: BookedRange[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="muted small">Checking availability…</div>;
  }
  if (ranges.length === 0) {
    return <div className="muted small">All upcoming dates appear available.</div>;
  }
  return (
    <div className="availability">
      <div className="muted small" style={{ marginBottom: 4 }}>Already booked:</div>
      <ul className="blocked-list">
        {ranges.map((r) => (
          <li key={`${r.startDate}-${r.endDate}-${r.bookingId}`}>
            <span>{r.startDate} → {r.endDate}</span>
            <span className={`pill pill-${r.status}`}>{r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
