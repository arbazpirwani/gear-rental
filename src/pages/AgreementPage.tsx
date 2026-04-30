import { Link } from 'react-router-dom';
import AgreementContent from '../components/AgreementContent';

export default function AgreementPage() {
  return (
    <article className="legal">
      <AgreementContent />
      <Link to="/" className="btn btn-ghost">← Back to catalog</Link>
    </article>
  );
}
