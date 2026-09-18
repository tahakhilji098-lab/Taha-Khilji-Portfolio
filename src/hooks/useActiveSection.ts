import { useEffect, useRef, useState } from 'react';

/*
  Active-section scroll spy.

  One IntersectionObserver watches every homepage section against a viewport
  band occupying the upper-middle reading area (40% → 60% of the viewport
  height). Overlap with that band is tracked in a stable Map; the section
  with the largest overlap wins. React state only updates when the winning
  section actually changes, so nothing is recomputed per scroll frame and
  no native scroll listener is involved.

  Works with Lenis (window-based smooth scrolling), after a page refresh
  (winner is resolved from layout synchronously on mount), and with direct
  hash navigation (the browser jumps and the observer re-evaluates).
*/

const DEFAULT_BAND_ROOT_MARGIN = '-40% 0px -40% 0px';
const OBSERVER_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1];

interface UseActiveSectionOptions {
  rootMargin?: string;
}

export function useActiveSection(
  sectionIds: readonly string[],
  options: UseActiveSectionOptions = {},
): string {
  const { rootMargin = DEFAULT_BAND_ROOT_MARGIN } = options;

  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] ?? '');
  const activeRef = useRef(activeSection);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const overlapAreas = new Map<string, number>();
    const fallback = activeRef.current;

    const pickWinner = (): string => {
      let winner = fallback;
      let bestArea = 0;
      overlapAreas.forEach((area, id) => {
        if (area > bestArea) {
          bestArea = area;
          winner = id;
        }
      });
      return winner;
    };

    const applyActive = (next: string) => {
      if (next === activeRef.current) return;
      activeRef.current = next;
      setActiveSection((previous) => (previous === next ? previous : next));
    };

    /* First paint after a mid-page refresh: resolve the winner directly from
       layout instead of waiting for the observer's asynchronous initial pass. */
    const viewportHeight = window.innerHeight;
    const bandTop = viewportHeight * 0.4;
    const bandBottom = viewportHeight * 0.6;
    let bestSection: string | undefined;
    let bestOverlap = 0;
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const overlap = Math.max(
        0,
        Math.min(rect.bottom, bandBottom) - Math.max(rect.top, bandTop),
      );
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestSection = section.id;
      }
    }
    if (bestSection) applyActive(bestSection);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            overlapAreas.set(
              entry.target.id,
              entry.intersectionRect.width * entry.intersectionRect.height,
            );
          } else {
            overlapAreas.delete(entry.target.id);
          }
        }
        applyActive(pickWinner());
      },
      { rootMargin, threshold: OBSERVER_THRESHOLDS },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      overlapAreas.clear();
    };
  }, [sectionIds, rootMargin]);

  return activeSection;
}