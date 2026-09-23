import { redirect } from 'next/navigation';
import { getSessionEmail } from '@/lib/auth/session';
import { BACKGROUND_IMAGES, LEGAL_NAME, backgroundUrl } from '@/lib/design/types';
import { getDesign } from '@/lib/content/content';
import { LoginForm } from '@/ui/admin/LoginForm';
import { LoginLogo } from '@/ui/admin/LoginLogo';
import styles from '@/ui/admin/AdminLogin.module.css';

export const metadata = { title: 'Sign in' };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const email = await getSessionEmail();
  if (email) redirect('/admin');
  const [{ reason }, design] = await Promise.all([searchParams, getDesign('live')]);
  const { logo } = design;
  // Same photo as the public site's background; the desert default when that is set to plain white.
  const photo = backgroundUrl(design) ?? BACKGROUND_IMAGES[0].url;

  return (
    <main className={styles.page}>
      <aside
        className={styles.brandPanel}
        aria-label="Intergenerational Justice Fund administration"
        style={{ '--login-photo': `url("${photo.replace(/["\\\n\r<>]/g, '')}")` } as React.CSSProperties}
      >
        <div className={styles.brandLogo}>
          <LoginLogo logo={logo} variant="panel" />
        </div>
        <div className={styles.brandText}>
          <p className={styles.brandName}>{LEGAL_NAME}</p>
          <p className={styles.brandLabel}>Administration Portal</p>
        </div>
      </aside>

      <section className={styles.formPanel} aria-labelledby="login-heading">
        <div className={styles.formShell}>
          {/* The dark brand panel is hidden on narrow screens, so the logo moves above the form there. */}
          <div className={styles.identity}>
            <LoginLogo logo={logo} variant="compact" />
            <p>{LEGAL_NAME}</p>
          </div>
          <LoginForm initialReason={reason} />
          <p className={styles.restricted}>Authorised administrators only</p>
        </div>
      </section>
    </main>
  );
}
