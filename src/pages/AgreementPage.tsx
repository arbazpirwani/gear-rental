import { Link } from 'react-router-dom';
import AgreementContent from '../components/AgreementContent';
import { useDocumentMeta } from '../lib/seo';

export default function AgreementPage() {
  useDocumentMeta({
    title: 'Rental Agreement & Policies · Gear Rental',
    description:
      'Terms for renting camera equipment from Gear Rental in Reem Island, Abu Dhabi. Deposit options, late return, damage, cancellation and privacy.',
  });
  return (
    <article className="legal">
      <AgreementContent />
      <Link to="/" className="btn btn-ghost">← Back to catalog</Link>
    </article>
  );
}
