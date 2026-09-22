import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';
import { LoginForm } from '@/ui/admin/LoginForm';
import styles from '@/ui/admin/AdminLogin.module.css';

export const metadata = { title: 'Sign in' };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const email = await getSessionEmail();
  if (email) redirect('/admin');
  const { reason } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.formPanel} aria-labelledby="login-heading">
        <div className={styles.formShell}>
          <div className={styles.identity}>
            <Image src="/images/admin-login-logo.svg" alt="Intergenerational Justice Fund" width={58} height={57} priority unoptimized />
            <p>IEJF Administration</p>
          </div>
          <LoginForm initialReason={reason} />
          <p className={styles.restricted}>Authorised administrators only</p>
        </div>
      </section>
      <aside className={styles.artPanel} aria-label="Intergenerational Justice Fund website preview">
        <div className={styles.artIdentity}>
          <Image
            src="/images/admin-login-logo.svg"
            alt=""
            width={58}
            height={57}
            unoptimized
          />
          <p>A not-for-profit charity</p>
        </div>
        <Image
          src="/images/admin-login-art.svg"
          alt="IEJF website shown on mobile and desktop devices"
          fill
          priority
          unoptimized
          sizes="(max-width: 820px) 100vw, 50vw"
          className={styles.artwork}
        />
      </aside>
    </main>
  );
}
