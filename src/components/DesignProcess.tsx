import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useTransform } from 'motion/react';
import { useSectionProgress, premiumEase } from '../motion/primitives';

type ActiveIndex = number | null;

const processSteps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Goals, audience and challenges become clear direction.',
  },
  {
    number: '02',
    title: 'Strategize',
    description: 'Strategy, structure and a focused creative framework.',
  },
  {
    number: '03',
    title: 'Design',
    description: 'Refined visual systems, crafted with intention and precision.',
  },
  {
    number: '04',
    title: 'Deliver',
    description: 'Polished production-ready assets built to create impact.',
  },
] as const;

/* ─── Custom line-art icons (120 × 120 viewBox, 1.5px stroke) ─── */

const DiscoverIcon: React.FC = () => (
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle className="art-compass-ring" cx="60" cy="58" r="41" />
    <path d="M60 24 L60 29 M60 87 L60 92 M26 58 L31 58 M89 58 L94 58" />
    <g className="art-needle">
      <path d="M60 58 L88 30" />
      <path d="M60 58 L32 86" />
    </g>
    <circle className="art-compass-center" cx="60" cy="58" r="3" />
  </svg>
);

const StrategizeIcon: React.FC = () => (
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <g className="art-connectors">
      <path d="M60 58 L26 24" />
      <path d="M60 58 L94 24" />
      <path d="M60 58 L26 92" />
      <path d="M60 58 L94 92" />
    </g>
    <g className="art-satellites">
      <circle cx="26" cy="24" r="6" />
      <circle cx="94" cy="24" r="6" />
      <circle cx="26" cy="92" r="6" />
      <circle cx="94" cy="92" r="6" />
    </g>
    <circle className="art-center-node" cx="60" cy="58" r="11" />
    <circle className="art-center-dot" cx="60" cy="58" r="3.5" />
  </svg>
);

const DesignIcon: React.FC = () => (
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <g className="art-frame-rear">
      <rect x="18" y="22" width="56" height="60" rx="6" />
      <line x1="18" y1="40" x2="74" y2="40" />
      <line x1="28" y1="54" x2="64" y2="54" />
      <circle cx="26" cy="31" r="2.2" />
      <circle cx="35" cy="31" r="2.2" />
    </g>
    <g className="art-frame-front">
      <rect x="46" y="16" width="56" height="60" rx="6" />
      <circle cx="54" cy="25" r="2.2" />
      <circle cx="63" cy="25" r="2.2" />
    </g>
    <g className="art-frame-lines">
      <line x1="46" y1="34" x2="102" y2="34" />
      <line x1="56" y1="48" x2="96" y2="48" />
    </g>
  </svg>
);

const DeliverIcon: React.FC = () => (
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <g className="art-check">
      <circle cx="92" cy="28" r="18" />
      <path d="M84 28 L91 35 L101 21" />
    </g>
    <path className="art-trail" d="M50 53 C 45 66 45 78 50 90" />
    <g className="art-rocket">
      <path d="M55 18 L63 26 L63 43 L55 50 L47 43 L47 26 Z" />
      <path d="M47 34 L39 46 L47 42 Z" />
      <path d="M63 34 L71 46 L63 42 Z" />
      <circle cx="55" cy="33" r="4" />
      <path d="M51 51 L50 57 M59 51 L60 57" />
    </g>
  </svg>
);

const ICONS: React.FC[] = [DiscoverIcon, StrategizeIcon, DesignIcon, DeliverIcon];

/* ─── Exit/enter presence for the faded number and rail label ─── */

function useSwapPresence(value: string, exitMs: number) {
  const [current, setCurrent] = useState(value);
  const [exiting, setExiting] = useState<string | null>(null);
  const [hasSwapped, setHasSwapped] = useState(false);
  const timer = useRef<number | null>(null);
  const currentRef = useRef(value);

  useEffect(() => {
    if (value === currentRef.current) return;
    setExiting(currentRef.current);
    setHasSwapped(true);
    currentRef.current = value;
    setCurrent(value);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setExiting(null);
    }, exitMs);
  }, [value, exitMs]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return { current, exiting, hasSwapped };
}

/* ─── Component ─── */

export const DesignProcess: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<ActiveIndex>(null);
  const [revealed, setRevealed] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const groupRef = useRef<HTMLOListElement>(null);
  const prevNodeRef = useRef<number | null>(null);
  const leaveTimer = useRef<number | null>(null);

  /* Scroll parallax on the faded stage number — decorative layer only */
  const reduce = useReducedMotion();
  const progress = useSectionProgress(sectionRef);
  const stageDistance = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches ? -12 : -18;
  const stageY = useTransform(progress, [0, 1], [0, stageDistance]);

  const displayedNumber =
    activeIndex !== null ? processSteps[activeIndex].number : '04';
  const labelText =
    activeIndex !== null
      ? `${processSteps[activeIndex].number} / 04 — ${processSteps[activeIndex].title}`
      : '04 FOCUSED STAGES';

  const { current: numberValue, exiting: exitingNumber, hasSwapped: numberSwapped } =
    useSwapPresence(displayedNumber, 220);
  const { current: labelValue, exiting: exitingLabel, hasSwapped: labelSwapped } =
    useSwapPresence(labelText, 200);

  const isFinePointer = () =>
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? true;
  const isCoarsePointer = () =>
    window.matchMedia?.('(hover: none), (pointer: coarse)').matches ?? false;

  /* Entrance: reveal once when ~22% of the section is in view */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.22) {
            observer.disconnect();
            setRevealed(true);
            return;
          }
        }
      },
      { threshold: 0.22 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Track the previous active node so the rail light knows where to travel from */
  useEffect(() => {
    if (activeIndex !== null) prevNodeRef.current = activeIndex;
  }, [activeIndex]);

  /* Cleanup the delayed pointer-leave timer */
  useEffect(
    () => () => {
      if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  const cancelReset = () => {
    if (leaveTimer.current !== null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  const scheduleReset = () => {
    cancelReset();
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null;
      setActiveIndex(null);
    }, 80);
  };

  const handleGroupPointerLeave = (event: React.PointerEvent<HTMLOListElement>) => {
    if (isCoarsePointer()) return;
    const next = event.relatedTarget as Node | null;
    if (next && groupRef.current?.contains(next)) return;
    scheduleReset();
  };

  const handleGroupBlur = (event: React.FocusEvent<HTMLOListElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && groupRef.current?.contains(next)) return;
    cancelReset();
    setActiveIndex(null);
  };

  const handleCardPointerEnter = (index: number) => () => {
    if (!isFinePointer()) return;
    cancelReset();
    setActiveIndex(index);
  };

  const handleCardFocus = (index: number) => () => {
    cancelReset();
    setActiveIndex(index);
  };

  const handleCardClick = (index: number) => () => {
    if (isCoarsePointer()) {
      setActiveIndex((prev) => (prev === index ? null : index));
    }
  };

  /* Rail light positions: center of column `index` across the card grid */
  const cols = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 1279px)').matches ? 2 : 4;
  const nodeCenter = (index: number) => {
    const basePct = ((2 * index + 1) / (2 * cols)) * 100;
    const gapCoef = index - ((cols - 1) * (2 * index + 1)) / (2 * cols);
    return `calc(${basePct.toFixed(3)}% + ${gapCoef.toFixed(3)} * var(--process-gap))`;
  };

  const lightFrom = nodeCenter(prevNodeRef.current ?? 0);
  const lightTo = activeIndex !== null ? nodeCenter(activeIndex) : nodeCenter(0);

  return (
    <section
      id="process"
      ref={sectionRef}
      className={`process-section${revealed ? ' is-revealed' : ''}`}
    >
      <div className="process-container">
        <header className="process-header">
          <div className="process-header-left">
            <span className="process-eyebrow">
              HOW I WORK
              <span className="process-eyebrow-rule" aria-hidden="true" />
            </span>
            <h2 className="process-heading">
              <span className="process-heading-line">
                <span className="process-heading-text">A Clear Process.</span>
              </span>
              <span className="process-heading-line">
                <span className="process-heading-text process-heading-accent">
                  Exceptional Results.
                </span>
              </span>
            </h2>
            <p className="process-introduction">
              A thoughtful, collaborative approach that turns
              clarity into compelling visual outcomes.
            </p>
          </div>

          <aside className="process-header-note" aria-label="Process summary">
            <p>
              Four focused stages.
              <br />
              One clear path from
              <br />
              insight to impact.
            </p>
          </aside>

          <div className="process-stage-display" aria-hidden="true">
            <motion.div style={reduce ? undefined : { y: stageY }}>
            <span className="process-stage-display-number">
              <span className="process-stage-number-stack">
                {exitingNumber !== null && (
                  <span
                    key={`exit-${exitingNumber}`}
                    className="process-stage-number-layer is-exiting"
                  >
                    {exitingNumber}
                  </span>
                )}
                <span
                  key={`enter-${numberValue}`}
                  className={`process-stage-number-layer${numberSwapped ? ' is-entering' : ''}`}
                >
                  {numberValue}
                </span>
              </span>
            </span>
            </motion.div>
          </div>
        </header>

        {/* ─── Console: rail label + rail + cards ─── */}
        <div className="process-console">
          <div className="process-rail-head">
            <span className="process-rail-label" aria-live="polite">
              <span className="process-label-stack">
                {exitingLabel !== null && (
                  <span
                    key={`label-exit-${exitingLabel}`}
                    className="process-label-layer is-exiting"
                    aria-hidden="true"
                  >
                    {exitingLabel}
                  </span>
                )}
                <span
                  key={`label-enter-${labelValue}`}
                  className={`process-label-layer${labelSwapped ? ' is-entering' : ''}`}
                >
                  {labelValue}
                </span>
              </span>
            </span>
          </div>

          <div className="process-rail" aria-hidden="true">
            <span className="process-rail-line" />
            {activeIndex !== null && (
              <span
                key={`rail-light-${activeIndex}`}
                className="process-rail-light"
                style={
                  {
                    '--light-from': lightFrom,
                    '--light-to': lightTo,
                  } as React.CSSProperties
                }
              />
            )}
            {processSteps.map((step, index) => (
              <span
                key={step.number}
                className="process-rail-node"
                data-rail-index={index}
                data-active={activeIndex === index ? 'true' : undefined}
              >
                <span className="process-rail-node-ring" />
                <span className="process-rail-node-dot" />
              </span>
            ))}
          </div>

          <ol
            ref={groupRef}
            className="process-cards"
            onPointerLeave={handleGroupPointerLeave}
            onBlur={handleGroupBlur}
          >
            {processSteps.map((step, index) => (
              <li key={step.number} className="process-card-item">
                <button
                  type="button"
                  className="process-card"
                  data-active={activeIndex === index ? 'true' : undefined}
                  aria-pressed={activeIndex === index}
                  onPointerEnter={handleCardPointerEnter(index)}
                  onFocus={handleCardFocus(index)}
                  onClick={handleCardClick(index)}
                >
                  <span className="process-card-number">{step.number}</span>
                  <h3 className="process-card-title">{step.title}</h3>
                  <p className="process-card-description">{step.description}</p>
                  <span className="process-card-icon" aria-hidden="true">
                    {(() => {
                      const Icon = ICONS[index];
                      return Icon ? <Icon /> : null;
                    })()}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
