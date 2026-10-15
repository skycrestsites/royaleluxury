import { auth, db, FieldValue } from '../lib/firebase.js';
import type { Role } from '../lib/guards.js';

/** Grants a role as a custom claim and mirrors it into the team roster. */
export async function grantRole(uid: string, role: Role, grantedBy: string) {
  const user = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, { ...user.customClaims, role });
  await db.doc(`admins/${uid}`).set(
    {
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      role,
      grantedBy,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

/** Removes admin access and signs the user out of every device. */
export async function revokeRole(uid: string) {
  const user = await auth.getUser(uid);
  const { role: _removed, ...claims } = user.customClaims ?? {};
  await auth.setCustomUserClaims(uid, claims);
  await auth.revokeRefreshTokens(uid);
  await db.doc(`admins/${uid}`).delete();
}
