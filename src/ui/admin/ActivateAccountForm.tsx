'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ActivateAccountForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const response = await fetch('/api/admin/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setSubmitting(false);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? 'Something went wrong. Please try again.');
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push('/admin/login');
    }, 1500);
  }

  if (done) {
    return <p className="text-sm text-green-700">Your password is set. Redirecting you to sign in…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="field">
        <label htmlFor="activate-password">Choose a password</label>
        <input
          id="activate-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <p className="text-xs text-[var(--slate)] mt-1">At least 10 characters.</p>
      </div>
      <div className="field">
        <label htmlFor="activate-confirm">Confirm password</label>
        <input
          id="activate-confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="button button-dark w-full justify-center" disabled={submitting}>
        {submitting ? 'Setting password…' : 'Set password and continue'}
      </button>
    </form>
  );
}
