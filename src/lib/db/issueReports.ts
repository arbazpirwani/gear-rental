import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { DeviceInfo, IpInfo, GeolocationResult } from '../deviceInfo';
import type { ExifData } from '../exif';

export interface ReportFormFields {
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
}

// Creates the parent issue-report doc with whatever passively-collected
// info we have, returns the doc id so the page can append events to it.
export async function createReportSession(
  deviceInfo: DeviceInfo,
  ipInfo: IpInfo,
): Promise<string> {
  if (!db) throw new Error('Firebase not configured.');
  const reportRef = doc(collection(db, 'issueReports'));
  await setDoc(reportRef, {
    createdAt: serverTimestamp(),
    deviceInfo,
    ipInfo,
    status: 'opened',
  });
  await logEvent(reportRef.id, 'session_opened', { ipInfo, deviceInfo });
  return reportRef.id;
}

export async function attachGeolocation(
  reportId: string,
  geo: GeolocationResult,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'issueReports', reportId), {
    geolocation: geo,
    geolocationUpdatedAt: serverTimestamp(),
  });
  await logEvent(reportId, geo.granted ? 'geolocation_granted' : 'geolocation_denied', geo);
}

export async function attachImage(
  reportId: string,
  file: File,
  exif: ExifData | null,
  index: number,
): Promise<{ downloadUrl: string | null; storagePath: string | null; uploadError?: string }> {
  if (!db) throw new Error('Firebase not configured.');

  // Log EXIF + filename metadata FIRST. If the upload fails (e.g. Storage
  // not enabled, rules block us), we still keep the GPS/camera info — which
  // is the most valuable forensic data anyway.
  await logEvent(reportId, 'image_selected', {
    originalName: file.name,
    sizeBytes: file.size,
    contentType: file.type,
    exif,
    index,
  });

  if (!storage) {
    return { downloadUrl: null, storagePath: null, uploadError: 'Storage not configured' };
  }

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `issue-reports/${reportId}/${Date.now()}_${index}_${safeName}`;
    const fileRef = ref(storage, storagePath);
    await uploadBytes(fileRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: file.name,
        sizeBytes: String(file.size),
      },
    });
    const downloadUrl = await getDownloadURL(fileRef);
    await logEvent(reportId, 'image_uploaded', {
      storagePath,
      downloadUrl,
      originalName: file.name,
      sizeBytes: file.size,
      contentType: file.type,
      index,
    });
    return { downloadUrl, storagePath };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logEvent(reportId, 'image_upload_failed', {
      originalName: file.name,
      error: msg,
      index,
    });
    return { downloadUrl: null, storagePath: null, uploadError: msg };
  }
}

export async function submitReportForm(
  reportId: string,
  fields: ReportFormFields,
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'issueReports', reportId), {
    form: fields,
    formSubmittedAt: serverTimestamp(),
    status: 'submitted',
  });
  await logEvent(reportId, 'form_submitted', fields);
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
      payload: payload ?? null,
      at: serverTimestamp(),
    });
  } catch (err) {
    console.warn('issueReports event log failed:', err);
  }
}
