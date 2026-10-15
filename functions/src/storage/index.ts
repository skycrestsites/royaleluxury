import { onObjectDeleted, onObjectFinalized } from 'firebase-functions/v2/storage';
import { onCall } from 'firebase-functions/v2/https';
import { db, FieldValue, storage } from '../lib/firebase.js';
import { requireRole } from '../lib/guards.js';

/**
 * Recounts every file in the bucket and stores the exact totals. Counting from the source
 * (instead of incrementing per event) stays correct when files are overwritten or events
 * arrive late or more than once.
 */
async function recount() {
  const [files] = await storage.bucket().getFiles();
  const bytes = files.reduce((sum, file) => sum + Number(file.metadata.size ?? 0), 0);
  await db.doc('stats/storage').set({ bytes, files: files.length, updatedAt: FieldValue.serverTimestamp() });
  return { bytes, files: files.length };
}

export const trackUpload = onObjectFinalized(() => recount());
export const trackDelete = onObjectDeleted(() => recount());

export const recalculateStorage = onCall(async (request) => {
  requireRole(request, ['owner', 'admin']);
  return recount();
});
