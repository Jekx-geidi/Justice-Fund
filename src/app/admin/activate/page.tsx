import { ActivateAccountForm } from '@/ui/admin/ActivateAccountForm';

export const metadata = { title: 'Activate your account' };

export default async function ActivateAccountPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-6">
      <div className="w-full max-w-sm bg-white border border-[var(--line)] p-8">
        <p className="eyebrow">IEJF ADMIN</p>
        <h1 className="text-2xl mt-3 mb-1">Activate your account</h1>
        {token ? (
          <>
            <p className="text-sm text-[var(--slate)] mb-6">Set a password to finish setting up your Admin account.</p>
            <ActivateAccountForm token={token} />
          </>
        ) : (
          <p className="text-sm text-red-700 mt-4">This activation link is missing its token. Ask an admin to resend it.</p>
        )}
      </div>
    </div>
  );
}
