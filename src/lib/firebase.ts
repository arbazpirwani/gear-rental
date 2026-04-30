import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase is optional. If env vars are missing the site falls back to
// the seed product data and the admin panel is hidden. Once env is provided,
// products + bookings + calendar all switch to Firestore automatically.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured: boolean =
  Boolean(config.apiKey) && Boolean(config.projectId) && Boolean(config.appId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

const adminEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS ?? '';
export const ADMIN_EMAILS: string[] = adminEmailsRaw
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);
