import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { premiumEase } from '../motion/primitives';
import { getOptimizedImage } from '../assets/optimized/images';

export interface MagneticService {
  id: string;
  image: string;
  alt: string;
  category: string;
  title: string;
  description?: string;
  features: string[];
  objectPosition?: string;
  titleSize?: "default" | "medium" | "compact";
}

export const SERVICE_SLIDES: MagneticService[] = [
  {
    id: "brand-identity-design",
    image: "/images/services/service-01-brand-identity-hover.png",
    alt: "Brand identity design presentation",
    category: "BRAND STRATEGY",
    title: "Brand Identity\nDesign",
    description: "Distinctive identity systems that turn strategy into recognition.",
    features: ["Logo systems", "Visual language", "Brand guidelines"],
    objectPosition: "center",
    titleSize: "medium",
  },
  {
    id: "social-media-creatives",
    image: "/images/services/service-02-social-media-hover.png",
    alt: "Social media creative design presentation",
    category: "SOCIAL CONTENT",
    title: "Social Media\nCreatives",
    description: "Platform-ready visuals designed to stop, engage and convert.",
    features: ["Campaign systems", "Platform-ready formats", "Content templates"],
    objectPosition: "center",
    titleSize: "medium",
  },
  {
    id: "advertising-design",
    image: "/images/services/service-03-advertising-hover.png",
    alt: "Advertising campaign design presentation",
    category: "CAMPAIGN VISUALS",
    title: "Advertising\nDesign",
    description: "Campaign visuals engineered to capture attention and inspire action.",
    features: ["Creative concepts", "Key visuals", "Ad variations"],
    objectPosition: "center",
    titleSize: "default",
  },
  {
    id: "packaging-design",
    image: "/images/services/service-04-packaging-hover.png",
    alt: "Premium packaging design presentation",
    category: "PACKAGING",
    title: "Packaging\nDesign",
    description: "Shelf-ready packaging that makes product value tangible.",
    features: ["Packaging systems", "Product mockups", "Production-ready files"],
    objectPosition: "center",
    titleSize: "default",
  },
  {
    id: "website-ui-design",
    image: "/images/services/service-05-website-ui-hover.png",
    alt: "Website user interface design presentation",
    category: "DIGITAL EXPERIENCE",
    title: "Website UI\nDesign",
    description: "Responsive digital experiences shaped around clarity and conversion.",
    features: ["Responsive interfaces", "Design systems", "Conversion-focused flows"],
    objectPosition: "center",
    titleSize: "default",
  },
  {
    id: "print-marketing-materials",
    image: "/images/services/service-06-print-marketing-hover.png",
    alt: "Print and marketing materials presentation",
    category: "BRAND COLLATERAL",
    title: "Print &\nMarketing\nMaterials",
    description: "Tactile brand assets designed to leave a lasting impression.",
    features: ["Brochures", "Presentations", "Brand collateral"],
    objectPosition: "center",
    titleSize: "compact",
  },
];

type WindowPhase = "closed" | "opening" | "open" | "closing";

interface WindowSize {
  left: number;
  top: number;
  width: number;
  height: number;
}

/* Geometry of the clicked capsule — the shared-element morph originates and
   returns to this box. Captured at click time so the projection source
   (the portal ghost) can mount with its layoutId already in place. */
interface SourceGeometry {
  rect: WindowSize;
  radius: number;
}

const canUseDOM = typeof document !== "undefined";

/* Shared-element window transition (Framer Motion layoutId):
   shell morphs from the clicked capsule rect into the centered window and
   back. Durations follow the site's motion tokens. */
const WINDOW_LAYOUT_TRANSITION = { duration: 0.6, ease: premiumEase } as const;

function smoothStep(x: number): number {
  return x * x * (3 - 2 * x);
}

export const MagneticServicesCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<WindowPhase>("closed");
  const [revealDetails, setRevealDetails] = useState(false);
  const [sourceVisible, setSourceVisible] = useState(false);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);
  const computeWindowSize = (): WindowSize => {
    const targetWidth = Math.min(960, window.innerWidth - 48);
    const targetHeight = Math.min(600, window.innerHeight - 48);
    return {
      left: (window.innerWidth - targetWidth) / 2,
      top: Math.max(24, (window.innerHeight - targetHeight) / 2),
      width: targetWidth,
      height: targetHeight,
    };
  };

  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    if (!canUseDOM) {
      return { left: 0, top: 0, width: 960, height: 600 };
    }
    return computeWindowSize();
  });

  const [source, setSource] = useState<SourceGeometry | null>(null);

  const reduce = useReducedMotion();

  // Magnetic state refs
  const rafRef = useRef<number>(0);
  const pointerX = useRef<number | null>(null);

  // Window animation state
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const bodyOverflowRef = useRef<string>('');
  const pendingScrollRef = useRef(false);
  const switchTimerRef = useRef<number>(0);
  const closeTimerRef = useRef<number>(0);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Responsive metrics
  const config = useRef({
    collapsedWidth: 144,
    collapsedHeight: 580,
    gap: 16,
    maxMagneticWidth: 264,
    maxMagneticHeight: 615,
    influenceRadius: 300,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsCoarse(window.matchMedia('(pointer: coarse)').matches);

      if (width < 768) {
        config.current = {
          collapsedWidth: 42,
          collapsedHeight: 280,
          gap: 6,
          maxMagneticWidth: 150,
          maxMagneticHeight: 320,
          influenceRadius: 200,
        };
      } else if (width < 1024) {
        config.current = {
          collapsedWidth: 96,
          collapsedHeight: 470,
          gap: 14,
          maxMagneticWidth: 216,
          maxMagneticHeight: 505,
          influenceRadius: 250,
        };
      } else {
        config.current = {
          collapsedWidth: 144,
          collapsedHeight: 580,
          gap: 16,
          maxMagneticWidth: 264,
          maxMagneticHeight: 615,
          influenceRadius: 300,
        };
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Preload images
    SERVICE_SLIDES.forEach(slide => {
      const img = new Image();
      const optimized = getOptimizedImage(slide.image);
      img.src = optimized ? optimized.largestUrl : slide.image;
    });
  }, []);

  // Magnetic animation loop
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // We only animate if not mobile/coarse and no card is open
    if (isCoarse || openIndex !== null) {
      // Reset variables smoothly to collapsed state
      pointerX.current = null;
    }

    let items = Array.from(track.children) as HTMLElement[];
    let currentWidths = items.map(() => config.current.collapsedWidth);

    const loop = () => {
      if (!trackRef.current) return;
      const c = config.current;
      const itemCount = items.length;

      const trackRect = trackRef.current.getBoundingClientRect();
      const stripWidth = trackRect.width || window.innerWidth - 32;

      const restingRowWidth = itemCount * c.collapsedWidth + (itemCount - 1) * c.gap;
      const rowStart = (stripWidth - restingRowWidth) / 2;

      const targetWidths = items.map((_, i) => {
        if (openIndex !== null) {
          // While the feature window is open every capsule rests at its
          // collapsed size — the anchor stays in place as an invisible
          // layout placeholder for the closing FLIP.
          return c.collapsedWidth;
        }

        if (pointerX.current === null || isCoarse) {
          return c.collapsedWidth;
        }

        const originalCenter = trackRect.left + rowStart + i * (c.collapsedWidth + c.gap) + c.collapsedWidth / 2;

        const dist = Math.abs(pointerX.current - originalCenter);
        const normalized = Math.max(0, 1 - dist / c.influenceRadius);
        const factor = smoothStep(normalized);

        return c.collapsedWidth + (c.maxMagneticWidth - c.collapsedWidth) * factor;
      });

      let changed = false;
      currentWidths = currentWidths.map((cw, i) => {
        const target = targetWidths[i];
        const diff = target - cw;
        if (Math.abs(diff) > 0.1) {
          changed = true;
          return cw + diff * 0.15;
        }
        return target;
      });

      if (changed || openIndex !== null || pointerX.current !== null) {
        items.forEach((item, i) => {
          const w = currentWidths[i];
          item.style.width = `${w}px`;

          const hFactor = (w - c.collapsedWidth) / (c.maxMagneticWidth - c.collapsedWidth || 1);
          const targetH = c.collapsedHeight + (c.maxMagneticHeight - c.collapsedHeight) * hFactor;
          item.style.height = `${targetH}px`;

          const influence = (w - c.collapsedWidth) / (c.maxMagneticWidth - c.collapsedWidth || 1);
          const radius = 27 + (c.collapsedWidth / 2 - 27) * (1 - influence);
          item.style.borderRadius = `${radius}px`;

          const revealAmount = openIndex !== null
            ? 1
            : Math.max(0, Math.min(1, (influence - 0.42) / 0.58));
          item.style.setProperty('--content-opacity', revealAmount.toString());
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [openIndex, isMobile, isCoarse]);

  const finishClose = useCallback(() => {
    window.clearTimeout(switchTimerRef.current);
    window.clearTimeout(closeTimerRef.current);
    setPhase('closed');
    setOpenIndex(null);
    setActiveIndex(0);
    setExitingIndex(null);
    setSlideDir(0);
    setRevealDetails(false);
    setSourceVisible(false);

    if (pendingScrollRef.current) {
      pendingScrollRef.current = false;
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }

    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus({ preventScroll: true });
      lastFocusedRef.current = null;
    }
  }, [reduce]);

  const closeWindow = useCallback((opts?: { contact?: boolean }) => {
    // Ignored while a transition is running.
    if (phase !== 'open') return;
    pendingScrollRef.current = opts?.contact ?? false;
    // 1. Fade the detail content out first (CSS transition, no delay).
    setRevealDetails(false);
    // 2. Then reverse the shared-element morph back to the capsule.
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setPhase('closing');
    }, 160);
  }, [phase]);

  // Scroll lock while the window exists
  useEffect(() => {
    if (phase === 'closed') return;
    bodyOverflowRef.current = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = bodyOverflowRef.current;
      document.body.style.paddingRight = '';
    };
  }, [phase]);

  // Reveal the detail text on the first painted frame of the shell. The CSS
  // transition-delay (300ms) lands the reveal ~50% into the 600ms morph.
  useEffect(() => {
    if (phase !== 'opening') return;
    const id = requestAnimationFrame(() => setRevealDetails(true));
    return () => cancelAnimationFrame(id);
  }, [phase]);

  // Safety net: make the window interactive even if onAnimationComplete
  // does not fire for the layout projection.
  useEffect(() => {
    if (phase !== 'opening') return;
    const t = window.setTimeout(() => setPhase('open'), reduce ? 220 : 720);
    return () => window.clearTimeout(t);
  }, [phase, reduce]);

  // Safety net: tear the portal down even if the reverse projection's
  // animationComplete never fires (the ghost's exit is owned by the overlay).
  useEffect(() => {
    if (phase !== 'closing') return;
    const t = window.setTimeout(() => finishClose(), reduce ? 260 : 1000);
    return () => window.clearTimeout(t);
  }, [phase, reduce, finishClose]);

  // The capsule becomes visible again only near the end of the reverse morph
  // so the dialog and the capsule never flash simultaneously.
  useEffect(() => {
    if (phase !== 'closing') return;
    const t = window.setTimeout(
      () => setSourceVisible(true),
      reduce ? 0 : Math.round(600 * 0.85)
    );
    return () => window.clearTimeout(t);
  }, [phase, reduce]);

    // Flip the reveal class on the next frame so the browser paints the
    // hidden (full-cover image) state first and the 360ms transition-delay
    // can fade the details in after the shell has begun expanding.
    requestAnimationFrame(() => {
      setRevealDetails(true);
    });

  // Reposition the window without clipping while it is open
  useEffect(() => {
    if (phase === 'closed') return;
    const handleResize = () => {
      const currentPhase = phaseRef.current;
      if (currentPhase === 'opening') {
        setRevealDetails(true);
        setPhase('open');
        return;
      }
      if (currentPhase === 'closing') {
        finishClose();
        return;
      }
      setWindowSize(computeWindowSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phase, finishClose]);

  // Focus the close button once the window is fully open
  useEffect(() => {
    if (phase === 'open' && closeBtnRef.current) {
      closeBtnRef.current.focus({ preventScroll: true });
    }
  }, [phase]);

  // Keyboard: Escape closes, arrows switch services without collapsing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'closed') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeWindow();
      } else if (phase === 'open' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        switchService(dir);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeIndex, exitingIndex]);

  const switchService = (dir: number) => {
    if (phase !== 'open' || exitingIndex !== null) return;
    const next = (activeIndex + dir + SERVICE_SLIDES.length) % SERVICE_SLIDES.length;
    if (next === activeIndex) return;
    setSlideDir(dir);
    setExitingIndex(activeIndex);
    setActiveIndex(next);
    window.clearTimeout(switchTimerRef.current);
    switchTimerRef.current = window.setTimeout(() => setExitingIndex(null), 360);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isCoarse || openIndex !== null) return;
    pointerX.current = e.clientX;
  };

  const handlePointerLeave = () => {
    pointerX.current = null;
  };

  const openWindow = (index: number) => {
    if (phase !== 'closed') return;
    setWindowSize(computeWindowSize());
    const card = cardRefs.current[index];
    if (card) {
      lastFocusedRef.current = card;
      if (!reduce) {
        const rect = card.getBoundingClientRect();
        const radius = parseFloat(getComputedStyle(card).borderRadius) || 0;
        setSource({
          rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          radius,
        });
      }
    }
    setOpenIndex(index);
    setActiveIndex(index);
    setSlideDir(0);
    setExitingIndex(null);
    setRevealDetails(false);
    setSourceVisible(false);
    setPhase('opening');
  };

  const layers = useMemo(() => {
    const arr: { index: number; kind: 'enter' | 'exit' }[] = [{ index: activeIndex, kind: 'enter' }];
    if (exitingIndex !== null && exitingIndex !== activeIndex) {
      arr.unshift({ index: exitingIndex, kind: 'exit' });
    }
    return arr;
  }, [activeIndex, exitingIndex]);

  const windowOpen = phase !== 'closed';
  const openService = openIndex !== null ? SERVICE_SLIDES[openIndex] : null;
  const slideVar = { '--window-slide-x': `${slideDir * 10}px` } as React.CSSProperties;
  const isSwitching = exitingIndex !== null;

  return (
    <div className="magnetic-services" ref={containerRef}>
      <div className="magnetic-services__stage">
        <div
          className="magnetic-services__strip"
          ref={trackRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {SERVICE_SLIDES.map((service, index) => {
            const isSource = openIndex === index && windowOpen;
            const isInactive = openIndex !== null && !isSource;
            const optimized = getOptimizedImage(service.image);
            const imgSrc = optimized ? optimized.largestUrl : service.image;

            return (
              <motion.button
                key={service.id}
                ref={(el) => { cardRefs.current[index] = el; }}
                className={`magnetic-services__card ${isSource ? 'is-source' : ''} ${isSource && sourceVisible ? 'is-returning' : ''} ${isInactive ? 'is-inactive' : ''}`}
                data-title-size={service.titleSize || 'default'}
                aria-label={service.title.replace(/\n/g, ' ')}
                tabIndex={windowOpen ? -1 : 0}
                style={{
                  width: config.current.collapsedWidth,
                  height: config.current.collapsedHeight,
                  borderRadius: config.current.collapsedWidth / 2,
                }}
              >
                <img
                  className="magnetic-services__image"
                  src={imgSrc}
                  alt={service.alt}
                  style={{ objectPosition: service.objectPosition }}
                  draggable="false"
                />

                <span className="magnetic-services__shade" />
                <span className="magnetic-services__reflection" />

                <span className="magnetic-services__content">
                  <span className="magnetic-services__category">{service.category}</span>
                  <span className="magnetic-services__title">
                    {service.title
                      .split('\n')
                      .map((line, lineIndex) => (
                        <span
                          key={`${service.id}-${lineIndex}`}
                          className="magnetic-services__title-line"
                        >
                          {line}
                        </span>
                      ))}
                  </span>
                </span>

                <span className="magnetic-services__number">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {!isCoarse && !windowOpen && (
        <div className="magnetic-services__hint">
          Move your cursor across the services
        </div>
      )}
      {isCoarse && !windowOpen && (
        <div className="magnetic-services__hint">
          Move your cursor across the services
        </div>
      )}

      {windowOpen && openIndex !== null && canUseDOM && createPortal(
        <AnimatePresence onExitComplete={finishClose}>
          <motion.div
            key="service-overlay"
            className="magnetic-services__overlay"
            initial={
              reduce
                ? { opacity: 0 }
                : { backgroundColor: 'rgba(1, 5, 16, 0)', backdropFilter: 'blur(0px) saturate(1)' }
            }
            animate={
              reduce
                ? { opacity: 1, transition: { duration: 0.16, ease: 'linear' } }
                : {
                    backgroundColor: 'rgba(1, 5, 16, 0.7)',
                    backdropFilter: 'blur(11px) saturate(0.82)',
                    transition: { duration: 0.2, ease: 'easeOut' },
                  }
            }
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.16, ease: 'linear' } }
                : {
                    backgroundColor: 'rgba(1, 5, 16, 0)',
                    backdropFilter: 'blur(0px) saturate(1)',
                    transition: { duration: 0.2, ease: 'easeIn' },
                  }
            }
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) closeWindow();
            }}
            data-lenis-prevent
          >
            {!reduce && source && openService && (
              <motion.div
                key={phase === 'closing' ? 'magnetic-ghost-return' : 'magnetic-ghost-origin'}
                className="magnetic-services__ghost"
                data-title-size={openService.titleSize || 'default'}
                layoutId="magnetic-service-window"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={
                  phase === 'closing'
                    ? { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }
                    : { opacity: [0, 1, 0], transition: { duration: 0.5, times: [0, 0.35, 1], ease: 'easeInOut' } }
                }
                transition={WINDOW_LAYOUT_TRANSITION}
                onLayoutAnimationComplete={() => {
                  if (phaseRef.current === 'closing') finishClose();
                }}
                style={{
                  left: source.rect.left,
                  top: source.rect.top,
                  width: source.rect.width,
                  height: source.rect.height,
                  borderRadius: source.radius,
                  '--content-opacity': 1,
                } as React.CSSProperties}
              >
                <img
                  className="magnetic-services__image"
                  src={getOptimizedImage(openService.image)?.largestUrl || openService.image}
                  alt=""
                  style={{ objectPosition: openService.objectPosition }}
                  draggable="false"
                />
                <span className="magnetic-services__shade" />
                <span className="magnetic-services__reflection" />
                <span className="magnetic-services__content">
                  <span className="magnetic-services__category">{openService.category}</span>
                  <span className="magnetic-services__title">
                    {openService.title.split('\n').map((line, lineIndex) => (
                      <span key={`ghost-${lineIndex}`} className="magnetic-services__title-line">
                        {line}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="magnetic-services__number">
                  {String(openIndex + 1).padStart(2, '0')}
                </span>
              </motion.div>
            )}
            <motion.div
              ref={windowRef}
              layoutId={reduce ? undefined : 'magnetic-service-window'}
              className={`magnetic-services__window ${phase === 'closing' ? 'is-closing' : ''} ${isSwitching ? 'is-switching' : ''} ${revealDetails ? 'magnetic-services__window--reveal-details' : ''}`}
              style={{ ...windowSize, borderRadius: 24, ...slideVar }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="magnetic-services-window-title"
              aria-describedby="magnetic-services-window-desc"
              data-lenis-prevent
              initial={{ opacity: 0 }}
              animate={
                reduce
                  ? { opacity: phase === 'closing' ? 0 : 1, transition: { duration: 0.16, ease: 'linear' } }
                  : {
                      opacity: phase === 'closing' ? 0 : 1,
                      transition: phase === 'closing'
                        ? { duration: 0.2, ease: 'easeIn' }
                        : { opacity: { delay: 0.3, duration: 0.3, ease: 'easeOut' } },
                    }
              }
              exit={reduce ? { opacity: 0, transition: { duration: 0.16, ease: 'linear' } } : undefined}
              transition={reduce ? undefined : WINDOW_LAYOUT_TRANSITION}
              onLayoutAnimationComplete={() => {
                if (phaseRef.current === 'opening') setPhase('open');
              }}
            >
            <div className="magnetic-services__window-grid">
              <div className="magnetic-services__window-media">
                {layers.map((layer) => {
                  const service = SERVICE_SLIDES[layer.index];
                  const optimized = getOptimizedImage(service.image);
                  const imgSrc = optimized ? optimized.largestUrl : service.image;
                  return (
                    <div
                      key={`media-${layer.index}`}
                      className={`magnetic-services__window-layer ${layer.kind === 'enter' ? 'has-enter' : 'has-exit'}`}
                      style={slideVar}
                      aria-hidden={layer.kind !== 'enter'}
                      tabIndex={layer.kind === 'enter' ? 0 : -1}
                    >
                      <img
                        className="magnetic-services__window-media-img"
                        src={imgSrc}
                        alt={service.alt}
                        style={{ objectPosition: service.objectPosition }}
                        draggable="false"
                      />
                      <span className="magnetic-services__window-media-shade" />
                      <span className="magnetic-services__window-media-reflection" />
                    </div>
                  );
                })}
              </div>

              <div className="magnetic-services__window-details">
                {layers.map((layer) => {
                  const service = SERVICE_SLIDES[layer.index];
                  const entering = layer.kind === 'enter';
                  return (
                    <div
                      key={`details-${layer.index}`}
                      className={`magnetic-services__window-layer ${entering ? 'has-enter' : 'has-exit'}`}
                      style={slideVar}
                      aria-hidden={!entering}
                      tabIndex={entering ? 0 : -1}
                    >
                      <span className="magnetic-services__window-number">
                        {String(layer.index + 1).padStart(2, '0')}
                      </span>
                      <span className="magnetic-services__window-category">
                        {service.category}
                      </span>
                      <h3
                        id={entering ? 'magnetic-services-window-title' : undefined}
                        className="magnetic-services__window-title"
                        data-title-size={service.titleSize || 'default'}
                      >
                        {service.title.split('\n').map((line) => (
                          <span key={line} className="magnetic-services__window-title-line">
                            {line}
                          </span>
                        ))}
                      </h3>
                      <p
                        id={entering ? 'magnetic-services-window-desc' : undefined}
                        className="magnetic-services__window-description"
                      >
                        {service.description}
                      </p>
                      <div className="magnetic-services__window-features">
                        {service.features.map((feature, fi) => (
                          <span
                            key={feature}
                            className="magnetic-services__window-feature"
                            style={{ '--stagger': `${fi * 70}ms` } as React.CSSProperties}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="magnetic-services__window-cta"
                        onClick={() => closeWindow({ contact: true })}
                      >
                        Discuss this service
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              ref={closeBtnRef}
              className="magnetic-services__window-close"
              onClick={() => closeWindow()}
              aria-label="Close service window"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
