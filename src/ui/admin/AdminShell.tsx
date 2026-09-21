'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/insights', label: 'Insights' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/activity', label: 'Activity' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--paper)]">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <aside className="md:w-60 shrink-0 bg-[var(--ink)] text-white flex flex-col">
        <div className="p-6">
          <p className="text-xs tracking-[0.16em] text-[var(--gold)] uppercase">IEJF</p>
          <p className="mt-1 text-sm">Admin Portal</p>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 px-3">
          <ul className="flex md:flex-col gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-3 py-2 rounded text-sm whitespace-nowrap ${
                      active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-white/60">
          <p className="truncate mb-2">{email}</p>
          <button type="button" onClick={handleLogout} className="text-white/80 hover:text-white underline">
            Log out
          </button>
        </div>
      </aside>
      <main id="admin-main" className="flex-1 min-w-0 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
