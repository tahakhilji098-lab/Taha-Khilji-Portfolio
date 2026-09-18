import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { MagneticSilkWave } from './LivingWave';
import { STAGE_ANCHORS } from './processAnchors';

const finePointer = () =>
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;

const stages = [
  { id: 'discover', number: '01', title: 'DISCOVER', description: 'Goals, audience and challenges become clear direction.' },
  { id: 'strategize', number: '02', title: 'STRATEGIZE', description: 'Strategy, structure and a focused creative framework.' },
  { id: 'design', number: '03', title: 'DESIGN', description: 'Refined visual systems, crafted with intention and precision.' },
  { id: 'deliver', number: '04', title: 'DELIVER', description: 'Polished production-ready assets built to create impact.' },
] as const;

const PHASE_LABELS = ['PHASE 01 / 04', 'PHASE 02 / 04', 'PHASE 03 / 04', 'PHASE 04 / 04'];

export const DesignProcess: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const activeIndex = previewIndex ?? selectedIndex;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tiltRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stageLayerRef = useRef<HTMLDivElement>(null);
  const theatreRef = useRef<HTMLDivElement>(null);
  const focusXRef = useRef(STAGE_ANCHORS[0]);
  const velocityRef = useRef(0);
  const [renderFocusX, setRenderFocusX] = useState<number>(STAGE_ANCHORS[0]);
  const [renderVelocity, setRenderVelocity] = useState(0);

  const reduce = useReducedMotion();

  // Entrance observer
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reduce) { setRevealed(true); return; }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.06) {
            observer.disconnect();
            setTimeout(() => setRevealed(true), 40);
            return;
          }
        }
      },
      { threshold: 0.06 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [reduce]);

  // Drive focusX spring
  useEffect(() => {
    const target = STAGE_ANCHORS[activeIndex];
    let raf = 0;
    const tick = () => {
      const current = focusXRef.current;
      const dx = target - current;
      const force = 90 * dx - 19 * velocityRef.current;
      velocityRef.current += (force / 0.85) * 0.016;
      focusXRef.current += velocityRef.current * 0.016;
      if (Math.abs(dx) > 0.0002 || Math.abs(velocityRef.current) > 0.01) {
        setRenderFocusX(focusXRef.current);
        setRenderVelocity(velocityRef.current);
        raf = requestAnimationFrame(tick);
      } else {
        focusXRef.current = target;
        velocityRef.current = 0;
        setRenderFocusX(target);
        setRenderVelocity(0);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeIndex]);

  const handleStageEnter = useCallback((index: number) => {
    if (!finePointer()) return;
    setPreviewIndex(index);
  }, []);

  const handleTheatreLeave = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  const handleStageClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setPreviewIndex(null);
  }, []);

  const handleStageTiltMove = useCallback((e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    if (reduce || !finePointer()) return;
    const stack = tiltRefs.current[i];
    if (!stack) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    stack.style.transition = 'transform 120ms ease-out';
    stack.style.transform =
      `perspective(720px) rotateY(${(nx * 7).toFixed(2)}deg) rotateX(${(-ny * 7).toFixed(2)}deg)`;
  }, [reduce]);

  const handleStageTiltReset = useCallback((i: number) => {
    const stack = tiltRefs.current[i];
    if (!stack) return;
    stack.style.transition = 'transform 340ms cubic-bezier(0.22, 1, 0.36, 1)';
    stack.style.transform = 'perspective(720px) rotateY(0deg) rotateX(0deg)';
    window.setTimeout(() => {
      const el = tiltRefs.current[i];
      if (el) el.style.transition = '';
    }, 360);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let next = selectedIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = Math.min(selectedIndex + 1, 3);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      next = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      next = 3;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedIndex(activeIndex);
      setPreviewIndex(null);
      return;
    } else {
      return;
    }
    setSelectedIndex(next);
    setPreviewIndex(null);
    stageRefs.current[next]?.focus();
  }, [selectedIndex, activeIndex]);

  const descEase = reduce ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] };

  return (
    <section
      id="process"
      ref={sectionRef}
      className={`msj-section${revealed ? ' is-revealed' : ''}`}
    >
      {/* Header */}
      <div className="msj-header-wrap">
        <div className="msj-container">
          <header className="msj-header">
            <div className="msj-header-left">
              <span className="msj-eyebrow">
                <span className="msj-eyebrow-text">HOW I WORK</span>
                <span className="msj-eyebrow-rule" aria-hidden="true" />
              </span>
              <h2 className="msj-heading">
                <span className="msj-heading-line">
                  <span className="msj-heading-serif">A Clear Process.</span>
                </span>
                <span className="msj-heading-line">
                  <span className="msj-heading-sans">
                    Exceptional Results.
                    <span className="msj-heading-period" aria-hidden="true">.</span>
                  </span>
                </span>
              </h2>
              <p className="msj-intro">
                A thoughtful, collaborative approach that turns
                clarity into compelling visual outcomes.
              </p>
            </div>
            <div className="msj-header-right">
              <span className="msj-meta-rule" aria-hidden="true" />
              <div className="msj-meta-text">
                <span className="msj-meta-label">FOUR FOCUSED STAGES</span>
                <p className="msj-meta-desc">One clear path from insight to impact.</p>
                <div className="msj-phase-meter" aria-hidden="true">
                  {stages.map((s, i) => (
                    <div key={s.id} className={`msj-phase-seg${i <= activeIndex ? ' is-filled' : ''}${i === activeIndex ? ' is-active' : ''}`}>
                      <div className="msj-phase-fill" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Theatre */}
      <div className="msj-theatre" ref={theatreRef} onPointerLeave={handleTheatreLeave}>
        <div className="msj-ambient" aria-hidden="true">
          <div className="msj-ambient-glow msj-ambient-glow--left" />
          <div className="msj-ambient-glow msj-ambient-glow--right" />
          {[
            { left: '12%', drift: '26px', duration: '9s', delay: '0s', size: 3 },
            { left: '28%', drift: '-18px', duration: '11s', delay: '1.4s', size: 2 },
            { left: '44%', drift: '20px', duration: '8s', delay: '3.2s', size: 3 },
            { left: '61%', drift: '-24px', duration: '12s', delay: '2.1s', size: 2 },
            { left: '78%', drift: '16px', duration: '10s', delay: '0.7s', size: 3 },
            { left: '91%', drift: '-14px', duration: '13s', delay: '4.5s', size: 2 },
          ].map((m, i) => (
            <span
              key={i}
              className="msj-ambient-mote"
              style={{
                left: m.left,
                width: `${m.size}px`,
                height: `${m.size}px`,
                '--mote-drift': m.drift,
                '--mote-duration': m.duration,
                '--mote-delay': m.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <MagneticSilkWave
          focusX={renderFocusX}
          velocity={renderVelocity}
          breathe={!reduce && revealed}
          reveal={revealed}
          frameEl={stageLayerRef}
          className="msj-wave"
        />

        <div
          className="msj-stage-layer"
          ref={stageLayerRef}
          role="tablist"
          aria-label="Process stages"
          onKeyDown={handleKeyDown}
        >
          {stages.map((s, i) => {
            const isActive = activeIndex === i;
            return (
              <button
                key={s.id}
                ref={(el) => { stageRefs.current[i] = el; }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`msj-panel-${i}`}
                id={`msj-tab-${i}`}
                tabIndex={isActive ? 0 : -1}
                className={`msj-stage-anchor${isActive ? ' is-active' : ''}`}
                onPointerEnter={() => handleStageEnter(i)}
                onPointerMove={(e) => handleStageTiltMove(e, i)}
                onPointerLeave={() => handleStageTiltReset(i)}
                onClick={() => handleStageClick(i)}
                onFocus={() => { setPreviewIndex(i); }}
                onBlur={() => { if (previewIndex === i) setPreviewIndex(null); }}
              >
                <div className="msj-stage-stack" ref={(el) => { tiltRefs.current[i] = el; }}>
                  <div className="msj-stage-num">{s.number}</div>
                  <div className="msj-stage-title">{s.title}</div>
                  <div className="msj-stage-rule" aria-hidden="true" />
                  <div className="msj-stage-detail-slot">
                    <AnimatePresence mode="wait" initial={false}>
                      {isActive && (
                        <motion.div
                          key={`detail-${s.id}`}
                          className="msj-stage-details"
                          role="tabpanel"
                          id={`msj-panel-${i}`}
                          aria-labelledby={`msj-tab-${i}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={descEase}
                        >
                          <div className="msj-stage-phase">{PHASE_LABELS[i]}</div>
                          <p className="msj-stage-desc">{s.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </button>
            );
          })}
        </div>


      </div>
    </section>
  );
};
