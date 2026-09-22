'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminLogin.module.css';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

type TerminalStatus = 'used' | 'not_found' | 'locked';

export function MfaVerifyForm({
  challengeId: initialChallengeId,
  maskedEmail: initialMaskedEmail,
  onBack,
}: {
  challengeId: string;
  maskedEmail: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const [challengeId, setChallengeId] = useState(initialChallengeId);
  const [maskedEmail, setMaskedEmail] = useState(initialMaskedEmail);
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [terminal, setTerminal] = useState<TerminalStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otp = digits.join('');

  async function submit(code: string) {
    if (code.length !== OTP_LENGTH || submitting || terminal) return;
    setSubmitting(true);
    setError(null);

    const response = await fetch('/api/admin/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, otp: code }),
    }).catch(() => null);

    setSubmitting(false);

    if (response?.ok) {
      router.push('/admin');
      router.refresh();
      return;
    }

    const body = await response?.json().catch(() => null);
    const status = body?.status as string | undefined;
    setError(body?.error ?? "We couldn't verify that code. Please try again.");
    setDigits(Array(OTP_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
    if (status === 'used' || status === 'not_found' || status === 'locked') {
      setTerminal(status);
    }
  }

  function updateDigit(index: number, raw: string) {
    const value = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
    const full = next.join('');
    if (full.length === OTP_LENGTH) void submit(full);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setDigits(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH) - 1;
    inputsRef.current[Math.max(lastFilled, 0)]?.focus();
    if (pasted.length === OTP_LENGTH) void submit(pasted);
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    const response = await fetch('/api/admin/mfa/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId }),
    }).catch(() => null);

    setResending(false);
    const body = await response?.json().catch(() => null);

    if (!response?.ok) {
      setError(body?.error ?? "We couldn't resend the code. Please try again.");
      if (typeof body?.retryAfterSeconds === 'number') setCooldown(body.retryAfterSeconds);
      return;
    }

    setChallengeId(body.challengeId);
    setMaskedEmail(body.maskedEmail);
    setCooldown(body.cooldownSeconds ?? RESEND_COOLDOWN_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    setTerminal(null);
    inputsRef.current[0]?.focus();
  }

  return (
    <div>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Verify your identity</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>Enter your verification code</h1>
        <p>
          We sent a 6-digit verification code to <strong>{maskedEmail}</strong>.
        </p>
      </div>

      <div role="group" aria-label="6-digit verification code" className={styles.otpRow} onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={submitting || Boolean(terminal)}
            aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
            className={styles.otpDigit}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className={styles.error} style={{ marginBottom: 18 }}>
          {error}
        </p>
      )}

      {!terminal && (
        <button type="button" className={styles.submit} disabled={submitting || otp.length !== OTP_LENGTH} onClick={() => void submit(otp)}>
          {submitting ? 'Verifying…' : 'Verify'}
        </button>
      )}

      <div className={styles.linkRow}>
        {!terminal && (
          <button type="button" className={styles.linkButton} disabled={cooldown > 0 || resending} onClick={() => void handleResend()}>
            {resending ? 'Resending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
        )}
        <button type="button" className={styles.linkButton} onClick={onBack}>
          Back to login
        </button>
      </div>
    </div>
  );
}
