'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import type { NavItem } from '@/lib/content/content';

export default function Header({ navigation }: { navigation: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 900px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  useEffect(() => {
    if (!open) return;
    const modal = dialog.current!;
    const opener = trigger.current;
    modal.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { modal.close(); document.body.style.overflow = previous; opener?.focus(); };
  }, [open]);
  return <header className="site-header">
    <div className="wrap header-inner">
      <Link href="/" className="brand" aria-label="Intergenerational Justice Fund home">
        <span className="brand-name">Intergenerational<br />Justice Fund<span className="gold">.</span><span className="brand-caption">CHARITY · PERTH, WA</span></span>
      </Link>
      <nav aria-label="Main navigation" className="desktop-nav">
        {navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>{item.label}{item.label === 'Contact' && <ArrowUpRight size={15} aria-hidden="true" />}</Link>)}
      </nav>
      <button ref={trigger} className="menu-trigger" aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(true)}><Menu aria-hidden="true" /></button>
    </div>
    <dialog ref={dialog} id="mobile-navigation" className="mobile-dialog" aria-label="Site navigation" onCancel={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }} onKeyDown={e => {
      if (e.key !== 'Tab') return;
      const items = e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]');
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}>
      <div className="mobile-panel">
        <div className="flex items-center justify-between"><span className="eyebrow">IEJF · NAVIGATION</span><button className="icon-button" aria-label="Close navigation" onClick={() => setOpen(false)}><X aria-hidden="true" /></button></div>
        <nav aria-label="Mobile navigation">{navigation.map((item, index) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} onClick={() => setOpen(false)}><span className="nav-number">0{index + 1}</span>{item.label}<ArrowUpRight aria-hidden="true" /></Link>)}</nav>
        <p className="mobile-caption">Intergenerational Justice Fund<br />CHARITY · PERTH, WA</p>
      </div>
    </dialog>
  </header>;
}
