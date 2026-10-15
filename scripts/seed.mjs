/**
 * Loads the sample catalog, photos and orders into Firebase.
 *
 *   npm run seed        Local emulators (run `npm run emulators` first)
 *   npm run seed:prod   The live royaleluxury project. Needs Google credentials, see docs/ADMIN_BACKEND_PLAN.md
 *
 * Safe to run more than once: documents are overwritten by ID and images by path.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import sharp from 'sharp';

const PROJECT_ID = 'royaleluxury';
const BUCKET = 'royaleluxury.firebasestorage.app';
const OWNER_EMAIL = 'netspirestudios@gmail.com';
const DEV_PASSWORD = 'royale-dev-2026';

const prod = process.argv.includes('--prod');
if (!prod) {
  process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= '127.0.0.1:9199';
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';
  process.env.METADATA_SERVER_DETECTION ??= 'none';
}

// Imported after the emulator variables are set so the SDK picks them up.
const { initializeApp, applicationDefault } = await import('firebase-admin/app');
const { getFirestore, FieldValue, Timestamp } = await import('firebase-admin/firestore');
const { getStorage } = await import('firebase-admin/storage');
const { getAuth } = await import('firebase-admin/auth');

initializeApp({ projectId: PROJECT_ID, storageBucket: BUCKET, ...(prod ? { credential: applicationDefault() } : {}) });
const db = getFirestore();
const bucket = getStorage().bucket();

const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(root(path), 'utf8'));
const log = (message) => console.log(`  ${message}`);

async function uploadImage(folder, { file, alt }) {
  const data = await readFile(root(`src/assets/images/${file}`));
  const { width, height } = await sharp(data).metadata();
  const path = `${folder}/${file}`;
  await bucket.file(path).save(data, {
    contentType: 'image/jpeg',
    metadata: { cacheControl: 'public, max-age=31536000, immutable' },
    resumable: false,
  });
  return { path, alt, width, height };
}

async function seedCatalog() {
  const { categories, products } = await readJson('seed/catalog.json');

  for (const { slug, image, ...category } of categories) {
    await db.doc(`categories/${slug}`).set({
      ...category,
      image: await uploadImage(`categories/${slug}`, image),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  log(`${categories.length} categories with cover photos`);

  for (const product of products) {
    const images = await Promise.all(product.images.map((image) => uploadImage(`products/${product.slug}`, image)));
    await db.doc(`products/${product.slug}`).set({
      ...product,
      compareAtPrice: product.compareAtPrice ?? null,
      badge: product.badge ?? '',
      featured: Boolean(product.featured),
      sizes: product.sizes ?? [],
      colors: product.colors ?? [],
      images,
      stripe: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: 'seed',
    });
  }
  log(`${products.length} products with photos`);
}

async function seedOrders() {
  const orders = await readJson('seed/orders.json');
  const batch = db.batch();
  for (const { createdAt, ...order } of orders) {
    batch.set(db.doc(`orders/${order.number}`), { ...order, createdAt: Timestamp.fromDate(new Date(createdAt)) });
  }
  await batch.commit();
  log(`${orders.length} sample orders`);
}

/** Emulator only: a ready-to-use owner account so the admin can be tested without Google. */
async function seedDevOwner() {
  const auth = getAuth();
  const user = await auth.getUserByEmail(OWNER_EMAIL).catch(() =>
    auth.createUser({ email: OWNER_EMAIL, password: DEV_PASSWORD, emailVerified: true, displayName: 'Royale Owner' }),
  );
  await auth.setCustomUserClaims(user.uid, { role: 'owner' });
  await db.doc(`admins/${user.uid}`).set({
    email: OWNER_EMAIL,
    displayName: user.displayName ?? '',
    photoURL: '',
    role: 'owner',
    grantedBy: 'seed',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  log(`Owner login: ${OWNER_EMAIL} / ${DEV_PASSWORD}`);
}

/** Writes exact storage totals and marks the seeded catalog as published. */
async function seedSystemState() {
  // Give the storage and catalog triggers a moment to finish so these values are final.
  await wait(3000);
  const [files] = await bucket.getFiles();
  const bytes = files.reduce((sum, file) => sum + Number(file.metadata.size ?? 0), 0);
  await db.doc('stats/storage').set({ bytes, files: files.length, updatedAt: FieldValue.serverTimestamp() });
  await db.doc('site/publish').set({
    status: 'published',
    pendingChanges: false,
    lastPublishedAt: FieldValue.serverTimestamp(),
  });
  log(`Storage totals: ${files.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
}

console.log(`\nSeeding ${prod ? 'the LIVE project' : 'local emulators'} (${PROJECT_ID})`);
try {
  await seedCatalog();
  await seedOrders();
  if (!prod) await seedDevOwner();
  await seedSystemState();
  console.log('Done.\n');
} catch (error) {
  console.error('\nSeeding failed:', error.message);
  if (!prod && /ECONNREFUSED/.test(String(error))) console.error('Start the emulators first with: npm run emulators');
  process.exit(1);
}
