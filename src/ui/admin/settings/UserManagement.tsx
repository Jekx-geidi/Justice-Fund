'use client';

import { useState } from 'react';
import type { AdminUserRecord } from '@/lib/auth/adminUsers';
import { MaterialButton, MaterialTextField } from '../material/MaterialControls';
import { useMaterialWeb } from '../material/useMaterialWeb';
import { ConfirmDialog } from '../ConfirmDialog';

type Status = 'idle' | 'saving' | 'error';
type ConfirmTarget = { email: string; action: 'disable' | 'terminate' };

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // matches SESSION_TTL_SECONDS in lib/auth/session.ts

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
}

function sessionIsLive(user: AdminUserRecord): boolean {
  if (!user.currentSessionId || !user.currentSessionStartedAt) return false;
  return Date.now() - new Date(user.currentSessionStartedAt).getTime() < SESSION_TTL_MS;
}

export function UserManagement({ initial, currentEmail }: { initial: AdminUserRecord[]; currentEmail: string }) {
  const [users, setUsers] = useState(initial);
  const [tab, setTab] = useState<'users' | 'sessions'>('users');
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [activationUrl, setActivationUrl] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);
  const materialReady = useMaterialWeb([
    () => import('@material/web/button/filled-button.js'),
    () => import('@material/web/button/outlined-button.js'),
    () => import('@material/web/textfield/outlined-text-field.js'),
  ]);

  async function refresh() {
    const response = await fetch('/api/admin/users').catch(() => null);
    if (response?.ok) {
      const body = await response.json();
      setUsers(body.users);
    }
  }

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    setError(null);

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setStatus('error');
      setError(body?.error ?? 'Could not create the account.');
      return;
    }

    const body = await response.json();
    setActivationUrl(body.activationUrl);
    setName('');
    setEmail('');
    setAddOpen(false);
    setStatus('idle');
    await refresh();
  }

  async function setActive(targetEmail: string, isActive: boolean) {
    setError(null);
    const response = await fetch(`/api/admin/users/${encodeURIComponent(targetEmail)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    }).catch(() => null);
    if (!response || !response.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.error ?? 'Could not update the account.');
      return;
    }
    await refresh();
  }

  async function terminate(targetEmail: string) {
    setError(null);
    const response = await fetch(`/api/admin/users/${encodeURIComponent(targetEmail)}/session`, { method: 'DELETE' }).catch(() => null);
    if (!response || !response.ok) {
      setError('Could not terminate that session.');
      return;
    }
    await refresh();
  }

  const activeSessionUsers = users.filter((user) => user.currentSessionId);

  return (
    <div className="space-y-4">
      <nav className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`px-4 py-1.5 rounded-full text-sm border ${tab === 'users' ? 'bg-[var(--ink)] text-white border-[var(--ink)]' : 'bg-white text-[var(--ink)] border-[var(--line)]'}`}
        >
          Users
        </button>
        <button
          type="button"
          onClick={() => setTab('sessions')}
          className={`px-4 py-1.5 rounded-full text-sm border ${tab === 'sessions' ? 'bg-[var(--ink)] text-white border-[var(--ink)]' : 'bg-white text-[var(--ink)] border-[var(--line)]'}`}
        >
          Active Sessions
        </button>
      </nav>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="border border-[var(--line)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-[var(--slate)]">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Session</th>
                  <th className="p-3">Added</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email} className="border-b border-[var(--line)] last:border-0">
                    <td className="p-3">{user.name || '—'}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.pending ? 'Pending activation' : user.isActive ? 'Active' : 'Disabled'}</td>
                    <td className="p-3">{sessionIsLive(user) ? 'Active' : 'Offline'}</td>
                    <td className="p-3">{formatDate(user.createdAt)}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {user.email.toLowerCase() !== currentEmail.toLowerCase() &&
                        (user.isActive ? (
                          <button
                            type="button"
                            className="text-red-700 underline text-xs"
                            onClick={() => setConfirmTarget({ email: user.email, action: 'disable' })}
                          >
                            Disable
                          </button>
                        ) : (
                          <button type="button" className="underline text-xs" onClick={() => void setActive(user.email, true)}>
                            Reactivate
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {activationUrl && (
            <div className="border border-[var(--line)] bg-[var(--paper)] p-4 text-sm">
              <p className="font-medium mb-1">Account created — share this activation link</p>
              <p className="text-[var(--slate)] mb-2">
                This link is shown once. Send it to the new admin so they can set their own password.
              </p>
              <code className="block break-all bg-white border border-[var(--line)] p-2 text-xs">{activationUrl}</code>
            </div>
          )}

          {!addOpen ? (
            <MaterialButton ready={materialReady} variant="outlined" onClick={() => setAddOpen(true)}>
              + Add Admin User
            </MaterialButton>
          ) : (
            <form onSubmit={handleAdd} className="border border-[var(--line)] p-4 space-y-3 max-w-sm">
              <MaterialTextField ready={materialReady} id="new-admin-name" label="Full name" value={name} onChange={setName} maxLength={150} />
              <MaterialTextField ready={materialReady} id="new-admin-email" label="Email" type="email" value={email} onChange={setEmail} maxLength={200} />
              <div className="flex items-center gap-3">
                <MaterialButton ready={materialReady} variant="filled" type="submit" disabled={status === 'saving'}>
                  {status === 'saving' ? 'Creating…' : 'Create Account'}
                </MaterialButton>
                <button type="button" className="text-sm underline" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'sessions' && (
        <div className="border border-[var(--line)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[var(--slate)]">
                <th className="p-3">User</th>
                <th className="p-3">Device</th>
                <th className="p-3">Signed in</th>
                <th className="p-3">Last activity</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {activeSessionUsers.map((user) => (
                <tr key={user.email} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-3">{user.name || user.email}</td>
                  <td className="p-3 max-w-[220px] truncate" title={user.currentSessionUserAgent ?? ''}>
                    {user.currentSessionUserAgent ?? '—'}
                  </td>
                  <td className="p-3">{formatDate(user.currentSessionStartedAt)}</td>
                  <td className="p-3">{formatDate(user.currentSessionLastSeenAt)}</td>
                  <td className="p-3">{sessionIsLive(user) ? 'Active' : 'Expired'}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="text-red-700 underline text-xs"
                      onClick={() => setConfirmTarget({ email: user.email, action: 'terminate' })}
                    >
                      Terminate
                    </button>
                  </td>
                </tr>
              ))}
              {activeSessionUsers.length === 0 && (
                <tr>
                  <td className="p-3 text-[var(--slate)]" colSpan={6}>
                    No active sessions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title={confirmTarget ? (confirmTarget.action === 'disable' ? `Disable ${confirmTarget.email}?` : 'Terminate this session?') : ''}
        description={
          confirmTarget
            ? confirmTarget.action === 'disable'
              ? 'This immediately signs them out and blocks sign-in until reactivated.'
              : 'This immediately signs that device out. They can sign in again from anywhere.'
            : ''
        }
        confirmLabel={confirmTarget?.action === 'disable' ? 'Disable' : 'Terminate'}
        onConfirm={() => {
          if (!confirmTarget) return;
          const { email: targetEmail, action } = confirmTarget;
          setConfirmTarget(null);
          if (action === 'disable') void setActive(targetEmail, false);
          else void terminate(targetEmail);
        }}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
