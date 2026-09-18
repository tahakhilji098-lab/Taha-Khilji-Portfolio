import React, { useRef, useEffect, useCallback } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { premiumEase } from '../motion/primitives';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

export const Hero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

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
  const contentOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.72]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden select-none"
    >
      {/* Background Video — plays once, no loop */}
      <video
        src="/videos/hero_video.mp4"
        preload="auto"
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Dark Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[150px] sm:h-[250px] bg-gradient-to-t from-[#030712] to-transparent z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 max-w-[1440px] mx-auto w-full px-[16px] sm:px-[24px] md:px-[36px] lg:px-[48px] xl:px-[64px] pt-[140px] md:pt-[180px] lg:pt-[220px] h-full flex flex-col justify-center items-start">
        <motion.div
          className="hero-copy w-full max-w-3xl text-left min-w-0"
          style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        >

          {/* Eyebrow — fade and rise 10px */}
          <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 1.2 }}>
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
                <motion.span className="block text-[#F7F9FF]" initial={reduce ? false : { y: '110%' }} animate={reduce ? undefined : { y: '0%' }} transition={{ duration: 0.95, ease: premiumEase, delay: 1.3 }} onAnimationComplete={() => handleLineRevealEnd({ currentTarget: h1Ref.current?.querySelectorAll('.hero-line-mask')[0].children[0] } as any)}>
                  I Design Visuals
                </motion.span>
              </span>
            </span>
            <span className="hero-line">
              <span className="hero-line-mask">
                <motion.span className="block text-[#F7F9FF]" initial={reduce ? false : { y: '110%' }} animate={reduce ? undefined : { y: '0%' }} transition={{ duration: 0.95, ease: premiumEase, delay: 1.38 }} onAnimationComplete={() => handleLineRevealEnd({ currentTarget: h1Ref.current?.querySelectorAll('.hero-line-mask')[1].children[0] } as any)}>
                  That Make Brands
                </motion.span>
              </span>
            </span>
            <span className="hero-line hero-line--accent">
              <span className="hero-line-mask">
                <motion.span className="block font-serif italic text-[#267DFF]" initial={reduce ? false : { y: '110%' }} animate={reduce ? undefined : { y: '0%' }} transition={{ duration: 0.95, ease: premiumEase, delay: 1.47 }} onAnimationComplete={() => handleLineRevealEnd({ currentTarget: h1Ref.current?.querySelectorAll('.hero-line-mask')[2].children[0] } as any)}>
                  Impossible to Ignore.
                </motion.span>
              </span>
            </span>
          </h1>

          {/* Description — fades upward */}
          <motion.p className="text-[17px] lg:text-[19px] leading-[1.6] lg:leading-[1.65] text-[#8A95B0] font-light max-w-[540px] mt-[34px] lg:mt-[38px] lg:mx-0 mx-auto" initial={reduce ? false : { opacity: 0, y: 32 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 1.57 }}>
            Bold brand identities, advertising creatives
            and digital experiences built to make an impact.
          </motion.p>

          {/* Buttons — arrive together with small stagger */}
          <motion.div className="flex flex-col sm:flex-row items-center sm:items-stretch justify-center lg:justify-start gap-[14px] sm:gap-[16px] mt-[36px] lg:mt-[42px]" initial={reduce ? false : { opacity: 0, y: 32 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 1.66 }}>
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
          <motion.div className="mt-[50px] lg:mt-[70px]" initial={reduce ? false : { opacity: 0, y: 24 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.72, ease: premiumEase, delay: 1.76 }}>
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
      </div>
    </section>
  );
};
