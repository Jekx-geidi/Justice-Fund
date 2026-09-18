import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';
import { LoginForm } from '@/ui/admin/LoginForm';

export const metadata = { title: 'Sign in' };

export default async function AdminLoginPage() {
  const email = await getSessionEmail();
  if (email) redirect('/admin');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-6">
      <div className="w-full max-w-sm bg-white border border-[var(--line)] p-8">
        <p className="eyebrow">IEJF ADMIN</p>
        <h1 className="text-2xl mt-3 mb-1">Sign in</h1>
        <p className="text-sm text-[var(--slate)] mb-6">Manage the Intergenerational Justice Fund website.</p>
        <LoginForm />
      </div>
    </div>
  );
}
