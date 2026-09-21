'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DEVICE_WIDTHS = { desktop: 1440, tablet: 820, mobile: 390 } as const;
export type DeviceMode = keyof typeof DEVICE_WIDTHS;

/** A real document viewport makes media queries and vw units match the selected device. */
export function PreviewViewport({ mode, children }: { mode: DeviceMode; children: React.ReactNode }) {
  const width = DEVICE_WIDTHS[mode];
  const outerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [available, setAvailable] = useState(0);
  const [height, setHeight] = useState(800);
  const scale = Math.min(1, available / width);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const connect = () => setMount(frame.contentDocument?.getElementById('preview-content') ?? null);
    frame.addEventListener('load', connect);
    connect();
    return () => frame.removeEventListener('load', connect);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const observer = new ResizeObserver(() => setAvailable(outer.clientWidth));
    setAvailable(outer.clientWidth);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mount) return;
    const doc = mount.ownerDocument;
    // Copy the site's compiled styles, including local fonts, without executing scripts.
    const syncStyles = () => {
      doc.head.querySelectorAll('[data-preview-style]').forEach(node => node.remove());
      document.head.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
        const copy = node.cloneNode(true) as HTMLElement;
        copy.setAttribute('data-preview-style', '');
        doc.head.appendChild(copy);
      });
    };
    syncStyles();
    const styles = new MutationObserver(syncStyles);
    styles.observe(document.head, { childList: true, subtree: true, characterData: true });
    const observer = new ResizeObserver(() => setHeight(Math.ceil(mount.getBoundingClientRect().height)));
    observer.observe(mount);
    return () => { styles.disconnect(); observer.disconnect(); };
  }, [mount]);

  return (
    <div ref={outerRef} className="preview-viewport-outer" style={{ height: height * scale || 400 }}>
      <iframe
        ref={frameRef}
        title="Live page preview"
        sandbox="allow-same-origin"
        srcDoc={'<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body style="margin:0"><main id="preview-content" style="display:flow-root"></main></body></html>'}
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', marginLeft: Math.max(0, (available - width * scale) / 2), border: 0, display: 'block', background: 'white' }}
      />
      {mount && createPortal(children, mount)}
    </div>
  );
}
