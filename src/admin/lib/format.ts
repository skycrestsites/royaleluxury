import type { Timestamp } from 'firebase/firestore';

export const money = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const date = (value?: Timestamp | null, withTime = false) =>
  value
    ? value.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
      })
    : '';

export function bytes(value = 0) {
  if (value < 1024) return `${value} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Turns Firebase errors into short, readable messages. */
export function errorMessage(error: unknown) {
  const code = (error as { code?: string })?.code ?? '';
  const known: Record<string, string> = {
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
    'auth/weak-password': 'Use a password with at least 8 characters.',
    'auth/popup-closed-by-user': 'The sign-in window was closed.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'permission-denied': 'You do not have permission to do that.',
    'functions/permission-denied': 'You do not have permission to do that.',
  };
  if (known[code]) return known[code];
  const message = (error as { message?: string })?.message;
  return (
    message
      ?.replace(/^Firebase:\s*/, '')
      .replace(/\s*\(.*\)\.?$/, '')
      .replace(/\s*\[\d+\]$/, '') || 'Something went wrong. Please try again.'
  );
}
