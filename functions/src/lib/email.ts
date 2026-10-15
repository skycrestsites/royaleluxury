import { logger } from 'firebase-functions/v2';
import { EMAIL_FROM, RESEND_API_KEY } from '../config.js';

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type EmailResult = { sent: true; id: string } | { sent: false; reason: string };

/** Sends a transactional email through Resend. Never throws, so callers can fall back gracefully. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const apiKey = RESEND_API_KEY.value();
  if (!apiKey) return { sent: false, reason: 'Email is not configured.' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM.value(), ...message }),
    });
    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!response.ok || !body.id) {
      logger.warn('Resend rejected the email', { status: response.status, message: body.message });
      return { sent: false, reason: body.message ?? `Email provider returned ${response.status}.` };
    }
    return { sent: true, id: body.id };
  } catch (error) {
    logger.error('Email request failed', error);
    return { sent: false, reason: 'Could not reach the email provider.' };
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function inviteEmail(options: { link: string; role: string; invitedBy: string; expiresInDays: number }) {
  const { link, role, invitedBy, expiresInDays } = options;
  const safeInviter = escapeHtml(invitedBy);
  return {
    subject: 'You have been invited to the Royale Luxury admin',
    text: `${invitedBy} invited you to join the Royale Luxury admin as ${role}.\n\nAccept your invite: ${link}\n\nThis link expires in ${expiresInDays} days and can be used once.`,
    html: `<!doctype html>
<html><body style="margin:0;background:#f6f6f7;font-family:Inter,Segoe UI,Arial,sans-serif;color:#262a33">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e6e4e1">
        <tr><td style="background:#262a33;padding:28px 32px;text-align:center">
          <div style="font-family:Georgia,serif;font-size:24px;letter-spacing:4px;color:#ffffff">ROYALE</div>
          <div style="font-size:10px;letter-spacing:6px;color:#c5a775;margin-top:4px">LUXURY</div>
        </td></tr>
        <tr><td style="padding:36px 32px">
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:600;font-size:26px">You are invited</h1>
          <p style="margin:0 0 24px;line-height:1.6;color:#5f636b">${safeInviter} invited you to join the Royale Luxury admin as <strong style="color:#262a33">${role}</strong>.</p>
          <a href="${link}" style="display:inline-block;background:#262a33;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Accept invite</a>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#5f636b">This link expires in ${expiresInDays} days and can only be used once. If you were not expecting this email, you can ignore it.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  };
}
