import { defineSecret, defineString } from 'firebase-functions/params';

export const REGION = 'us-central1';

export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
export const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

/** Comma-separated list of emails that are granted the owner role on first sign-in. */
export const OWNER_EMAILS = defineString('OWNER_EMAILS', { default: 'netspirestudios@gmail.com' });
export const SITE_URL = defineString('SITE_URL', { default: 'https://royaleluxury.com' });
export const EMAIL_FROM = defineString('EMAIL_FROM', { default: 'Royale Luxury <team@royaleluxury.com>' });
export const GITHUB_REPO = defineString('GITHUB_REPO', { default: 'skycrestsites/royaleluxury' });
export const GITHUB_WORKFLOW = defineString('GITHUB_WORKFLOW', { default: 'deploy.yml' });
