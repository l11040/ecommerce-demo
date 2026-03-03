'use client';

import { useEffect, useRef } from 'react';

export function HeaderRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        '--header-h',
        `${entry.contentRect.height}px`,
      );
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="sticky top-0 z-50 bg-background">
      {children}
    </div>
  );
}
