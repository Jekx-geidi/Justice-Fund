import Link from 'next/link';
import { getSessionEmail, SESSION_TTL_SECONDS } from '@/lib/auth/session';
import { getSiteContent } from '@/lib/content/content';
import { listAuditRecords } from '@/lib/security/log';
import { listAdminUsers } from '@/lib/auth/adminUsers';
import { EditorPreferencesForm } from '@/ui/admin/settings/EditorPreferencesForm';
import { UserManagement } from '@/ui/admin/settings/UserManagement';
import { AdminProfileForm } from '@/ui/admin/settings/AdminProfileForm';
import { SettingsTabs } from '@/ui/admin/settings/SettingsTabs';
import { getEditorPreferences } from '@/lib/settings/editorPreferences';
import { formatExactDateTime } from '@/lib/content/formatRelativeDate';
import { isMfaConfigured } from '@/lib/auth/mfa';
import { SITE_EDITOR_HREF } from '@/lib/design/types';

export const metadata = { title: 'Settings' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[var(--line)] p-6">
      <h2 className="text-lg mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-2 border-b border-[var(--line)] last:border-0 text-sm">
      <span className="text-[var(--slate)]">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default async function AdminSettings() {
  const email = await getSessionEmail();
  const [editorPreferences, live, auditRecords, adminUsers] = await Promise.all([
    getEditorPreferences(),
    getSiteContent('live'),
    listAuditRecords(50),
    listAdminUsers(),
  ]);

  const lastLogin = auditRecords.find((record) => record.event === 'login_success' && record.admin === email);
  const securityEvents = auditRecords
    .filter((record) => record.event === 'login_success' || record.event === 'login_failure' || record.event === 'authorisation_failure')
    .slice(0, 5);

  const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="max-w-3xl">
      <p className="eyebrow">SETTINGS</p>
      <h1 className="text-3xl mt-2 mb-6">Settings</h1>

      <SettingsTabs
        tabs={[
          {
            id: 'website',
            label: 'Website',
            content: (
              <Section title="Website">
                {/* Visual and site-wide settings have one home, the on-site Site settings panel, so they aren't duplicated here. */}
                <p className="text-sm text-[var(--slate)] mb-4">
                  Background, layout, fonts, sizes, colours, header and logo, the homepage heading, contact email, ABN and search
                  settings are edited on the website itself, where you can see each change before you publish it.
                </p>
                <a href={SITE_EDITOR_HREF} className="button button-dark inline-flex">
                  Open Site Editor
                </a>
              </Section>
            ),
          },
          {
            id: 'editor-preview',
            label: 'Editor & Preview',
            content: (
              <Section title="Editor & Preview">
                <EditorPreferencesForm initial={editorPreferences} />
              </Section>
            ),
          },
          {
            id: 'admin-account',
            label: 'Account',
            content: (
              <Section title="Account">
                <Row label="Signed in as" value={email} />
                <Row label="Role" value="Administrator" />
                <Row label="Account status" value={adminUsers.find((user) => user.email === email)?.isActive === false ? 'Disabled' : 'Active'} />
                <Row label="Last login" value={lastLogin ? formatExactDateTime(lastLogin.createdAt) : 'Not available'} />
                <p className="text-sm text-[var(--slate)] mt-4 mb-6">Password change is not available in this version.</p>
                {isSupabaseConfigured ? (
                  <AdminProfileForm initial={adminUsers.find((user) => user.email === email)?.avatar ?? null} />
                ) : (
                  <p className="text-sm text-[var(--slate)]">Profile pictures require Supabase to be configured.</p>
                )}
              </Section>
            ),
          },
          {
            id: 'user-management',
            label: 'User Management',
            content: (
              <Section title="User Management">
                {isSupabaseConfigured ? (
                  <UserManagement initial={adminUsers} currentEmail={email ?? ''} />
                ) : (
                  <p className="text-sm text-[var(--slate)]">User management requires Supabase to be configured.</p>
                )}
              </Section>
            ),
          },
          {
            id: 'security',
            label: 'Security & MFA',
            content: (
              <Section title="Security & MFA">
                <Row label="Multi-factor authentication" value={isMfaConfigured() ? 'Email code at every sign-in' : 'Not configured (local development)'} />
                <Row label="Session length" value={`${SESSION_TTL_SECONDS / 3600} hours`} />
                <Row label="Login rate limiting" value="5 attempts / 15 min per IP" />
                {securityEvents.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Recent security events</p>
                    <ul className="text-sm space-y-1">
                      {securityEvents.map((record) => (
                        <li key={record.id} className="flex justify-between gap-2 text-[var(--slate)]">
                          <span>
                            {record.event === 'login_success' && 'Signed in'}
                            {record.event === 'login_failure' && 'Failed sign-in attempt'}
                            {record.event === 'authorisation_failure' && 'Unauthorised request blocked'}
                            {record.admin ? ` — ${record.admin}` : ''}
                          </span>
                          <span>{formatExactDateTime(record.createdAt)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-4">
                  <Link href="/admin/activity" className="text-sm underline">
                    View full activity log
                  </Link>
                </p>
              </Section>
            ),
          },
          {
            id: 'publishing',
            label: 'Publishing',
            content: (
              <Section title="Publishing">
                <Row label="Default new-page status" value="Draft" />
                <Row label="Default navigation visibility" value="Hidden" />
                <Row label="Default new-page navigation position" value="Last" />
                <Row label="Confirm before publishing" value="Enabled" />
                <p className="text-xs text-[var(--slate)] mt-4">
                  These defaults are enforced by the server and can&rsquo;t be weakened from this page.
                </p>
              </Section>
            ),
          },
          {
            id: 'system-information',
            label: 'System Information',
            content: (
              <Section title="System Information">
                <Row label="CMS" value="IEJF Admin Portal" />
                <Row label="Content Storage" value={isSupabaseConfigured ? 'Supabase' : 'Local JSON (dev fallback)'} />
                <Row label="Media Storage" value={isSupabaseConfigured ? 'Supabase Storage' : 'Local disk (dev fallback)'} />
                <Row label="Environment" value={process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} />
                <Row label="Last Content Publish" value={formatExactDateTime(live.updatedAt)} />
              </Section>
            ),
          },
        ]}
      />
    </div>
  );
}
