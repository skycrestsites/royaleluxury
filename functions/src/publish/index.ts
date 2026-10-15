import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { GITHUB_REPO, GITHUB_TOKEN, GITHUB_WORKFLOW, RESEND_API_KEY } from '../config.js';
import { db, FieldValue } from '../lib/firebase.js';
import { requireRole } from '../lib/guards.js';

/** Starts the GitHub Actions workflow that rebuilds and deploys the storefront. */
export const publishSite = onCall({ secrets: [GITHUB_TOKEN] }, async (request) => {
  const caller = requireRole(request, ['owner', 'admin']);
  const token = GITHUB_TOKEN.value();
  if (!token) {
    throw new HttpsError('failed-precondition', 'GitHub is not connected yet. Add the GITHUB_TOKEN secret to enable publishing.');
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO.value()}/actions/workflows/${GITHUB_WORKFLOW.value()}/dispatches`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'royaleluxury-admin',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  if (!response.ok) {
    logger.error('GitHub dispatch failed', { status: response.status, body: await response.text() });
    throw new HttpsError('unavailable', 'GitHub did not accept the publish request. Check the GitHub token permissions.');
  }

  await db.doc('site/publish').set(
    { status: 'building', requestedAt: FieldValue.serverTimestamp(), requestedBy: caller.token.email ?? caller.uid },
    { merge: true },
  );
  return { ok: true };
});

/** Reports which platforms are connected, without ever returning a secret value. */
export const integrationStatus = onCall({ secrets: [RESEND_API_KEY, GITHUB_TOKEN] }, async (request) => {
  requireRole(request, ['owner', 'admin']);
  return {
    resend: Boolean(RESEND_API_KEY.value()),
    github: Boolean(GITHUB_TOKEN.value()),
    stripe: false,
  };
});
