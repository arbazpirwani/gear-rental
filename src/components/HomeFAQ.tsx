// Homepage FAQ — content + FAQPage JSON-LD in one place. Each Q/A is
// keyword-targeted for searches like "rent camera abu dhabi", "lens rental
// uae", "camera deposit emirates id" etc.
const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'How can I rent a camera in Abu Dhabi?',
    a: 'Browse the catalog above, pick the gear and dates you need, and submit a booking request. Our coordinator confirms availability over WhatsApp within a few hours and shares bank-transfer details for the 30% advance. Pickup is from Reem Island.',
  },
  {
    q: 'How much is the security deposit on a rental?',
    a: 'Each item lists its own refundable deposit — for example AED 1,500 for a Sony ZV-E10 or AED 4,500 for the Sigma 60-600 mm. For premium items above AED 5,000 in replacement value, you may alternatively leave your original passport for the duration of the rental in lieu of the cash deposit.',
  },
  {
    q: 'Do I need to leave my Emirates ID?',
    a: 'No. We record your Emirates ID in person at pickup for verification, but we never hold it. Other rental shops in the UAE often refuse Emirates ID and only accept passport — we accept Emirates ID for standard items.',
  },
  {
    q: 'Is there a multi-day discount?',
    a: 'Yes. Day 1 is the listed daily rate, day 2 is charged at 75% of the daily rate, and day 3 onward is charged at 60%. There is also a bundle discount: 10% off the rental subtotal on 3 or more items, 15% off on 5 or more items.',
  },
  {
    q: 'What payment do you accept?',
    a: 'Bank transfer or cash, on collection. Card payments are not currently accepted.',
  },
  {
    q: 'What cameras and lenses can I rent?',
    a: 'Sony APS-C mirrorless bodies (ZV-E10 and α6500), six native E-mount lenses including the Sony 35 mm f/1.8, 18-105 mm f/4 G OSS and Sigma 60-600 mm super-tele, the DJI Osmo Action 5 Pro action camera, the DJI Osmo Mobile 6 smartphone gimbal, a National Geographic travel tripod, Tiffen ND filters and the Rode SmartLav+ lavalier microphone.',
  },
  {
    q: 'Where is pickup and drop-off?',
    a: 'Both pickup and drop-off take place at an agreed meeting point in Reem Island, Abu Dhabi. Time and exact spot are confirmed by WhatsApp once the booking is paid.',
  },
];

export const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function HomeFAQ() {
  return (
    <section className="faq" aria-label="Frequently asked questions">
      <h2>Frequently asked: camera rental in Abu Dhabi</h2>
      <div className="faq-list">
        {FAQ.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
