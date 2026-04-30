import { Link } from 'react-router-dom';
import { OWNER_DISPLAY_PHONE, OWNER_LOCATION, OWNER_NAME } from '../lib/whatsapp';

export default function AgreementPage() {
  return (
    <article className="legal">
      <h1>Rental Agreement &amp; Policies</h1>
      <p className="lead">
        These terms govern every rental from Gear Rental ({OWNER_NAME}, {OWNER_LOCATION}). By
        submitting a booking through this website, you confirm that you have read, understood and
        agree to all of the terms below.
      </p>

      <h2>1. Identity &amp; eligibility</h2>
      <ul>
        <li>Renter must be 21 years or older.</li>
        <li>A valid Emirates ID (or, for visitors, passport + UAE entry stamp + visa) is required at pickup; we record it in person and do not upload it to this website.</li>
        <li>The booking name on the website must match the ID presented at pickup.</li>
      </ul>

      <h2>2. Booking, advance &amp; payment</h2>
      <ul>
        <li>To confirm a booking, the renter pays a 30% non-refundable advance (minimum AED 100) by bank transfer.</li>
        <li>The remaining rental balance and the refundable security deposit are paid at pickup, by bank transfer or cash. Card payments are not currently accepted.</li>
        <li>Bookings are not held without the advance.</li>
      </ul>

      <h2>3. Pricing tiers</h2>
      <ul>
        <li>Day 1 is charged at the listed daily rate.</li>
        <li>Day 2 is charged at 75% of the daily rate.</li>
        <li>Days 3 and onward are charged at 60% of the daily rate.</li>
        <li>Rentals of 3 different items receive 10% off the rental subtotal; 5+ different items receive 15% off. Deposits are not discounted.</li>
      </ul>

      <h2>4. Pickup &amp; drop-off</h2>
      <ul>
        <li>All pickups and drop-offs take place at an agreed location in <strong>Reem Island, Abu Dhabi</strong> at the time confirmed in writing.</li>
        <li>Each item is inspected jointly at pickup. Photos and serial numbers are recorded and signed; these are the reference for any damage or loss claim on return.</li>
        <li>The same joint inspection is repeated on return.</li>
      </ul>

      <h2>5. Late return</h2>
      <ul>
        <li>A 30-minute grace period applies. Beyond that:</li>
        <li>30 minutes to 3 hours late: AED 50 + AED 25 per started hour, deducted from the deposit.</li>
        <li>More than 3 hours late, or any delay that prevents fulfilment of a confirmed booking for the next customer: a full additional day rate is deducted from the deposit, plus AED 100 compensation that we pay to the affected next customer, plus AED 50 administration fee. These deductions are taken from your deposit; if the deposit is insufficient, the difference is invoiced and payable within 7 days.</li>
      </ul>

      <h2>6. Damage</h2>
      <ul>
        <li>Cosmetic damage with no functional impact (light scratches, minor scuffs): AED 100–300, deducted from the deposit.</li>
        <li>Functional damage: full repair cost as quoted by an authorised service centre is deducted from the deposit; any balance is invoiced and payable within 7 days.</li>
        <li>Total loss or theft: replacement value at current UAE market price is charged. The deposit is retained against this and the balance is invoiced and payable within 7 days. The renter is required to file a police report at their own cost.</li>
      </ul>

      <h2>7. Use of equipment</h2>
      <ul>
        <li>Equipment is for personal or professional photographic use only. Do not sublet, lend, or transfer to a third party.</li>
        <li>Do not expose equipment to: heavy rain, immersion in water (except where rated, e.g. DJI Action 5 within its rated depth), fine dust storms without protection, or temperatures above 50 °C.</li>
        <li>Memory cards, batteries and accessories supplied with the rental are part of the rental and must be returned in working order.</li>
      </ul>

      <h2>8. Cancellation</h2>
      <ul>
        <li>More than 48 hours before pickup: full refund of advance.</li>
        <li>Less than 48 hours before pickup: advance is forfeited.</li>
        <li>No-show without cancellation: advance is forfeited and the booking is closed.</li>
      </ul>

      <h2>9. Privacy</h2>
      <ul>
        <li>The website stores only the contact details you submit (name, phone, email, notes). No Emirates ID, scans or images of identity documents are uploaded online.</li>
        <li>We do not share your information with third parties except where required by law.</li>
      </ul>

      <h2>10. Disputes</h2>
      <ul>
        <li>Any dispute is resolved in good faith between the parties first. If unresolved, it is referred to the relevant Abu Dhabi courts.</li>
      </ul>

      <p className="contact">
        Questions before you book? WhatsApp <a href="https://wa.me/971559870068">{OWNER_DISPLAY_PHONE}</a>.
      </p>

      <Link to="/" className="btn btn-ghost">← Back to catalog</Link>
    </article>
  );
}
