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
  Menu,
  X,
} from 'lucide-react';
import { HelpDialog } from './HelpDialog';
import './material/theme.css';
import './AdminShell.css';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pageTitle = NAV.find(({ href }) => href === '/admin' ? pathname === href : pathname.startsWith(href))?.label ?? 'IEJF Admin';

  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setDrawerOpen(false);
  }

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1025px)');
    const onResize = () => { if (desktop.matches) setDrawerOpen(false); };
    desktop.addEventListener('change', onResize);
    return () => desktop.removeEventListener('change', onResize);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const sidebar = sidebarRef.current;
    const menuButton = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])
        .filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (window.matchMedia('(min-width: 1025px)').matches) {
        sidebar?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
      } else {
        menuButton?.focus();
      }
    };
  }, [drawerOpen]);

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
    <div className="admin-shell min-h-screen flex flex-col min-[1025px]:flex-row bg-[var(--paper)]">
      <a href="#admin-main" className="skip-link" inert={drawerOpen}>
        Skip to content
      </a>
      <header className="admin-mobile-header" inert={drawerOpen}>
        <button ref={menuButtonRef} type="button" className="admin-menu-button"
          aria-label={drawerOpen ? 'Close admin navigation' : 'Open admin navigation'}
          aria-expanded={drawerOpen} aria-controls="admin-navigation-panel"
          onClick={() => { setAccountMenuOpen(false); setDrawerOpen(open => !open); }}>
          <Menu size={22} aria-hidden="true" />
        </button>
        <span>{pageTitle}</span>
      </header>
      {drawerOpen && <div className="admin-drawer-overlay" aria-hidden="true" onClick={() => setDrawerOpen(false)} />}
      <aside id="admin-navigation-panel" ref={sidebarRef}
        role={drawerOpen ? 'dialog' : undefined} aria-modal={drawerOpen || undefined}
        aria-label={drawerOpen ? 'Admin navigation' : undefined}
        data-open={drawerOpen} className={`admin-sidebar ${collapsed ? 'min-[1025px]:w-[68px]' : 'min-[1025px]:w-60'} shrink-0 bg-[var(--ink)] text-white flex flex-col transition-[width] duration-150`}>
        <button ref={closeButtonRef} type="button" className="admin-drawer-close admin-menu-button"
          aria-label="Close admin navigation" onClick={() => setDrawerOpen(false)}>
          <X size={22} aria-hidden="true" />
        </button>
        <div className="px-6 py-5 min-[1025px]:px-4">
          <p className="text-xs tracking-[0.16em] text-[var(--gold)] uppercase">IEJF</p>
          <p className={`mt-1 text-sm ${collapsed ? 'min-[1025px]:hidden' : ''}`}>Admin Portal</p>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 px-3">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ href, label, Icon }) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    aria-label={label}
                    title={collapsed ? label : undefined}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded text-sm whitespace-nowrap transition-colors ${
                      collapsed ? 'min-[1025px]:justify-center min-[1025px]:px-0' : ''
                    } ${active ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white'}`}
                  >
                    {active && <span aria-hidden="true" className="absolute left-0 top-1 bottom-1 w-0.5 bg-[var(--gold)]" />}
                    <Icon size={16} aria-hidden="true" className={active ? 'text-[var(--gold)] shrink-0' : 'shrink-0'} />
                    <span className={collapsed ? 'min-[1025px]:hidden' : ''}>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-3 pb-2 border-t border-white/10 pt-2">
          <button
            type="button"
            onClick={() => { setDrawerOpen(false); setHelpOpen(true); }}
            title={collapsed ? 'Help' : undefined}
            aria-label="Help"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white ${collapsed ? 'min-[1025px]:justify-center min-[1025px]:px-0' : ''}`}
          >
            <CircleHelp size={16} aria-hidden="true" className="shrink-0" />
            <span className={collapsed ? 'min-[1025px]:hidden' : ''}>Help</span>
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden min-[1025px]:flex w-full items-center gap-2.5 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white ${collapsed ? 'justify-center px-0' : ''}`}
          >
            {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" className="shrink-0" /> : <PanelLeftClose size={16} aria-hidden="true" className="shrink-0" />}
            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>

        <div ref={accountMenuRef} className="relative px-3 pt-2 pb-2 border-t border-white/10 text-xs">
          <div
            role="menu"
            aria-hidden={!accountMenuOpen}
            inert={!accountMenuOpen}
            className={`absolute bottom-full left-3 mb-2 ${collapsed ? 'min-w-40' : 'right-3'} bg-[var(--ink)] border border-white/10 rounded shadow-lg origin-bottom-left transition-all duration-150 ${
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
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded hover:bg-white/10 ${collapsed ? 'min-[1025px]:justify-center' : ''}`}
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
            <div className={`min-w-0 flex-1 text-left ${collapsed ? 'min-[1025px]:hidden' : ''}`}>
              <p className="truncate text-white/90 font-medium" title={email}>
                {name || email}
              </p>
              <p className="text-white/50">Administrator</p>
            </div>
          </button>
        </div>
      </aside>
      <main inert={drawerOpen} id="admin-main" className="flex-1 min-w-0 p-6 min-[1025px]:p-10">
        {children}
      </main>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
