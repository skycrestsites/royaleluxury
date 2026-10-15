import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { OWNER_EMAILS, RESEND_API_KEY, SITE_URL } from '../config.js';
import { auth, db, FieldValue } from '../lib/firebase.js';
import { inviteEmail, sendEmail } from '../lib/email.js';
import { isRole, isValidEmail, normalizeEmail, requireAuth, requireRole } from '../lib/guards.js';
import { grantRole, revokeRole } from './roles.js';

const INVITE_DAYS = 7;
const hashToken = (token: string) => createHash('sha256').update(token).digest();

function parseInvite(value: unknown) {
  const [inviteId, token] = typeof value === 'string' ? value.split('.') : [];
  if (!inviteId || !token || !/^[A-Za-z0-9]{10,40}$/.test(inviteId)) {
    throw new HttpsError('invalid-argument', 'This invite link is not valid.');
  }
  return { inviteId, token };
}

async function loadValidInvite(value: unknown) {
  const { inviteId, token } = parseInvite(value);
  const ref = db.doc(`invites/${inviteId}`);
  const snap = await ref.get();
  const invite = snap.data();
  const valid =
    invite &&
    invite.status === 'pending' &&
    invite.expiresAt.toMillis() > Date.now() &&
    timingSafeEqual(Buffer.from(invite.tokenHash, 'hex'), hashToken(token));
  if (!valid) {
    throw new HttpsError('not-found', 'This invite has expired or was already used.');
  }
  return { ref, invite };
}

/** Grants the owner role to the configured owner emails on first sign-in. */
export const claimOwner = onCall(async (request) => {
  const caller = requireAuth(request);
  const email = normalizeEmail(caller.token.email);
  const owners = OWNER_EMAILS.value().split(',').map(normalizeEmail).filter(Boolean);

  if (!caller.token.email_verified || !owners.includes(email)) {
    throw new HttpsError('permission-denied', 'This account does not have admin access.');
  }
  if (caller.token.role !== 'owner') {
    await grantRole(caller.uid, 'owner', 'system');
  }
  return { role: 'owner' };
});

/** Owners invite a team member by email. */
export const inviteMember = onCall({ secrets: [RESEND_API_KEY] }, async (request) => {
  const caller = requireRole(request, ['owner']);
  const email = normalizeEmail(request.data?.email);
  const role = request.data?.role ?? 'admin';

  if (!isValidEmail(email)) throw new HttpsError('invalid-argument', 'Enter a valid email address.');
  if (!isRole(role)) throw new HttpsError('invalid-argument', 'Choose a valid role.');

  const existing = await auth.getUserByEmail(email).catch(() => null);
  if (existing && isRole(existing.customClaims?.role)) {
    throw new HttpsError('already-exists', 'This person is already on the team.');
  }

  const token = randomBytes(32).toString('base64url');
  const ref = db.collection('invites').doc();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  const invitedBy = caller.token.name || caller.token.email || 'A Royale Luxury owner';

  await ref.set({
    email,
    role,
    tokenHash: hashToken(token).toString('hex'),
    status: 'pending',
    invitedBy: caller.uid,
    invitedByEmail: caller.token.email ?? '',
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
  });

  const link = `${SITE_URL.value()}/adminlogin/?invite=${ref.id}.${token}`;
  const result = await sendEmail({
    to: email,
    ...inviteEmail({ link, role, invitedBy, expiresInDays: INVITE_DAYS }),
  });
  await ref.update({ emailStatus: result.sent ? 'sent' : 'failed', emailError: result.sent ? null : result.reason });

  return { inviteId: ref.id, link, emailSent: result.sent, emailError: result.sent ? null : result.reason };
});

/** Lets the login page show who an invite is for before the person signs in. */
export const lookupInvite = onCall(async (request) => {
  const { invite } = await loadValidInvite(request.data?.invite);
  return { email: invite.email as string, role: invite.role as string };
});

/** Accepts an invite for the signed-in user. The invite is bound to its email and can be used once. */
export const acceptInvite = onCall(async (request) => {
  const caller = requireAuth(request);
  const { ref, invite } = await loadValidInvite(request.data?.invite);

  if (normalizeEmail(caller.token.email) !== invite.email) {
    throw new HttpsError('permission-denied', `This invite was sent to ${invite.email}. Sign in with that email.`);
  }

  await db.runTransaction(async (tx) => {
    const fresh = await tx.get(ref);
    if (fresh.data()?.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'This invite was already used.');
    }
    tx.update(ref, { status: 'accepted', acceptedBy: caller.uid, acceptedAt: FieldValue.serverTimestamp() });
  });

  // The emailed link proves the person controls this address.
  await auth.updateUser(caller.uid, { emailVerified: true });
  await grantRole(caller.uid, invite.role, invite.invitedBy);
  return { role: invite.role };
});

export const revokeInvite = onCall(async (request) => {
  requireRole(request, ['owner']);
  const inviteId = String(request.data?.inviteId ?? '');
  if (!inviteId) throw new HttpsError('invalid-argument', 'Missing invite.');
  await db.doc(`invites/${inviteId}`).update({ status: 'revoked', revokedAt: FieldValue.serverTimestamp() });
  return { ok: true };
});

export const removeMember = onCall(async (request) => {
  const caller = requireRole(request, ['owner']);
  const uid = String(request.data?.uid ?? '');
  if (!uid) throw new HttpsError('invalid-argument', 'Missing team member.');
  if (uid === caller.uid) throw new HttpsError('failed-precondition', 'You cannot remove yourself.');
  await revokeRole(uid);
  return { ok: true };
});
