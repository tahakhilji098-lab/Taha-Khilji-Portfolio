import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';
import { premiumEase } from '../motion/primitives';

export const Hero: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });
  const rafId = useRef<number>(0);
  const isTouchDevice = useRef(false);

  const reduce = useReducedMotion();

  const h1Ref = useRef<HTMLHeadingElement | null>(null);

  /* Once a line finishes revealing, open its temporary mask so glyph
     overhangs (serif descenders, italic overhang, period) are never clipped. */
  const handleLineRevealEnd = useCallback((e: any) => {
    e.currentTarget.parentElement?.setAttribute('data-revealed', 'true');
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      h1Ref.current?.querySelectorAll<HTMLElement>('.hero-line-mask').forEach((mask) =>
        mask.setAttribute('data-revealed', 'true'),
      );
    }
  }, []);

  /* Scroll-exit drift: content lifts and dims as the hero scrolls away */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -16]);
  const stageDistance = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches ? -16 : -24;
  const stageY = useTransform(scrollYProgress, [0, 1], [0, stageDistance]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.72]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -12]);

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    if (isTouchDevice.current) return;

    const animate = () => {
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.06;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.06;

      const nx = (mouseCurrent.current.x - 0.5) * 2;
      const ny = (mouseCurrent.current.y - 0.5) * 2;

      parallaxRefs.current.forEach((el, i) => {
        if (!el) return;
        const depth = 1 + i * 0.35;
        el.style.setProperty('--px', `${nx * 4 * depth}px`);
        el.style.setProperty('--py', `${ny * 4 * depth}px`);
        el.style.setProperty('--pr', `${nx * 0.2 * depth}deg`);
      });

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseTarget.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseTarget.current = { x: 0.5, y: 0.5 };
  }, []);

  const setParallaxRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    parallaxRefs.current[i] = el;
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cardConfigs = [
    {
      index: 0,
      className: 'animate-float-brand',
      delay: 0.18,
      style: { width: '68%', top: '3%', right: '2%', zIndex: 1 },
      baseRotation: 'rotate(5.5deg)',
      image: '/images/taha-card-01-brand-identity.png',
      alt: 'Cobalt blue and black brand identity mockup',
      label: 'Brand Identity',
    },
    {
      index: 1,
      className: 'animate-float-packaging',
      delay: 0.28,
      style: { width: '57%', top: '34%', left: '1%', zIndex: 2 },
      baseRotation: 'rotate(-5deg)',
      image: '/images/taha-card-02-packaging.png',
      alt: 'Premium ivory and black packaging design',
      label: 'Packaging Design',
    },
    {
      index: 2,
      className: 'animate-float-editorial',
      delay: 0.38,
      style: { width: '55%', right: '0', bottom: '2%', zIndex: 3 },
      baseRotation: 'rotate(6deg)',
      image: '/images/taha-card-03-editorial.png',
      alt: 'Architectural editorial magazine design',
      label: 'Editorial Design',
    },
  ];

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[calc(100svh-80px)] flex items-center bg-[#050A18] select-none"
      style={{ overflowX: 'clip' }}
    >
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: premiumEase }}
        style={{ backgroundImage: "url('/images/taha-hero-background.png')" }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(1,4,13,0.22) 0%, rgba(1,4,13,0.04) 50%, rgba(1,4,13,0.15) 100%)',
        }}
      />

      {/* Grid overlay */}
      <motion.div className="absolute inset-0 grid-overlay-subtle pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 60%, transparent 100%)', opacity: 0.12, y: reduce ? undefined : gridY }} />

      {/* Content container */}
      <div className="relative z-10 w-full max-w-[1720px] mx-auto px-[16px] sm:px-[24px] md:px-[36px] lg:px-[48px] xl:px-[64px] 2xl:px-[88px] pt-[130px] lg:pt-[155px] pb-[60px] lg:pb-[80px]">
        <div className="flex flex-col lg:grid items-center w-full"
          style={{
            gap: 'clamp(48px, 4vw, 72px)',
            gridTemplateColumns: 'minmax(0, 0.96fr) minmax(0, 1.04fr)',
          }}>

          {/* ===== LEFT COLUMN ===== */}
          <motion.div
            className="hero-copy w-full text-center lg:text-left min-w-0"
            style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
          >

            {/* Eyebrow — fade and rise 10px */}
            <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 0 }}>
              <div className="inline-flex items-center gap-3 lg:gap-4 mb-[44px] lg:mb-[52px]">
                <span className="text-[11px] lg:text-[11.5px] font-mono uppercase tracking-[0.25em] text-[#F7F9FF] font-semibold">
                  TAHA KHILJI
                </span>
                <span className="w-5 lg:w-6 h-px bg-[#498CEB]/40 hidden sm:inline-block" />
                <span className="text-[11px] lg:text-[11.5px] font-mono uppercase tracking-[0.25em] text-[#498CEB]">
                  GRAPHIC DESIGNER
                </span>
              </div>
            </motion.div>

            {/* Headline — masked line reveal, line by line */}
            <h1 ref={h1Ref} className="hero-heading font-serif text-[clamp(40px,11.5vw,54px)] lg:text-[clamp(64px,5.1vw,86px)] font-normal leading-[1.0] lg:leading-[0.99] tracking-[-0.04em] lg:tracking-[-0.045em] lg:mx-0 mx-auto">
              <span className="hero-line">
                <span className="hero-line-mask">
                  <motion.span className="block text-[#F7F9FF]" initial={reduce ? false : { y: '110%' }} animate={reduce ? undefined : { y: '0%' }} transition={{ duration: 0.95, ease: premiumEase, delay: 0.1 }} onAnimationComplete={() => handleLineRevealEnd({ currentTarget: h1Ref.current?.querySelectorAll('.hero-line-mask')[0].children[0] } as any)}>
                    I Design Visuals
                  </motion.span>
                </span>
              </span>
              <span className="hero-line">
                <span className="hero-line-mask">
                  <motion.span className="block text-[#F7F9FF]" initial={reduce ? false : { y: '110%' }} animate={reduce ? undefined : { y: '0%' }} transition={{ duration: 0.95, ease: premiumEase, delay: 0.18 }} onAnimationComplete={() => handleLineRevealEnd({ currentTarget: h1Ref.current?.querySelectorAll('.hero-line-mask')[1].children[0] } as any)}>
                    That Make Brands
                  </motion.span>
                </span>
              </span>
              <span className="hero-line hero-line--accent">
                <span className="hero-line-mask">
                  <motion.span className="block font-serif italic text-[#267DFF]" initial={reduce ? false : { y: '110%' }} animate={reduce ? undefined : { y: '0%' }} transition={{ duration: 0.95, ease: premiumEase, delay: 0.27 }} onAnimationComplete={() => handleLineRevealEnd({ currentTarget: h1Ref.current?.querySelectorAll('.hero-line-mask')[2].children[0] } as any)}>
                    Impossible to Ignore.
                  </motion.span>
                </span>
              </span>
            </h1>

            {/* Description — fades upward */}
            <motion.p className="text-[17px] lg:text-[19px] leading-[1.6] lg:leading-[1.65] text-[#8A95B0] font-light max-w-[540px] mt-[34px] lg:mt-[38px] lg:mx-0 mx-auto" initial={reduce ? false : { opacity: 0, y: 32 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 0.37 }}>
              Bold brand identities, advertising creatives
              and digital experiences built to make an impact.
            </motion.p>

            {/* Buttons — arrive together with small stagger */}
            <motion.div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-center lg:justify-start gap-[14px] sm:gap-[16px] mt-[36px] lg:mt-[42px]" initial={reduce ? false : { opacity: 0, y: 32 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 0.46 }}>
              {/* Primary */}
              <a
                href="#projects"
                onClick={(e) => scrollToSection(e, '#projects')}
                className="group inline-flex items-center justify-center gap-2.5 min-h-[56px] sm:h-[62px] px-[28px] sm:px-[32px] text-[15px] font-bold rounded-[4px] text-white cursor-pointer w-full sm:w-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#498CEB] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  background: 'linear-gradient(135deg, #1684ff 0%, #075de8 100%)',
                  boxShadow: '0 4px 20px rgba(22, 132, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)',
                  transition: 'transform 400ms cubic-bezier(0.22,1,0.36,1), box-shadow 400ms ease, background 400ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-2px) scale(1.015)';
                  el.style.boxShadow = '0 8px 30px rgba(22, 132, 255, 0.40), inset 0 1px 0 rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 4px 20px rgba(22, 132, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.15)';
                }}
              >
                <span>View My Work</span>
                <ArrowUpRight className="w-[16px] h-[16px] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" />
              </a>

              {/* Secondary */}
              <a
                href={GMAIL_COMPOSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2.5 min-h-[56px] sm:h-[62px] px-[28px] sm:px-[32px] text-[15px] font-semibold rounded-[4px] text-white cursor-pointer w-full sm:w-auto bg-transparent border border-[rgba(73,140,235,0.35)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#498CEB] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{
                  backdropFilter: 'blur(4px)',
                  transition: 'transform 400ms cubic-bezier(0.22,1,0.36,1), background 400ms ease, border-color 400ms ease, box-shadow 400ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(-2px)';
                  el.style.background = 'rgba(73, 140, 235, 0.08)';
                  el.style.borderColor = 'rgba(73, 140, 235, 0.70)';
                  el.style.boxShadow = '0 4px 20px rgba(73, 140, 235, 0.12)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = 'translateY(0)';
                  el.style.background = 'transparent';
                  el.style.borderColor = 'rgba(73, 140, 235, 0.35)';
                  el.style.boxShadow = 'none';
                }}
                aria-label="Start a project with Taha Khilji using Gmail"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-[16px] h-[16px] text-[#5BB8FF] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" aria-hidden="true" />
              </a>
            </motion.div>

            {/* Availability Badge — fades last */}
            <motion.div className="mt-[50px] lg:mt-[70px]" initial={reduce ? false : { opacity: 0, y: 24 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 0.56 }}>
              <div className="inline-flex items-center gap-3 h-[40px] px-[18px] rounded-full border border-[rgba(73,140,235,0.22)] bg-[rgba(5,10,24,0.55)] backdrop-blur-sm">
                <span className="relative flex h-[9px] w-[9px]">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#267DFF] animate-hero-dot-pulse" />
                  <span className="relative inline-flex rounded-full h-[9px] w-[9px] bg-[#5BB8FF]" />
                </span>
                <span className="text-[10px] font-mono uppercase tracking-[0.17em] text-[#F7F9FF] font-semibold">
                  AVAILABLE FOR SELECT PROJECTS
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* ===== RIGHT COLUMN: Card Composition ===== */}
          <motion.div className="flex justify-end min-w-0 w-full" style={reduce ? undefined : { y: stageY }}>
            <div className="relative h-[clamp(280px,86vw,390px)] sm:h-[520px] lg:h-[700px]"
              style={{ width: 'min(100%, 720px)' }}
            >
              <div className="w-full h-full"
                style={{ transform: 'scale(0.94)', transformOrigin: 'center right' }}
              >
              <div className="relative w-full h-full">
              {cardConfigs.map((cfg) => (
                <div
                  key={cfg.index}
                  ref={setParallaxRef(cfg.index)}
                  className="absolute hero-card-layer"
                  style={{
                    ...cfg.style,
                    transform: cfg.baseRotation,
                    willChange: 'transform',
                  }}
                >
                  <motion.div
                    className={`w-full`}
                    initial={reduce ? false : { opacity: 0, y: 34, scale: 0.97 }}
                    animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.72, ease: premiumEase, delay: cfg.delay as unknown as number }}
                    style={{
                      willChange: 'transform',
                    }}
                  >
                    <div
                      className="w-full rounded-[12px] overflow-hidden cursor-pointer"
                      style={{
                        aspectRatio: '3 / 2',
                        background: '#07101f',
                        border: `1px solid rgba(103, 155, 235, ${hoveredCard === cfg.index ? '0.50' : '0.26'})`,
                        boxShadow: hoveredCard === cfg.index
                          ? '0 32px 70px rgba(0,0,0,0.50), 0 12px 30px rgba(0,41,110,0.25), inset 0 1px 0 rgba(255,255,255,0.05)'
                          : '0 28px 60px rgba(0,0,0,0.46), 0 8px 22px rgba(0,41,110,0.20), inset 0 1px 0 rgba(255,255,255,0.05)',
                        transform: hoveredCard === cfg.index ? 'translateY(-6px) scale(1.015)' : 'translateY(0) scale(1)',
                        transition: 'transform 550ms cubic-bezier(0.22,1,0.36,1), border-color 450ms ease, box-shadow 550ms ease',
                        position: 'relative',
                        isolation: 'isolate',
                      }}
                      onMouseEnter={() => setHoveredCard(cfg.index)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <img
                        src={cfg.image}
                        alt={cfg.alt}
                        className="block w-full h-full object-cover object-center"
                        style={{
                          transform: hoveredCard === cfg.index ? 'scale(1.035)' : 'scale(1)',
                          filter: hoveredCard === cfg.index ? 'brightness(1.04)' : 'brightness(1)',
                          transition: 'transform 700ms cubic-bezier(0.22,1,0.36,1), filter 500ms ease',
                        }}
                      />
                      <span className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-[0.15em] bg-[rgba(7,16,31,0.75)] border border-[rgba(103,155,235,0.20)] text-[#9EA8BD] backdrop-blur-sm pointer-events-none select-none">
                        {cfg.label}
                      </span>
                    </div>
                  </motion.div>
                </div>
              ))}
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
