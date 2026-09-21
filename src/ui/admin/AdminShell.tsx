'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileText, Newspaper, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';

const NAV = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/pages', label: 'Pages', Icon: FileText },
  { href: '/admin/insights', label: 'Insights', Icon: Newspaper },
  { href: '/admin/media', label: 'Media', Icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
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
        <div className="px-6 py-5">
          <p className="text-xs tracking-[0.16em] text-[var(--gold)] uppercase">IEJF</p>
          <p className="mt-1 text-sm">Admin Portal</p>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 px-3">
          <ul className="flex md:flex-col gap-1 overflow-x-auto">
            {NAV.map(({ href, label, Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded text-sm whitespace-nowrap transition-colors ${
                      active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {active && <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-0.5 bg-[var(--gold)]" />}
                    <Icon size={16} aria-hidden="true" className={active ? 'text-[var(--gold)]' : ''} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-white/10 text-xs">
          <p className="truncate text-white/90">{email}</p>
          <p className="text-white/50 mb-2">Administrator</p>
          <button type="button" onClick={handleLogout} className="text-white/70 hover:text-white underline">
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
