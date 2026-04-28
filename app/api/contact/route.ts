import { Resend } from 'resend';
import { isContactRateLimited, isGlobalContactCapped } from '@/lib/rate-limit';
import { isAllowedOrigin } from '@/lib/api-security';

const resendKey = process.env.RESEND_API_KEY || '';
const resend = resendKey ? new Resend(resendKey) : null;

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'marcus.pff03@gmail.com';
const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUESTION = 10;
const MAX_QUESTION = 2000;
const MIN_FILL_TIME_MS = 3_000;
const MAX_FILL_TIME_MS = 60 * 60 * 1000;
const MAX_URLS_IN_QUESTION = 2;
const URL_RE = /https?:\/\/[^\s]+/gi;

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // not configured — skip (dev/local)
  if (!token) return false;
  try {
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
          remoteip: ip,
        }),
      },
    );
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      console.warn('[Contact API] Turnstile rejected:', data['error-codes']);
    }
    return data.success === true;
  } catch (err) {
    console.error('[Contact API] Turnstile verify error:', err);
    return false;
  }
}

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return jsonResponse({ error: 'Forbidden.' }, 403);
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  let body: {
    email?: unknown;
    question?: unknown;
    website?: unknown;
    elapsed?: unknown;
    turnstileToken?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid request.' }, 400);
  }

  // Honeypot — silently accept and discard. Bots fill every field.
  const honeypot = typeof body.website === 'string' ? body.website : '';
  if (honeypot.length > 0) {
    console.warn('[Contact API] Honeypot triggered from IP:', ip);
    return jsonResponse({ ok: true });
  }

  // Time-to-submit check — reject scripts that fill and submit instantly.
  const elapsed = typeof body.elapsed === 'number' ? body.elapsed : 0;
  if (elapsed < MIN_FILL_TIME_MS) {
    return jsonResponse({ error: 'Please take a moment before sending.' }, 400);
  }
  if (elapsed > MAX_FILL_TIME_MS) {
    return jsonResponse({ error: 'Form expired. Please reload the page.' }, 400);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const question = typeof body.question === 'string' ? body.question.trim() : '';

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return jsonResponse({ error: 'Please enter a valid email.' }, 400);
  }
  if (question.length < MIN_QUESTION) {
    return jsonResponse(
      { error: `Question must be at least ${MIN_QUESTION} characters.` },
      400,
    );
  }
  if (question.length > MAX_QUESTION) {
    return jsonResponse(
      { error: `Question must be under ${MAX_QUESTION} characters.` },
      400,
    );
  }

  // Block link-spam patterns.
  const urlMatches = question.match(URL_RE) || [];
  if (urlMatches.length > MAX_URLS_IN_QUESTION) {
    return jsonResponse(
      { error: 'Too many links. Please reach out without external URLs.' },
      400,
    );
  }

  // Cloudflare Turnstile — bot challenge.
  const turnstileToken =
    typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return jsonResponse(
      { error: 'Verification failed. Please reload the page and try again.' },
      400,
    );
  }

  // Stricter rate limit for the contact form (3 per 10min, 10 per day per IP).
  if (isContactRateLimited(ip)) {
    return jsonResponse(
      { error: 'Too many messages. Please wait a bit before sending another.' },
      429,
    );
  }

  // Global daily safety valve.
  if (isGlobalContactCapped()) {
    console.warn('[Contact API] Global daily cap hit.');
    return jsonResponse(
      {
        error:
          'The contact form is temporarily paused. Please reach out via the social links.',
      },
      429,
    );
  }

  if (!resend) {
    console.error('[Contact API] RESEND_API_KEY not configured.');
    return jsonResponse({ error: 'Service temporarily unavailable.' }, 500);
  }

  const safeEmail = escapeHtml(email);
  const safeQuestion = escapeHtml(question);

  try {
    const { error: sendError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New question from ${email}`,
      text: `From: ${email}\n\n${question}\n\n---\nSent from portfolio contact form\nIP: ${ip}`,
      html: `<div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
  <h2 style="font-size: 18px; margin: 0 0 8px;">New question from your portfolio</h2>
  <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">Hit reply to respond to ${safeEmail}</p>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
    <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 4px;">From</p>
    <p style="font-size: 14px; margin: 0 0 16px;">${safeEmail}</p>
    <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 4px;">Question</p>
    <p style="font-size: 14px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${safeQuestion}</p>
  </div>
  <p style="color: #94a3b8; font-size: 11px; margin-top: 16px;">IP: ${ip}</p>
</div>`,
    });

    if (sendError) {
      console.error('[Contact API] Resend failed:', sendError);
      return jsonResponse(
        { error: 'Could not send message. Please try again.' },
        500,
      );
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error('[Contact API] Unexpected error:', err);
    return jsonResponse({ error: 'Could not send message. Please try again.' }, 500);
  }
}
