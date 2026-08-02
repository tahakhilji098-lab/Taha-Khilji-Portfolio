import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SERVICES } from '../data/portfolioData';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useSectionProgress, StaggerGroup, revealFromLeft, revealFromRight, premiumEase } from '../motion/primitives';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

const DEFAULT_INDEX = 0;

export const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const preloadedRef = useRef(false);
  const rafRef = useRef(0);
  const parallaxTarget = useRef({ x: 0, y: 0 });

  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  /* Scroll-linked edge line: draws down the left edge as the section passes */
  const reduce = useReducedMotion();
  const progress = useSectionProgress(sectionRef);
  const edgeScale = useSpring(progress, { stiffness: 90, damping: 28, restDelta: 0.001 });

  /* ─── Hover-capable detection ─── */
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ─── Mobile width detection ─── */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);


  /* ─── Preload remaining images via Promise.allSettled ─── */
  useEffect(() => {
    if (preloadedRef.current) return;
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadedRef.current = true;
          obs.disconnect();
          const promises = SERVICES
            .filter((s) => s.image)
            .map((s) => {
              const img = new Image();
              img.src = s.image!;
              if (img.decode) {
                return img.decode().then(() => img).catch(() => img);
              }
              return new Promise<HTMLImageElement>((resolve) => {
                img.onload = () => resolve(img);
                img.onerror = () => resolve(img);
              });
            });
          Promise.allSettled(promises).catch(() => {});
        }
      },
      { rootMargin: '500px 0px 0px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ─── Micro parallax (ref-based, no React state) ─── */
  useEffect(() => {
    if (!isDesktop) return;
    const layers = layersRef.current;
    if (!layers) return;

    const damp = { x: 0, y: 0 };

    const loop = () => {
      damp.x += (parallaxTarget.current.x - damp.x) * 0.12;
      damp.y += (parallaxTarget.current.y - damp.y) * 0.12;
      layers.style.setProperty('--service-parallax-x', `${damp.x}px`);
      layers.style.setProperty('--service-parallax-y', `${damp.y}px`);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      const rect = layers.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      parallaxTarget.current = {
        x: Math.max(-5, Math.min(5, ((e.clientX - cx) / (rect.width / 2)) * 5)),
        y: Math.max(-3, Math.min(3, ((e.clientY - cy) / (rect.height / 2)) * 3)),
      };
    };

    const onLeave = () => { parallaxTarget.current = { x: 0, y: 0 }; };

    layers.addEventListener('pointermove', onMove);
    layers.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      layers.removeEventListener('pointermove', onMove);
      layers.removeEventListener('pointerleave', onLeave);
    };
  }, [isDesktop]);

  /* ─── Cleanup return timer on unmount ─── */
  useEffect(() => {
    return () => {
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    };
  }, []);

  /* ─── Pointer handler with return delay ─── */
  const handlePointerEnter = useCallback((index: number) => {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    setActiveIndex(index);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    if (!isDesktop) return;
    returnTimerRef.current = setTimeout(() => {
      setActiveIndex(DEFAULT_INDEX);
    }, 80);
  }, [isDesktop]);

  const scrollToContact = (serviceTitle: string) => {
    const el = document.querySelector('#contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const select = document.querySelector(
        'select[name="serviceNeeded"]'
      ) as HTMLSelectElement;
      if (select) select.value = serviceTitle;
    }
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="services-section"
    >
      <div className="services-container">
        {/* ─── Header — split reveal ─── */}
        <header className="services-header">
          <motion.div
            className="services-heading-group"
            variants={reduce ? undefined : revealFromLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.08, margin: '0px 0px 12% 0px' }}
          >
            <span className="services-label">WHAT I DO</span>
            <h2 className="services-heading">
              <span>Design That Moves</span>
              <span>Brands Forward<span className="blue-period">.</span></span>
            </h2>
          </motion.div>

          <motion.div
            className="services-introduction"
            variants={reduce ? undefined : revealFromRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.08, margin: '0px 0px 12% 0px' }}
          >
            <p>
              Clear strategy. Intentional design. I craft visuals and
              experiences that build recognition and drive results.
            </p>
          </motion.div>
        </header>

        {/* ─── Composition: Background Stage + List ─── */}
        <div className="services-composition">
          <motion.span
            className="services-edge-line"
            aria-hidden="true"
            style={reduce ? undefined : { scaleY: edgeScale }}
          />
          {/* Atmospheric background — layered images with crossfade */}
          <motion.div
            className="services-background-stage"
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, scale: 0.985 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 1.2, ease: premiumEase }}
            style={{ y: reduce ? undefined : useTransform(progress, [0, 1], [0, 16]) }}
          >
            <div ref={layersRef} className="services-visual-layers">
              {SERVICES.map((service, index) => (
                <div
                  key={service.id}
                  className={`service-visual-layer ${activeIndex === index ? 'is-active' : ''}`}
                >
                  <div className="service-visual-settle">
                    <div className="service-visual-parallax">
                      <img
                        src={service.image!}
                        alt=""
                        draggable="false"
                        decoding="async"
                        style={{ objectPosition: service.imagePosition || 'center center' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="services-visual-overlay" />
          </motion.div>

          {/* Service list — sequential reveal top to bottom */}
          <StaggerGroup
            as="ul"
            ref={listRef}
            className="services-list"
            onPointerLeave={handlePointerLeave}
            stagger={0.065}
          >
            {SERVICES.map((service, idx) => {
              const isActive = activeIndex === idx;
              return (
                <motion.li
                  key={service.id}
                  className="services-list-item"
                  variants={reduce ? undefined : {
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: premiumEase } }
                  }}
                >
                  <button
                    type="button"
                    className="service-capsule"
                    data-active={isActive ? 'true' : undefined}
                    data-visible="true"
                    onPointerEnter={() => handlePointerEnter(idx)}
                    onFocus={() => handlePointerEnter(idx)}
                    onClick={() => scrollToContact(service.title)}
                  >
                    <span className="capsule-active-surface" aria-hidden="true" />
                    <span className="capsule-light-sweep" aria-hidden="true" />
                    <span className="service-number">{service.number}</span>
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">
                      {service.description || service.shortDesc}
                    </p>
                    <ArrowUpRight className="service-arrow" />
                  </button>
                  {isMobile && isActive && (
                    <div className="mobile-service-visual" aria-hidden="true">
                      <img src={service.image!} alt="" draggable="false" />
                      <span className="mobile-service-visual-overlay" />
                    </div>
                  )}
                </motion.li>
              );
            })}
            </StaggerGroup>
        </div>

        {/* ─── Footer CTA ─── */}
        <footer className="services-footer">
          <motion.div
            className="services-footer-inner"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08, margin: '0px 0px 12% 0px' }}
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
