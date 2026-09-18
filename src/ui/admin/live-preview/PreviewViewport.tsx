'use client';

import { useEffect, useRef, useState } from 'react';

const DEVICE_WIDTHS = { desktop: 1440, tablet: 820, mobile: 390 } as const;
export type DeviceMode = keyof typeof DEVICE_WIDTHS;

/**
 * Renders `children` at a fixed device width, then scales the whole frame
 * down (never up) to fit the available pane width — so the page's real
 * media queries see the real device width, not a squashed one (Live
 * Preview PRD §25).
 */
export function PreviewViewport({ mode, children }: { mode: DeviceMode; children: React.ReactNode }) {
  const width = DEVICE_WIDTHS[mode];
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const update = () => setScale(Math.min(1, outer.clientWidth / width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const update = () => setInnerHeight(inner.scrollHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="preview-viewport-outer" style={{ height: innerHeight * scale || undefined }}>
      <div ref={innerRef} className="preview-viewport-inner" style={{ width, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
