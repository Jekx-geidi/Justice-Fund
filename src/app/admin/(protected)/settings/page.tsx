import Link from 'next/link';
import { getSessionEmail, SESSION_TTL_SECONDS } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/settings/siteSettings';
import { getSiteContent } from '@/lib/content/content';
import { listAuditRecords } from '@/lib/security/log';
import { WebsiteSettingsForm } from '@/ui/admin/settings/WebsiteSettingsForm';
import { formatExactDateTime } from '@/lib/content/formatRelativeDate';

export const metadata = { title: 'Settings' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[var(--line)] p-6 mb-6">
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
  const [settings, live, auditRecords] = await Promise.all([
    getSiteSettings(),
    getSiteContent('live'),
    listAuditRecords(50),
  ]);

  const lastLogin = auditRecords.find((record) => record.event === 'login_success' && record.admin === email);
  const securityEvents = auditRecords
    .filter((record) => record.event === 'login_success' || record.event === 'login_failure' || record.event === 'authorisation_failure')
    .slice(0, 5);

  const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <div className="max-w-2xl">
      <p className="eyebrow">SETTINGS</p>
      <h1 className="text-3xl mt-2 mb-8">Settings</h1>

      <Section title="Website">
        <WebsiteSettingsForm initial={settings} />
      </Section>

      <Section title="Admin Account">
        <Row label="Signed in as" value={email} />
        <Row label="Role" value="Administrator" />
        <Row label="Account status" value="Active" />
        <Row label="Last login" value={lastLogin ? formatExactDateTime(lastLogin.createdAt) : 'Not available'} />
        <p className="text-sm text-[var(--slate)] mt-4">
          Password change and multi-admin invitations are not available in this version.
        </p>
      </Section>

      <Section title="Security">
        <Row label="Multi-factor authentication" value="Not configured" />
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

      <Section title="Publishing">
        <Row label="Default new-page status" value="Draft" />
        <Row label="Default navigation visibility" value="Hidden" />
        <Row label="Default new-page navigation position" value="Last" />
        <Row label="Confirm before publishing" value="Enabled" />
        <p className="text-xs text-[var(--slate)] mt-4">
          These defaults are enforced by the server and can&rsquo;t be weakened from this page.
        </p>
      </Section>

      <Section title="System Information">
        <Row label="CMS" value="IEJF Admin Portal" />
        <Row label="Content Storage" value={isSupabaseConfigured ? 'Supabase' : 'Local JSON (dev fallback)'} />
        <Row label="Media Storage" value={isSupabaseConfigured ? 'Supabase Storage' : 'Local disk (dev fallback)'} />
        <Row label="Environment" value={process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} />
        <Row label="Last Content Publish" value={formatExactDateTime(live.updatedAt)} />
      </Section>
    </div>
  );
}
