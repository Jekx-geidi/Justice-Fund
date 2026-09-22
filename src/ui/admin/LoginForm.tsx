'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { MfaVerifyForm } from './MfaVerifyForm';
import styles from './AdminLogin.module.css';

export function LoginForm({ initialReason }: { initialReason?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'mfa'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mfa, setMfa] = useState<{ challengeId: string; maskedEmail: string } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).catch(() => null);

    setSubmitting(false);
    const body = await response?.json().catch(() => null);

    if (!response || !response.ok) {
      setError(body?.error ?? 'Something went wrong. Please try again.');
      return;
    }

    if (body?.mfaRequired) {
      setMfa({ challengeId: body.challengeId, maskedEmail: body.maskedEmail });
      setStep('mfa');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  if (step === 'mfa' && mfa) {
    return (
      <MfaVerifyForm
        challengeId={mfa.challengeId}
        maskedEmail={mfa.maskedEmail}
        onBack={() => {
          setStep('password');
          setPassword('');
          setMfa(null);
          setError(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Welcome back</p>
        <h1 id="login-heading">Login to your account</h1>
        <p>Access the Intergenerational Justice Fund administration portal.</p>
      </div>

      {initialReason === 'replaced' && (
        <p role="alert" className={styles.sessionAlert}>
          Your account was signed in on another device. For security, this session has been ended.
        </p>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            placeholder="admin@justicefund.org.au"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="admin-password">Password</label>
          <div className={styles.passwordControl}>
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className={styles.passwordToggle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
