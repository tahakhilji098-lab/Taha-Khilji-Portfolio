import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SERVICES } from '../data/portfolioData';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { premiumEase } from '../motion/primitives';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

/* ─── Layout constants — Large desktop ≥1440px ─── */
const DESK_BASE_W = 144;
const DESK_BASE_H = 480;
const DESK_GAP = 18;
const DESK_MAX_W = 380;
const DESK_MAX_H = 530;
const DESK_INFLUENCE_R = 250;
const DESK_STAGE_H = 570;

/* ─── Desktop 1280–1439px ─── */
const MID_BASE_W = 118;
const MID_BASE_H = 425;
const MID_GAP = 15;
const MID_MAX_W = 325;
const MID_MAX_H = 472;
const MID_INFLUENCE_R = 215;
const MID_STAGE_H = 510;

/* ─── Tablet 768–1279px ─── */
const TAB_BASE_W = 92;
const TAB_BASE_H = 370;
const TAB_GAP = 11;
const TAB_MAX_W = 272;
const TAB_MAX_H = 420;
const TAB_INFLUENCE_R = 185;
const TAB_STAGE_H = 450;

/* ─── Mobile / touch ─── */
const MOB_BASE_W = 74;
const MOB_BASE_H = 330;
const MOB_GAP = 10;
const MOB_MAX_W = 292;
const MOB_MAX_H = 400;

const COUNT = 6;

/* ─── Spring config ─── */
const STIFFNESS = 0.13;
const DAMPING = 0.82;

interface CardDatum {
  currentW: number;
  targetW: number;
  currentH: number;
  targetH: number;
  currentLift: number;
  targetLift: number;
  restingCenterX: number;
}

export const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardData = useRef<CardDatum[]>([]);
  const rafRef = useRef(0);
  const pointerX = useRef(-9999);
  const pointerActive = useRef(false);
  const stageWidth = useRef(0);
  const isTouch = useRef(false);
  const [activeTouch, setActiveTouch] = useState<number | null>(null);
  const activeIndexRef = useRef<number | null>(null);

  const reduce = useReducedMotion();

  /* ─── Detect touch / coarse pointer ─── */
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    isTouch.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { isTouch.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ─── Layout parameters from stage width ─── */
  const getLayout = useCallback(() => {
    const w = stageWidth.current;
    if (w >= 1440) {
      return { baseW: DESK_BASE_W, baseH: DESK_BASE_H, gap: DESK_GAP, maxW: DESK_MAX_W, maxH: DESK_MAX_H, infR: DESK_INFLUENCE_R, stageH: DESK_STAGE_H };
    }
    if (w >= 1280) {
      return { baseW: MID_BASE_W, baseH: MID_BASE_H, gap: MID_GAP, maxW: MID_MAX_W, maxH: MID_MAX_H, infR: MID_INFLUENCE_R, stageH: MID_STAGE_H };
    }
    if (w >= 768) {
      return { baseW: TAB_BASE_W, baseH: TAB_BASE_H, gap: TAB_GAP, maxW: TAB_MAX_W, maxH: TAB_MAX_H, infR: TAB_INFLUENCE_R, stageH: TAB_STAGE_H };
    }
    return { baseW: MOB_BASE_W, baseH: MOB_BASE_H, gap: MOB_GAP, maxW: MOB_MAX_W, maxH: MOB_MAX_H, infR: 150, stageH: 400 };
  }, []);

  /* ─── Immutable resting centers ─── */
  const computeRestingCenters = useCallback(() => {
    const { baseW, baseH, gap } = getLayout();
    const totalW = COUNT * baseW + (COUNT - 1) * gap;
    const offsetX = (stageWidth.current - totalW) / 2;
    for (let i = 0; i < COUNT; i++) {
      if (!cardData.current[i]) {
        cardData.current[i] = {
          currentW: baseW, targetW: baseW,
          currentH: baseH, targetH: baseH,
          currentLift: 0, targetLift: 0,
          restingCenterX: 0,
        };
      }
      cardData.current[i].restingCenterX = offsetX + i * (baseW + gap) + baseW / 2;
      cardData.current[i].targetW = baseW;
      cardData.current[i].targetH = baseH;
      cardData.current[i].targetLift = 0;
    }
  }, [getLayout]);

  /* ─── Resize observer ─── */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      stageWidth.current = stage.clientWidth;
      computeRestingCenters();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [computeRestingCenters]);

  /* ─── Pointer move — update targets only ─── */
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isTouch.current || reduce) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    pointerX.current = e.clientX - rect.left;
    pointerActive.current = true;
  }, [reduce]);

  const handlePointerLeave = useCallback(() => {
    pointerActive.current = false;
    pointerX.current = -9999;
    activeIndexRef.current = null;
    const { baseW, baseH } = getLayout();
    for (let i = 0; i < COUNT; i++) {
      if (cardData.current[i]) {
        cardData.current[i].targetW = baseW;
        cardData.current[i].targetH = baseH;
        cardData.current[i].targetLift = 0;
      }
    }
  }, [getLayout]);

  /* ─── RAF animation loop ─── */
  useEffect(() => {
    if (reduce) return;

    const tick = () => {
      const { baseW, baseH, maxW, maxH, infR, gap } = getLayout();

      if (pointerActive.current) {
        const px = pointerX.current;

        /* Find nearest card (activeIndex) from immutable resting centers */
        let minDist = Infinity;
        let nearestIdx = -1;
        for (let i = 0; i < COUNT; i++) {
          const d = cardData.current[i];
          if (!d) continue;
          const dist = Math.abs(px - d.restingCenterX);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }

        /* If pointer is beyond influence radius, treat as leave */
        if (minDist > infR) {
          activeIndexRef.current = null;
          for (let i = 0; i < COUNT; i++) {
            const d = cardData.current[i];
            if (!d) continue;
            d.targetW = baseW;
            d.targetH = baseH;
            d.targetLift = 0;
          }
        } else {
          activeIndexRef.current = nearestIdx;

          /* Calculate raw targets using squared smoothstep */
          let rawExpansion = 0;
          for (let i = 0; i < COUNT; i++) {
            const d = cardData.current[i];
            if (!d) continue;
            const dist = Math.abs(px - d.restingCenterX);
            const linear = Math.max(0, 1 - dist / infR);
            const smooth = linear * linear * (3 - 2 * linear);
            const influence = smooth * smooth;
            d.targetW = baseW + (maxW - baseW) * influence;
            d.targetH = baseH + (maxH - baseH) * influence;
            d.targetLift = -6 * influence;
            rawExpansion += d.targetW - baseW;
          }

          /* Normalize expansion to fit container */
          const baseTotal = COUNT * baseW + (COUNT - 1) * gap;
          const available = Math.max(0, stageWidth.current - baseTotal);
          const scale = rawExpansion > 0 ? Math.min(1, available / rawExpansion) : 1;
          for (let i = 0; i < COUNT; i++) {
            const d = cardData.current[i];
            if (!d) continue;
            d.targetW = baseW + (d.targetW - baseW) * scale;
            d.targetH = baseH + (d.targetH - baseH) * scale;
            d.targetLift = d.targetLift * scale;
          }
        }
      }

      /* Interpolate and apply DOM styles */
      for (let i = 0; i < COUNT; i++) {
        const d = cardData.current[i];
        const el = pillRefs.current[i];
        if (!d || !el) continue;

        d.currentW += (d.targetW - d.currentW) * STIFFNESS;
        d.currentH += (d.targetH - d.currentH) * STIFFNESS;
        d.currentLift += (d.targetLift - d.currentLift) * STIFFNESS;

        if (Math.abs(d.targetW - d.currentW) < 0.3) d.currentW = d.targetW;
        if (Math.abs(d.targetH - d.currentH) < 0.3) d.currentH = d.targetH;
        if (Math.abs(d.targetLift - d.currentLift) < 0.1) d.currentLift = d.targetLift;

        const progress = Math.max(0, Math.min(1, (d.currentW - baseW) / Math.max(1, maxW - baseW)));
        const isActive = activeIndexRef.current === i;
        const z = Math.round(progress * 50);

        el.style.width = `${d.currentW}px`;
        el.style.height = `${d.currentH}px`;
        el.style.transform = `translateY(${d.currentLift}px)`;
        el.style.zIndex = String(z);

        /* Brightness: resting 0.79, active 1.02 */
        const brightness = 0.79 + (1.02 - 0.79) * progress;
        const sat = 0.90 + 0.10 * progress;
        el.style.filter = `brightness(${brightness}) saturate(${sat})`;

        /* Image scale: 1.055 at rest → 1.0 active */
        const img = el.querySelector('.pill-image img') as HTMLElement;
        if (img) {
          const imgScale = 1.055 - 0.055 * progress;
          img.style.transform = `scale(${imgScale})`;
        }

        /* Content — staggered reveal, exclusive to active card */
        const num = el.querySelector('.pill-number') as HTMLElement;
        const content = el.querySelector('.pill-content') as HTMLElement;
        const showContent = isActive && progress >= 0.58;
        const contentOpacity = showContent ? Math.min(1, (progress - 0.58) / 0.22) : 0;

        if (num) num.style.opacity = String(isActive ? Math.max(0, 1 - contentOpacity * 1.3) : 0.72);
        if (content) {
          content.style.opacity = String(contentOpacity);
          content.style.pointerEvents = contentOpacity > 0.4 ? 'auto' : 'none';

          /* Staggered children: label first, then title, then desc */
          const label = content.querySelector('.pill-label') as HTMLElement;
          const title = content.querySelector('.pill-title') as HTMLElement;
          const desc = content.querySelector('.pill-desc') as HTMLElement;
          const arrow = content.querySelector('.pill-arrow') as HTMLElement;

          if (label) {
            const labelOp = showContent ? Math.min(1, Math.max(0, (progress - 0.58) / 0.14)) : 0;
            label.style.opacity = String(labelOp);
            label.style.transform = `translateY(${(1 - labelOp) * 8}px)`;
          }
          if (title) {
            const titleDelay = 0.05;
            const titleOp = showContent ? Math.min(1, Math.max(0, (progress - 0.58 - titleDelay) / 0.16)) : 0;
            title.style.opacity = String(titleOp);
            title.style.transform = `translateY(${(1 - titleOp) * 10}px)`;
          }
          if (desc) {
            const descDelay = 0.09;
            const descOp = showContent ? Math.min(1, Math.max(0, (progress - 0.58 - descDelay) / 0.16)) : 0;
            desc.style.opacity = String(descOp);
            desc.style.transform = `translateY(${(1 - descOp) * 8}px)`;
          }
          if (arrow) {
            const arrowOp = showContent ? Math.min(1, Math.max(0, (progress - 0.58 - 0.07) / 0.14)) : 0;
            arrow.style.opacity = String(arrowOp);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduce, getLayout]);

  /* ─── Touch: tap to expand ─── */
  const handleTouchTap = useCallback((index: number) => {
    if (!isTouch.current) return;
    setActiveTouch((prev) => prev === index ? null : index);
  }, []);

  /* ─── Scroll to contact ─── */
  const scrollToContact = (serviceTitle: string) => {
    const el = document.querySelector('#contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const select = document.querySelector('select[name="serviceNeeded"]') as HTMLSelectElement;
      if (select) select.value = serviceTitle;
    }
  };

  const { stageH } = getLayout();

  return (
    <section
      id="services"
      ref={sectionRef}
      className="services-section"
    >
      <div className="services-container">
        {/* ─── Header ─── */}
        <header className="services-header">
          <motion.div
            className="services-heading-group"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.72, ease: premiumEase }}
          >
            <span className="services-label">WHAT I DO</span>
            <h2 className="services-heading">
              <span className="services-heading-sans">Design That Moves</span>
              <span className="services-heading-serif">Brands Forward<span className="blue-period">.</span></span>
            </h2>
          </motion.div>

          <motion.div
            className="services-introduction"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.72, ease: premiumEase, delay: 0.16 }}
          >
            <p>
              Clear strategy. Intentional design. I craft visuals and
              experiences that build recognition and drive results.
            </p>
          </motion.div>
        </header>

        {/* ─── Magnetic Pill Stage ─── */}
        <div
          ref={stageRef}
          className="magnetic-stage"
          style={{ height: isTouch.current ? undefined : stageH }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div className="magnetic-glow" aria-hidden="true" />

          <div className="magnetic-row">
            {SERVICES.map((service, i) => {
              const isActive = activeTouch === i;
              return (
                <button
                  key={service.id}
                  ref={(el) => { pillRefs.current[i] = el; }}
                  className={`magnetic-pill ${isActive ? 'is-active' : ''}`}
                  style={{
                    width: isTouch.current ? (isActive ? `min(78vw, ${MOB_MAX_W}px)` : MOB_BASE_W) : DESK_BASE_W,
                    height: isTouch.current ? (isActive ? MOB_MAX_H : MOB_BASE_H) : DESK_BASE_H,
                  }}
                  onClick={() => {
                    if (isTouch.current) {
                      handleTouchTap(i);
                    } else {
                      scrollToContact(service.title);
                    }
                  }}
                  onFocus={() => {
                    if (!isTouch.current) {
                      pointerActive.current = true;
                      const d = cardData.current[i];
                      if (d) pointerX.current = d.restingCenterX;
                    }
                  }}
                  onBlur={() => {
                    if (!isTouch.current) {
                      pointerActive.current = false;
                      pointerX.current = -9999;
                      activeIndexRef.current = null;
                      const { baseW: bw, baseH: bh } = getLayout();
                      for (let j = 0; j < COUNT; j++) {
                        if (cardData.current[j]) {
                          cardData.current[j].targetW = bw;
                          cardData.current[j].targetH = bh;
                          cardData.current[j].targetLift = 0;
                        }
                      }
                    }
                  }}
                  aria-label={`${service.number} — ${service.title}: ${service.description || service.shortDesc}`}
                  tabIndex={0}
                >
                  <div className="pill-image">
                    <img
                      src={service.image!}
                      alt={service.alt || service.title}
                      draggable="false"
                      decoding="async"
                      loading="lazy"
                      style={{ objectPosition: service.imagePosition || 'center center' }}
                    />
                    <div className="pill-shade" />
                    <div className="pill-gradient" />
                  </div>

                  <span className="pill-number">{service.number}</span>

                  <div className="pill-content">
                    <span className="pill-label">SERVICE {service.number}</span>
                    <h3 className="pill-title">{service.title}</h3>
                    <p className="pill-desc">{service.description || service.shortDesc}</p>
                    <ArrowUpRight className="pill-arrow" aria-hidden="true" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Helper label — below stage, independent */}
        {!reduce && (
          <motion.span
            className="magnetic-hint"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            MOVE ACROSS THE SERVICES
          </motion.span>
        )}

        {/* ─── Footer CTA ─── */}
        <footer className="services-footer">
          <motion.div
            className="services-footer-inner"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: 0.72, ease: premiumEase, delay: 0.3 }}
          >
            <span className="service-cta-label">NEED A CUSTOM DESIGN SOLUTION?</span>
            <a
              href={GMAIL_COMPOSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="service-cta-button group"
              aria-label="Start a project with Taha Khilji using Gmail"
            >
              <span className="relative">
                Start a Project
                <span className="absolute bottom-0 left-0 h-px w-0 bg-current transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
              </span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-[3px] group-hover:-translate-y-[3px] transition-transform duration-300" aria-hidden="true" />
            </a>
          </motion.div>
        </footer>
      </div>
    </section>
  );
};
