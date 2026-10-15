import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { EMULATOR_HOSTS, FUNCTIONS_REGION, firebaseConfig, storageUrl } from '../../lib/firebase-config';

export const usingEmulators = import.meta.env.PUBLIC_USE_EMULATORS === 'true';

const isFirstInit = getApps().length === 0;
export const app = isFirstInit ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, FUNCTIONS_REGION);

if (usingEmulators && isFirstInit) {
  connectAuthEmulator(auth, EMULATOR_HOSTS.auth, { disableWarnings: true });
  connectFirestoreEmulator(db, EMULATOR_HOSTS.firestore.host, EMULATOR_HOSTS.firestore.port);
  connectStorageEmulator(storage, EMULATOR_HOSTS.storage.host, EMULATOR_HOSTS.storage.port);
  connectFunctionsEmulator(functions, EMULATOR_HOSTS.functions.host, EMULATOR_HOSTS.functions.port);
}

export const callable = <Request = void, Response = unknown>(name: string) =>
  httpsCallable<Request, Response>(functions, name);

export const publicImageUrl = (path: string) => storageUrl(path, usingEmulators);
