'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Image as ImageIcon,
  Settings as SettingsIcon,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react';
import { HelpDialog } from './HelpDialog';
import './material/theme.css';

const NAV = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/pages', label: 'Pages', Icon: FileText },
  { href: '/admin/insights', label: 'Insights', Icon: Newspaper },
  { href: '/admin/media', label: 'Media', Icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
];

const COLLAPSE_STORAGE_KEY = 'iejf-admin-sidebar-collapsed';

export function AdminShell({
  email,
  name,
  avatarUrl,
  children,
}: {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) setAccountMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === '1');
    } catch {
      /* localStorage unavailable (private mode, etc.) — default expanded. */
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? '1' : '0');
    } catch {
      /* Non-fatal — just won't persist across reloads. */
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="admin-shell min-h-screen flex flex-col md:flex-row bg-[var(--paper)]">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <aside className={`${collapsed ? 'md:w-[68px]' : 'md:w-60'} shrink-0 bg-[var(--ink)] text-white flex flex-col transition-[width] duration-150`}>
        <div className="px-6 py-5 md:px-4">
          <p className="text-xs tracking-[0.16em] text-[var(--gold)] uppercase">IEJF</p>
          <p className={`mt-1 text-sm ${collapsed ? 'md:hidden' : ''}`}>Admin Portal</p>
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
                    aria-label={label}
                    title={collapsed ? label : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded text-sm whitespace-nowrap transition-colors ${
                      collapsed ? 'md:justify-center md:px-0' : ''
                    } ${active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
                  >
                    {active && <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-0.5 bg-[var(--gold)]" />}
                    <Icon size={16} aria-hidden="true" className={active ? 'text-[var(--gold)] shrink-0' : 'shrink-0'} />
                    <span className={collapsed ? 'md:hidden' : ''}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-2 border-t border-white/10 pt-2">
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            title={collapsed ? 'Help' : undefined}
            aria-label="Help"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white ${collapsed ? 'md:justify-center md:px-0' : ''}`}
          >
            <CircleHelp size={16} aria-hidden="true" className="shrink-0" />
            <span className={collapsed ? 'md:hidden' : ''}>Help</span>
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden md:flex w-full items-center gap-2.5 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white ${collapsed ? 'justify-center px-0' : ''}`}
          >
            {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" className="shrink-0" /> : <PanelLeftClose size={16} aria-hidden="true" className="shrink-0" />}
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>

        <div ref={accountMenuRef} className="relative px-3 pt-2 pb-2 border-t border-white/10 text-xs">
          <div
            role="menu"
            aria-hidden={!accountMenuOpen}
            className={`absolute bottom-full left-3 mb-2 w-44 bg-[var(--ink)] border border-white/10 rounded shadow-lg origin-bottom-left transition-all duration-150 ${
              accountMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium text-white/85 hover:text-white hover:bg-white/10"
            >
              <LogOut size={16} aria-hidden="true" className="shrink-0" />
              <span>Log out</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAccountMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            title={collapsed ? name || email : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-white/10 ${collapsed ? 'md:justify-center' : ''}`}
          >
            <span className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0 relative">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill sizes="32px" className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-[11px] font-medium text-white/70" aria-hidden="true">
                  {(name || email).charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <div className={`min-w-0 flex-1 text-left ${collapsed ? 'md:hidden' : ''}`}>
              <p className="truncate text-white/90 font-medium" title={email}>
                {name || email}
              </p>
              <p className="text-white/50">Administrator</p>
            </div>
          </button>
        </div>
      </aside>
      <main id="admin-main" className="flex-1 min-w-0 p-6 md:p-10">
        {children}
      </main>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
