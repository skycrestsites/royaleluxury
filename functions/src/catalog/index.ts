import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { db, FieldValue } from '../lib/firebase.js';

const markPendingChanges = () =>
  db.doc('site/publish').set({ pendingChanges: true, lastChangeAt: FieldValue.serverTimestamp() }, { merge: true });

/** Flags that the public site is out of date so admins know to press Publish. */
export const onProductWritten = onDocumentWritten('products/{productId}', markPendingChanges);
export const onCategoryWritten = onDocumentWritten('categories/{categoryId}', markPendingChanges);
