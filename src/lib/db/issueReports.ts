import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { DeviceInfo, IpInfo, GeolocationResult } from '../deviceInfo';
import type { ExifData } from '../exif';

export interface ReportFormFields {
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
}

// Firestore doc-size hard limit is 1 MiB. The base64 encoding of the resized
// JPEG sits in a subcollection event doc together with EXIF, so we cap the
// resized image at ~700 KB binary (→ ~930 KB base64) to leave headroom.
const MAX_BASE64_BYTES = 900_000;
const RESIZE_STEPS: { maxDim: number; quality: number }[] = [
  { maxDim: 1600, quality: 0.82 },
  { maxDim: 1280, quality: 0.78 },
  { maxDim: 1024, quality: 0.75 },
  { maxDim: 800, quality: 0.7 },
  { maxDim: 640, quality: 0.65 },
];

export async function createReportSession(
  deviceInfo: DeviceInfo,
  ipInfo: IpInfo,
): Promise<string> {
  if (!db) throw new Error('Firebase not configured.');
  const reportRef = doc(collection(db, 'issueReports'));
  const cleanDevice = stripUndefined(deviceInfo);
  const cleanIp = stripUndefined(ipInfo);
  await setDoc(reportRef, {
    createdAt: serverTimestamp(),
    deviceInfo: cleanDevice,
    ipInfo: cleanIp,
    status: 'opened',
  });
  await logEvent(reportRef.id, 'session_opened', { ipInfo: cleanIp, deviceInfo: cleanDevice });
  return reportRef.id;
}

export async function attachGeolocation(
  reportId: string,
  geo: GeolocationResult,
): Promise<void> {
  if (!db) return;
  const clean = stripUndefined(geo);
  await updateDoc(doc(db, 'issueReports', reportId), {
    geolocation: clean,
    geolocationUpdatedAt: serverTimestamp(),
  });
  await logEvent(reportId, geo.granted ? 'geolocation_granted' : 'geolocation_denied', clean);
}

export async function attachImage(
  reportId: string,
  file: File,
  exif: ExifData | null,
  index: number,
): Promise<{ stored: boolean; reason?: string }> {
  if (!db) throw new Error('Firebase not configured.');

  // Always log EXIF + filename first — preserved even if encoding fails.
  await logEvent(reportId, 'image_selected', {
    originalName: file.name,
    sizeBytes: file.size,
    contentType: file.type,
    exif,
    index,
  });

  try {
    const resized = await resizeForFirestore(file);
    if (!resized) {
      await logEvent(reportId, 'image_encode_failed', {
        originalName: file.name,
        reason: 'Could not shrink under Firestore size limit',
        index,
      });
      return { stored: false, reason: 'too-large' };
    }
    await addDoc(
      collection(db, 'issueReports', reportId, 'events'),
      stripUndefined({
        type: 'image_stored',
        payload: {
          originalName: file.name,
          originalSizeBytes: file.size,
          contentType: file.type,
          resized: {
            width: resized.width,
            height: resized.height,
            base64Bytes: resized.base64.length,
            base64: resized.base64,
          },
          exif,
          index,
        },
        at: serverTimestamp(),
      }),
    );
    return { stored: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logEvent(reportId, 'image_encode_failed', {
      originalName: file.name,
      error: msg,
      index,
    });
    return { stored: false, reason: msg };
  }
}

export async function submitReportForm(
  reportId: string,
  fields: ReportFormFields,
): Promise<void> {
  if (!db) return;
  const clean = stripUndefined(fields);
  await updateDoc(doc(db, 'issueReports', reportId), {
    form: clean,
    formSubmittedAt: serverTimestamp(),
    status: 'submitted',
  });
  await logEvent(reportId, 'form_submitted', clean);
}

export async function logEvent(
  reportId: string,
  type: string,
  payload: Record<string, unknown> | object | null,
): Promise<void> {
  if (!db) return;
  try {
    await addDoc(collection(db, 'issueReports', reportId, 'events'), {
      type,
      payload: stripUndefined(payload ?? null),
      at: serverTimestamp(),
    });
  } catch (err) {
    console.warn('issueReports event log failed:', err);
  }
}

// Firestore rejects `undefined` field values entirely (the SDK throws before
// the write goes out). Browser APIs hand us plenty of undefined optional
// fields — connection.type, userAgentData.model, ipInfo.city, etc. — so we
// deep-clone every payload here, dropping undefined keys while preserving
// null, arrays, primitives and nested structure.
function stripUndefined<T>(value: T): T {
  if (value === undefined) return undefined as unknown as T;
  if (value === null) return null as T;
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== undefined)
      .map((v) => stripUndefined(v)) as unknown as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

// Tries progressively smaller dimensions/qualities until the base64 fits
// inside the Firestore per-doc budget. Returns null if even 640px at low
// quality is still too big (very rare — would only happen for highly
// detailed photos that don't compress well).
async function resizeForFirestore(
  file: File,
): Promise<{ base64: string; width: number; height: number } | null> {
  const img = await loadImage(file);
  for (const step of RESIZE_STEPS) {
    const { canvas, width, height } = drawScaled(img, step.maxDim);
    const base64 = canvas.toDataURL('image/jpeg', step.quality);
    if (base64.length <= MAX_BASE64_BYTES) {
      return { base64, width, height };
    }
  }
  return null;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}

function drawScaled(img: HTMLImageElement, maxDim: number) {
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height / width) * maxDim);
      width = maxDim;
    } else {
      width = Math.round((width / height) * maxDim);
      height = maxDim;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}
