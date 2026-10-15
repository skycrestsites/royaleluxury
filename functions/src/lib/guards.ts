import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

export const ROLES = ['owner', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const isRole = (value: unknown): value is Role => ROLES.includes(value as Role);

/** Ensures the caller is signed in and returns their auth context. */
export function requireAuth(request: CallableRequest) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in to continue.');
  }
  return request.auth;
}

/** Ensures the caller holds one of the given roles. */
export function requireRole(request: CallableRequest, allowed: readonly Role[]) {
  const auth = requireAuth(request);
  const role = auth.token.role;
  if (!isRole(role) || !allowed.includes(role)) {
    throw new HttpsError('permission-denied', 'You do not have access to this action.');
  }
  return { ...auth, role };
}

export const normalizeEmail = (email: unknown) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
