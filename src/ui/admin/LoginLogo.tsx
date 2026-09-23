import { getLogoConcept } from '@/lib/brand/logo-concepts';
import styles from './AdminLogin.module.css';

/**
 * Shows the published header logo (Site settings → Header), so login and site never drift apart.
 * With no logo chosen the header is text only, and so is this (the name sits beside it).
 */
export function LoginLogo({ logo, variant }: { logo: string; variant: 'panel' | 'compact' }) {
  const concept = logo ? getLogoConcept(logo) : undefined;
  if (!concept) return null;
  const size = variant === 'panel' ? 140 : 56;
  return (
    <img
      className={variant === 'panel' ? styles.logoOnDark : styles.logoOnLight}
      src={concept.file}
      alt="Intergenerational Justice Fund"
      width={size}
      height={size}
    />
  );
}
