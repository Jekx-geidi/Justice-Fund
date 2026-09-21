import { redirect } from 'next/navigation';
import { checkSession } from '@/lib/auth/session';
import { getAdminUser } from '@/lib/auth/adminUsers';
import { AdminShell } from '@/ui/admin/AdminShell';

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The authoritative check (Admin.md §18) — every /admin/* page under this
  // group is protected here, server-side, before any content is read.
  const session = await checkSession();
  if (session.status === 'replaced') redirect('/admin/login?reason=replaced');
  if (session.status !== 'valid') redirect('/admin/login');

  const profile = await getAdminUser(session.email);

  return (
    <AdminShell email={session.email} name={profile?.name || null} avatarUrl={profile?.avatar?.url ?? null}>
      {children}
    </AdminShell>
  );
}
