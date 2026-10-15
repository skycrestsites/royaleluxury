/**
 * Records the result of a storefront deploy in `site/publish`. Run by GitHub Actions.
 *
 *   node scripts/mark-published.mjs            after a successful deploy
 *   node scripts/mark-published.mjs --failed   when the build or deploy fails
 *
 * Expects GOOGLE_APPLICATION_CREDENTIALS and BUILD_STARTED_AT (ISO time the build began).
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

initializeApp({ projectId: 'royaleluxury', credential: applicationDefault() });
const ref = getFirestore().doc('site/publish');

if (process.argv.includes('--failed')) {
  await ref.set({ status: 'failed', failedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log('Marked the publish as failed.');
} else {
  const startedAt = new Date(process.env.BUILD_STARTED_AT ?? Date.now());
  await getFirestore().runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data() ?? {};
    const lastChange = current.lastChangeAt instanceof Timestamp ? current.lastChangeAt.toDate() : null;
    tx.set(
      ref,
      {
        status: 'published',
        lastPublishedAt: FieldValue.serverTimestamp(),
        // Edits made while the build was running are not in this deploy.
        pendingChanges: Boolean(lastChange && lastChange > startedAt),
      },
      { merge: true },
    );
  });
  console.log('Marked the storefront as published.');
}
