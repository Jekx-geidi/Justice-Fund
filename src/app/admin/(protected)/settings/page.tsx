import { getSessionEmail } from '@/lib/auth/session';

export const metadata = { title: 'Settings' };

export default async function AdminSettings() {
  const email = await getSessionEmail();

  return (
    <div className="max-w-lg">
      <p className="eyebrow">SETTINGS</p>
      <h1 className="text-3xl mt-2 mb-6">Settings</h1>

      <div className="bg-white border border-[var(--line)] p-6 space-y-2 text-sm">
        <p>
          <span className="text-[var(--slate)]">Signed in as</span> {email}
        </p>
        <p className="text-[var(--slate)]">
          Phase 1 launches with a single admin account, provisioned via environment variables. Password changes and
          additional admin accounts are a Phase 2 enhancement (see Admin.md §49, open question 2).
        </p>
      </div>
    </div>
  );
}
