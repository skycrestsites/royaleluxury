/**
 * Firebase web configuration. These values identify the project and are public by design;
 * access to data is controlled by Firestore/Storage rules and Cloud Functions.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCWKy74npN7rBEcaetlC4ZhYRf46Afupfc',
  authDomain: 'royaleluxury.firebaseapp.com',
  projectId: 'royaleluxury',
  storageBucket: 'royaleluxury.firebasestorage.app',
  messagingSenderId: '585096457884',
  appId: '1:585096457884:web:4b94e8e37a861b0e73c759',
};

export const FUNCTIONS_REGION = 'us-central1';

export const EMULATOR_HOSTS = {
  auth: 'http://127.0.0.1:9099',
  firestore: { host: '127.0.0.1', port: 8080 },
  storage: { host: '127.0.0.1', port: 9199 },
  functions: { host: '127.0.0.1', port: 5001 },
};

/** Public URL for a file in Cloud Storage. Product and category images are publicly readable. */
export function storageUrl(path: string, useEmulator = false) {
  const origin = useEmulator
    ? `http://${EMULATOR_HOSTS.storage.host}:${EMULATOR_HOSTS.storage.port}`
    : 'https://firebasestorage.googleapis.com';
  return `${origin}/v0/b/${firebaseConfig.storageBucket}/o/${encodeURIComponent(path)}?alt=media`;
}
