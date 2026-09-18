import React, { useEffect, useRef } from 'react';

const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, [data-cursor]';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add('custom-cursor-on');

    let mx = -100, my = -100, rx = -100, ry = -100;
    let raf = 0, visible = false, hovering = false, cursorLabel = '';

    const paint = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(paint);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx; ry = my;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        raf = requestAnimationFrame(paint);
      }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(${hovering ? 1.7 : 1})`;
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const interactive = target?.closest?.(HOVER_SELECTOR);
      hovering = Boolean(interactive);

      const cursorEl = target?.closest?.('[data-cursor]') as HTMLElement | null;
      const newLabel = cursorEl?.dataset?.cursor || '';

      if (newLabel !== cursorLabel) {
        cursorLabel = newLabel;
        if (cursorLabel) {
          label.textContent = cursorLabel;
          ring.classList.add('has-label');
        } else {
          label.textContent = '';
          ring.classList.remove('has-label');
        }
      }

      ring.classList.toggle('is-hovering', hovering);
      dot.classList.toggle('is-hovering', hovering);
    };

    const onLeaveDoc = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      cancelAnimationFrame(raf);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeaveDoc);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeaveDoc);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('custom-cursor-on');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="custom-cursor-label" />
      </div>
    </>
  );
};
