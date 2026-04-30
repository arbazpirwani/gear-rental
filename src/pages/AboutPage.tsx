import { OWNER_DISPLAY_PHONE, OWNER_NAME, OWNER_WHATSAPP } from '../lib/whatsapp';

export default function AboutPage() {
  return (
    <article className="legal">
      <h1>About Gear Rental</h1>
      <p className="lead">
        Gear Rental is a small, owner-operated rental kit run by {OWNER_NAME} from Reem Island, Abu
        Dhabi. We rent out a curated set of Sony mirrorless cameras, a range of native E-mount
        lenses (including a Sigma 60-600 mm super-tele), the Rode SmartLav+ for clean voice audio,
        a National Geographic travel tripod, and the DJI Action 5 + Osmo Mobile 6 for run-and-gun
        and gimbal work.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>Browse the catalog and add the items you need to your cart, with the dates you want them.</li>
        <li>Send the booking via WhatsApp from the checkout page — your message is prefilled.</li>
        <li>We confirm availability, share bank-transfer details for the 30% advance, and lock the dates.</li>
        <li>Pick up in Reem Island, present your Emirates ID, pay the balance + deposit, and shoot.</li>
        <li>Return on time, get your deposit back the same day.</li>
      </ol>

      <h2>Talk to us</h2>
      <p>
        WhatsApp is the fastest way:{' '}
        <a href={`https://wa.me/${OWNER_WHATSAPP}`}>{OWNER_DISPLAY_PHONE}</a>.
      </p>
    </article>
  );
}
