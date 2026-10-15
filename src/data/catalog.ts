import { loadFirestoreCatalog } from './sources/firestore';
import { loadSeedCatalog } from './sources/seed';

/**
 * CATALOG_SOURCE selects where products come from at build time:
 *  - "seed" (default): bundled sample data in /seed
 *  - "firestore": the live Firestore catalog
 *  - "emulator": the local Firestore emulator
 */
const source = process.env.CATALOG_SOURCE ?? import.meta.env.CATALOG_SOURCE ?? 'seed';

export const catalog =
  source === 'firestore' || source === 'emulator'
    ? await loadFirestoreCatalog(source === 'emulator')
    : loadSeedCatalog();
