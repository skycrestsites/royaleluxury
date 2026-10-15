import { useEffect, useState, type FormEvent } from 'react';
import type { UserCredential } from 'firebase/auth';
import { callable } from '../lib/firebase';
import { errorMessage } from '../lib/format';
import {
  completeSignIn,
  createAccount,
  resetPassword,
  safeNextPath,
  signInWithGoogle,
  signInWithPassword,
  useSession,
} from '../lib/session';
import { GoogleMark } from '../components/Icon';
import { Button, Field, Spinner } from '../components/ui';

type Mode = 'sign-in' | 'create' | 'reset';
type InviteInfo = { email: string; role: string };

export default function LoginPage() {
  const session = useSession();
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const invite = params.get('invite');
  const next = safeNextPath(params.get('next'));

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [mode, setMode] = useState<Mode>(invite ? 'create' : 'sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'google' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!invite) return;
    callable<{ invite: string }, InviteInfo>('lookupInvite')({ invite })
      .then(({ data }) => {
        setInviteInfo(data);
        setEmail(data.email);
      })
      .catch((err) => setInviteError(errorMessage(err)));
  }, [invite]);

  // Already signed in as an admin and not accepting an invite: go straight in.
  useEffect(() => {
    if (session.status === 'ready' && !invite) window.location.replace(next);
  }, [session.status, invite, next]);

  async function finish(run: () => Promise<UserCredential>, kind: 'google' | 'password') {
    setBusy(kind);
    setError('');
    setNotice('');
    try {
      const { user } = await run();
      await completeSignIn(user, inviteInfo ? invite : null);
      window.location.replace(next);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (mode === 'reset') {
      setBusy('password');
      setError('');
      try {
        await resetPassword(email);
        setNotice('If an account exists for that email, a reset link is on its way.');
        setMode('sign-in');
      } catch (err) {
        setError(errorMessage(err));
      }
      setBusy(null);
      return;
    }
    if (mode === 'create' && password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    await finish(() => (mode === 'create' ? createAccount(email, password) : signInWithPassword(email, password)), 'password');
  }

  if (session.status === 'loading' || (session.status === 'ready' && !invite)) {
    return (
      <div className="a-fullscreen">
        <Spinner />
      </div>
    );
  }

  const heading = inviteInfo ? 'Join the Royale Luxury team' : mode === 'reset' ? 'Reset your password' : 'Admin sign in';

  return (
    <div className="a-login">
      <div className="a-login-card">
        <div className="a-login-brand">
          <span className="a-brand-name">Royale</span>
          <span className="a-brand-sub">Luxury Admin</span>
        </div>
        <h1>{heading}</h1>

        {inviteInfo && (
          <p className="a-notice a-notice--info">
            You were invited as {inviteInfo.role === 'owner' ? 'an owner' : 'an admin'}. Sign in or create a password for <strong>{inviteInfo.email}</strong>.
          </p>
        )}
        {inviteError && <p className="a-notice a-notice--error">{inviteError}</p>}
        {notice && <p className="a-notice a-notice--success">{notice}</p>}
        {error && (
          <p className="a-notice a-notice--error" role="alert">
            {error}
          </p>
        )}

        {mode !== 'reset' && (
          <>
            <button type="button" className="a-btn a-btn--google" disabled={busy !== null} onClick={() => finish(signInWithGoogle, 'google')}>
              {busy === 'google' ? <span className="a-spinner a-spinner--sm" aria-hidden="true" /> : <GoogleMark />}
              Continue with Google
            </button>
            <div className="a-divider">
              <span>or use email</span>
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="a-form">
          <Field label="Email">
            <input
              className="a-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              readOnly={Boolean(inviteInfo)}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {mode !== 'reset' && (
            <Field label="Password" hint={mode === 'create' ? 'At least 8 characters.' : undefined}>
              <input
                className="a-input"
                type="password"
                autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          )}
          <Button type="submit" busy={busy === 'password'} disabled={busy === 'google'}>
            {mode === 'create' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
          </Button>
        </form>

        <div className="a-login-links">
          {mode === 'sign-in' && (
            <button type="button" className="a-link" onClick={() => setMode('reset')}>
              Forgot password?
            </button>
          )}
          {inviteInfo && mode === 'sign-in' && (
            <button type="button" className="a-link" onClick={() => setMode('create')}>
              New here? Create a password
            </button>
          )}
          {mode !== 'sign-in' && (
            <button type="button" className="a-link" onClick={() => setMode('sign-in')}>
              {inviteInfo ? 'I already have a password' : 'Back to sign in'}
            </button>
          )}
        </div>

        <p className="a-login-foot">Access is limited to invited team members.</p>
      </div>
    </div>
  );
}
