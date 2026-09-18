import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useReducedMotion } from 'motion/react';
import { TESTIMONIALS } from '../data/portfolioData';
import {
  ChevronLeft,
  ChevronRight,
  Feather,
  Sparkles,
  Hexagon,
  Layers,
  Shield,
  Palette,
  Package,
  BookOpen,
  Monitor,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';

const SERVICE_ICONS: Record<string, LucideIcon> = {
  'Brand Identity': Palette,
  'Packaging Design': Package,
  'Editorial Layout': BookOpen,
  'Website UI Design': Monitor,
  'Advertising & Campaign': Megaphone,
};

const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const clientLogos = [
  { name: 'LUMEN', icon: Feather, tracking: '0.3em' },
  { name: 'AURORA', icon: Sparkles, tracking: '0.36em' },
  { name: 'VELORA', icon: Hexagon, tracking: '0.28em' },
  { name: 'NEXORA', icon: Layers, tracking: '0.32em' },
  { name: 'SANCTUA', icon: Shield, tracking: '0.2em' },
];

/* Distance → appearance. nd = distance in card steps (unclamped). */
const appearanceFor = (nd: number) => {
  if (nd <= 1) {
    return {
      scale: 1 - 0.1 * nd,
      opacity: 1 - 0.5 * nd,
      y: 6 * nd,
      border: 0.42 - 0.24 * nd,
    };
  }
  const t = Math.min(nd - 1, 1);
  return {
    scale: 0.9 - 0.02 * t,
    opacity: 0.5 - 0.2 * t,
    y: 6 + 4 * t,
    border: 0.18 - 0.08 * t,
  };
};

const DRAG_TAP_TOLERANCE = 6;

export const Testimonials: React.FC = () => {
  const total = TESTIMONIALS.length;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapPoints, setSnapPoints] = useState<number[]>([]);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const entranceTimerRef = useRef<number | null>(null);
  const entranceStateRef = useRef<'idle' | 'entering' | 'done'>('idle');

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pointerDownXRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'x',
    align: 'center',
    loop: true,
    containScroll: false,
    dragFree: false,
    slidesToScroll: 1,
    duration: prefersReducedMotion ? 0 : 28,
  });

  /* Distance-derived card appearance, updated per frame from Embla's scroll
     position. Visuals live on the inner card — never on the Embla slide. */
  const updateAppearance = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp || !track) return;
    const first = track.firstElementChild as HTMLElement | null;
    if (!first) return;
    const slideW = first.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = slideW + gap;
    if (!step) return;
    const vpRect = vp.getBoundingClientRect();
    const vpCenter = vpRect.left + vpRect.width / 2;
    for (let i = 0; i < track.children.length; i++) {
      const slide = track.children[i] as HTMLElement | null;
      const card = slide ? (slide.firstElementChild as HTMLElement | null) : null;
      if (!slide || !card) continue;
      const rect = slide.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const nd = Math.abs(center - vpCenter) / step;
      const a = appearanceFor(nd);
      card.style.setProperty('--d-scale', a.scale.toFixed(4));
      card.style.setProperty('--d-opacity', a.opacity.toFixed(4));
      card.style.setProperty('--d-y', `${a.y.toFixed(2)}px`);
      card.style.setProperty('--card-border-a', a.border.toFixed(4));
    }
  }, []);

  const updateSelectedIndex = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const updateSnaps = useCallback(() => {
    if (!emblaApi) return;
    setSnapPoints(emblaApi.scrollSnapList());
  }, [emblaApi]);

  /* The first slide's rest state lives on Embla's wrapped loop branch so the
     previous card stays partially visible on the left, matching the approved
     layout. The two jumps are synchronous and covered by the ready gate. */
  const useWrappedStartBranch = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== 0) return;
    emblaApi.scrollTo(total - 1, true);
    emblaApi.scrollTo(0, true);
  }, [emblaApi, total]);

  /* Init before first paint: Embla measures and centers synchronously. */
  useLayoutEffect(() => {
    if (!emblaApi) return;
    useWrappedStartBranch();
    updateSelectedIndex();
    updateSnaps();
    updateAppearance();
    setReady(true);
  }, [emblaApi, useWrappedStartBranch, updateSelectedIndex, updateSnaps, updateAppearance]);

  const handleSettle = useCallback(() => {
    trackRef.current?.removeAttribute('data-dragging');
    updateAppearance();
  }, [updateAppearance]);

  useEffect(() => {
    if (!emblaApi) return;
    const onReInit = () => {
      useWrappedStartBranch();
      updateSnaps();
      updateSelectedIndex();
      updateAppearance();
    };
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', onReInit);
    emblaApi.on('scroll', updateAppearance);
    emblaApi.on('settle', handleSettle);
    emblaApi.on('init', updateAppearance);
    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', onReInit);
      emblaApi.off('scroll', updateAppearance);
      emblaApi.off('settle', handleSettle);
      emblaApi.off('init', updateAppearance);
    };
  }, [emblaApi, updateSelectedIndex, updateSnaps, updateAppearance, handleSettle, useWrappedStartBranch]);

  /* Mobile: side cards stay hidden at rest and become visible while the
     track is moving. */
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownXRef.current = e.clientX;
    trackRef.current?.setAttribute('data-dragging', 'true');
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (Math.abs(e.clientX - pointerDownXRef.current) < DRAG_TAP_TOLERANCE) {
      trackRef.current?.removeAttribute('data-dragging');
    }
  }, []);

  const handlePointerCancel = useCallback(() => {
    trackRef.current?.removeAttribute('data-dragging');
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  /* ── Autoplay: advance every 5s, pause on hover ── */
  const isHoveringRef = useRef(false);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    clearAutoplay();
    if (isHoveringRef.current || prefersReducedMotion) return;
    autoplayTimerRef.current = setTimeout(() => {
      emblaApi?.scrollNext();
    }, 5000);
  }, [emblaApi, clearAutoplay, prefersReducedMotion]);

  /* Restart autoplay progress bars on slide change */
  const restartProgressBars = useCallback(() => {
    const indicators = document.querySelectorAll('.testimonials-indicator');
    indicators.forEach((el) => {
      const indicator = el as HTMLElement;
      indicator.classList.remove('is-active');
      // Force reflow to restart CSS animation
      void indicator.offsetWidth;
      if (indicator === document.querySelector('.testimonials-indicator.is-active')) {
        indicator.classList.add('is-active');
      }
    });
  }, []);

  /* Sync autoplay with Embla events */
  useEffect(() => {
    if (!emblaApi) return;
    const onSettle = () => {
      startAutoplay();
      // Restart progress bars after a micro-delay so the class toggle works
      requestAnimationFrame(() => {
        const indicators = document.querySelectorAll('.testimonials-indicator');
        indicators.forEach((el) => {
          el.classList.remove('is-active');
        });
        requestAnimationFrame(() => {
          const active = emblaApi.selectedScrollSnap();
          indicators[active]?.classList.add('is-active');
        });
      });
    };
    emblaApi.on('settle', onSettle);
    return () => { emblaApi.off('settle', onSettle); };
  }, [emblaApi, startAutoplay]);

  const handleCarouselHover = useCallback((entering: boolean) => {
    isHoveringRef.current = entering;
    if (entering) {
      clearAutoplay();
    } else {
      startAutoplay();
    }
  }, [clearAutoplay, startAutoplay]);

  /* Start autoplay on init */
  useEffect(() => {
    if (ready) startAutoplay();
    return clearAutoplay;
  }, [ready, startAutoplay, clearAutoplay]);

  /* Entrance sequence (runs once via IntersectionObserver) */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const startTimer = () => {
      if (entranceTimerRef.current) window.clearTimeout(entranceTimerRef.current);
      entranceTimerRef.current = window.setTimeout(() => {
        entranceStateRef.current = 'done';
        setEntranceDone(true);
      }, 1400);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      entranceStateRef.current = 'done';
      setEntered(true);
      setEntranceDone(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          entranceStateRef.current = 'entering';
          setEntered(true);
          io.disconnect();
          startTimer();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    const onVisibility = () => {
      if (document.hidden) {
        if (entranceTimerRef.current) window.clearTimeout(entranceTimerRef.current);
        entranceTimerRef.current = null;
      } else if (entranceStateRef.current === 'entering') {
        startTimer();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (entranceTimerRef.current) window.clearTimeout(entranceTimerRef.current);
    };
  }, []);

  const handleCardPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const inner = e.currentTarget.querySelector('.testimonial-card-inner') as HTMLElement | null;
    if (!inner) return;
    const rect = inner.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    inner.style.setProperty('--spotlight-x', `${px * 100}%`);
    inner.style.setProperty('--spotlight-y', `${py * 100}%`);
    e.currentTarget.style.setProperty('--tilt', `${((px - 0.5) * 1.2).toFixed(3)}deg`);
  };

  const handleCardPointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--tilt', '0deg');
  };

  const slideStateClasses = (i: number): string => {
    if (i === selectedIndex) return 'is-active';
    if (i === (selectedIndex - 1 + total) % total) return 'is-side is-side-left';
    if (i === (selectedIndex + 1) % total) return 'is-side is-side-right';
    return 'is-side';
  };

  const paginationRange = Array.from({ length: snapPoints.length > 0 ? snapPoints.length : total }, (_, i) => i);

  const sectionClass = [
    'testimonials-section',
    entered ? 'testimonials-in' : '',
    entranceDone ? 'testimonials-entrance-done' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="testimonials" ref={sectionRef} className={sectionClass} aria-labelledby="testimonials-heading">
      <div className="testimonials-grid" aria-hidden="true" />
      <div className="testimonials-glow testimonials-glow-left" aria-hidden="true" />
      <div className="testimonials-glow testimonials-glow-right" aria-hidden="true" />

      <div className="testimonials-content">
        <div className="testimonials-eyebrow">
          <span className="testimonials-eyebrow-line" aria-hidden="true" />
          <span className="testimonials-eyebrow-text">Client Stories</span>
          <span className="testimonials-eyebrow-line" aria-hidden="true" />
        </div>

        <h2 id="testimonials-heading" className="testimonials-heading">
          <span className="testimonials-heading-line">Trusted by Brands</span>
          <span className="testimonials-heading-line">
            That Value Great Design<span className="testimonials-heading-period">.</span>
          </span>
        </h2>
      </div>

      <div
        className="testimonials-carousel"
        data-ready={ready}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Client testimonials"
        onMouseEnter={() => handleCarouselHover(true)}
        onMouseLeave={() => handleCarouselHover(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scrollPrev();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scrollNext();
          }
        }}
      >
        <div
          className="testimonials-viewport"
          ref={(node) => {
            viewportRef.current = node;
            emblaRef(node);
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div className="testimonials-track" ref={trackRef}>
            {TESTIMONIALS.map((testimonial, index) => {
              const isActive = index === selectedIndex;
              const state = slideStateClasses(index);
              const ServiceIcon = SERVICE_ICONS[testimonial.projectTag] ?? Sparkles;
              return (
                <article
                  className="testimonial-slide"
                  key={testimonial.id}
                  data-index={index}
                  data-active={isActive}
                >
                  <div
                    className={`testimonial-card ${state}`}
                    aria-hidden={!isActive}
                    aria-roledescription="slide"
                    onClick={() => scrollTo(index)}
                    onPointerMove={isActive ? handleCardPointerMove : undefined}
                    onPointerLeave={isActive ? handleCardPointerLeave : undefined}
                  >
                    <div className="testimonial-card-inner">
                      <span className="sr-only">
                        Testimonial {index + 1} of {total}
                      </span>
                      <div className="testimonial-quote-wrap">
                        <blockquote className="testimonial-quote">
                          {testimonial.excerpt ?? testimonial.quote}
                        </blockquote>
                      </div>
                      <div className="testimonial-divider" aria-hidden="true" />
                      <footer className="testimonial-meta">
                        <div className="testimonial-author">
                          {testimonial.avatarUrl ? (
                            <img
                              className="testimonial-avatar"
                              src={testimonial.avatarUrl}
                              alt=""
                              width="36"
                              height="36"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <span className="testimonial-avatar-fallback" aria-hidden="true">
                              {getInitials(testimonial.authorName)}
                            </span>
                          )}
                          <div className="testimonial-author-info">
                            <span className="testimonial-author-name">{testimonial.authorName}</span>
                            <span className="testimonial-author-role">
                              {testimonial.authorRole}
                            </span>
                          </div>
                          <span className="testimonial-company-logo" aria-hidden="true">
                            {testimonial.companyName}
                          </span>
                        </div>
                        <div className="testimonial-meta-right">
                          <span className="testimonial-meta-rule" aria-hidden="true" />
                          <div className="testimonial-service">
                            <span className="testimonial-service-icon">
                              <ServiceIcon aria-hidden="true" />
                            </span>
                            <span>{testimonial.projectTag}</span>
                          </div>
                        </div>
                      </footer>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="testimonials-controls">
          <button className="testimonials-arrow" onClick={scrollPrev} aria-label="Previous testimonial">
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="testimonials-indicators" role="group" aria-label="Choose testimonial">
            {paginationRange.map((i) => (
              <button
                key={i}
                className={`testimonials-indicator${i === selectedIndex ? ' is-active' : ''}`}
                onClick={() => scrollTo(i)}
                aria-label={`Go to testimonial ${i + 1} of ${total}`}
                aria-current={i === selectedIndex ? 'true' : undefined}
              />
            ))}
          </div>
          <button className="testimonials-arrow" onClick={scrollNext} aria-label="Next testimonial">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="testimonials-content">
        <div className="testimonials-logos">
          <div className="testimonials-logos-marquee">
            <div className="testimonials-logos-track">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="testimonials-logos-set"
                  aria-hidden={copy === 1 ? 'true' : undefined}
                >
                  {clientLogos.map((logo) => {
                    const LogoIcon = logo.icon;
                    return (
                      <div
                        key={logo.name}
                        className="testimonials-logo"
                        style={{ '--logo-spacing': logo.tracking } as React.CSSProperties}
                      >
                        <LogoIcon className="testimonials-logo-mark" aria-hidden="true" />
                        <span className="testimonials-logo-name">{logo.name}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
