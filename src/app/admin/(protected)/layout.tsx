import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';
import { AdminShell } from '@/ui/admin/AdminShell';

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The authoritative check (Admin.md §18) — every /admin/* page under this
  // group is protected here, server-side, before any content is read.
  const email = await getSessionEmail();
  if (!email) redirect('/admin/login');

  return <AdminShell email={email}>{children}</AdminShell>;
}
