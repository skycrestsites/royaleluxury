import { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, callable } from './firebase';
import type { Role } from './types';

export type Session =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'no-access'; user: User }
  | { status: 'ready'; user: User; role: Role };

const LOGIN_PATH = '/adminlogin/';
const HOME_PATH = '/admin/';

/** Must match the bootstrap owner in firestore.rules and storage.rules. */
const BOOTSTRAP_OWNER = 'netspirestudios@gmail.com';

async function roleOf(user: User, forceRefresh = false): Promise<Role | null> {
  const { claims } = await user.getIdTokenResult(forceRefresh);
  if (claims.role === 'owner' || claims.role === 'admin') return claims.role;
  return claims.email === BOOTSTRAP_OWNER && claims.email_verified === true ? 'owner' : null;
}

/** Tracks the signed-in admin and their role. */
export function useSession(): Session {
  const [session, setSession] = useState<Session>({ status: 'loading' });

  useEffect(
    () =>
      onIdTokenChanged(auth, async (user) => {
        if (!user) return setSession({ status: 'signed-out' });
        const role = await roleOf(user);
        setSession(role ? { status: 'ready', user, role } : { status: 'no-access', user });
      }),
    [],
  );

  return session;
}

/** Redirects to the login page when there is no admin session. */
export function useRequireAdmin(): Session {
  const session = useSession();
  useEffect(() => {
    if (session.status === 'signed-out' || session.status === 'no-access') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`${LOGIN_PATH}?next=${next}`);
    }
  }, [session.status]);
  return session;
}

export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signInWithPassword = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const createAccount = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);
export const signOut = () => firebaseSignOut(auth);

/**
 * Runs after a successful sign-in. Accepts a pending invite, or claims the owner role for the
 * configured owner emails, then confirms the user actually has admin access.
 */
export async function completeSignIn(user: User, invite: string | null): Promise<Role> {
  if (invite) {
    await callable<{ invite: string }>('acceptInvite')({ invite });
  } else if (!(await roleOf(user))) {
    await callable('claimOwner')().catch(() => undefined);
  }
  const role = await roleOf(user, true);
  if (!role) {
    await firebaseSignOut(auth);
    throw new Error('This account does not have admin access. Ask an owner to send you an invite.');
  }
  return role;
}

/** Only allow redirects back into the admin area. */
export function safeNextPath(value: string | null) {
  return value && value.startsWith('/admin/') && !value.startsWith('//') ? value : HOME_PATH;
}
