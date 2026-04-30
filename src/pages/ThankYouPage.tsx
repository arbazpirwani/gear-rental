import { Link, useSearchParams } from 'react-router-dom';
import { OWNER_DISPLAY_PHONE, OWNER_WHATSAPP } from '../lib/whatsapp';
import { useDocumentMeta } from '../lib/seo';

export default function ThankYouPage() {
  const [params] = useSearchParams();
  const id = params.get('id');
  useDocumentMeta({ title: 'Booking received · Gear Rental', noindex: true });
  return (
    <div className="thankyou">
      <div className="thankyou-card">
        <div className="thankyou-mark">✓</div>
        <h1>Request received.</h1>
        <p className="lead">
          Thank you. Our rental coordinator will WhatsApp you within a few hours to confirm
          availability and share bank-transfer details for the 30% advance.
        </p>
        {id && (
          <div className="booking-id">
            <span className="rate-label">Booking reference</span>
            <code>{id}</code>
          </div>
        )}
        <p className="muted small">
          Submitting this list does not guarantee availability — confirmation comes once the
          coordinator replies and the advance is received.
        </p>
        <div className="actions">
          <a className="btn btn-primary" href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer">
            Open WhatsApp ({OWNER_DISPLAY_PHONE})
          </a>
          <a className="btn btn-ghost" href={`tel:+${OWNER_WHATSAPP}`}>Call</a>
          <Link to="/" className="btn btn-ghost">Back to catalog</Link>
        </div>
      </div>
    </div>
  );
}
