import 'server-only';
import nodemailer from 'nodemailer';

/**
 * Server-side-only SMTP delivery (SendGrid SMTP relay in production). Every
 * env var is read here, never re-exported — nothing SMTP-related is ever
 * sent to the browser. Currently used only for MFA verification emails.
 */
export function isMailerConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM_EMAIL,
  );
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    // A hung SMTP connection must not hang the login request — fail fast so
    // the caller can return a clean error instead of a serverless timeout.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
  });
  return transporter;
}

const SEND_TIMEOUT_MS = 12_000;

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isMailerConfigured()) return { ok: false, error: 'Email delivery is not configured.' };

  const fromName = process.env.SMTP_FROM_NAME || 'Intergenerational Justice Fund';
  try {
    // Don't rely on nodemailer's own connection/socket timeouts alone — a
    // black-holed connection (no RST, no response) can outlast them
    // depending on the network stack. This guarantees the caller (a login
    // request) is never left hanging regardless of transport behaviour.
    await Promise.race([
      getTransporter().sendMail({
        from: `"${fromName}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        text,
        html,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('SMTP send timed out')), SEND_TIMEOUT_MS)),
    ]);
    return { ok: true };
  } catch (error) {
    // Never let a raw SMTP error (may include connection details) reach the caller's response body.
    console.error('sendMail failed:', error instanceof Error ? error.message : error);
    return { ok: false, error: 'Could not send email.' };
  }
}
