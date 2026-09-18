import React, { useRef, useState, useEffect } from 'react';
import { TAHA_INFO } from '../data/portfolioData';
import { Download } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import photoshopIcon from '../assets/icons/tools/photoshop.png';
import illustratorIcon from '../assets/icons/tools/illustrator.png';
import figmaIcon from '../assets/icons/tools/figma.png';
import afterEffectsIcon from '../assets/icons/tools/after-effects.png';

const stats = [
  { value: 120, suffix: '+', label: 'Projects' },
  { value: 65, suffix: '+', label: 'Clients' },
  { value: 5, suffix: '+', label: 'Years' },
];

const designTools = [
  { key: 'photoshop', name: 'Photoshop', icon: photoshopIcon, accent: '#31a8ff' },
  { key: 'illustrator', name: 'Illustrator', icon: illustratorIcon, accent: '#ff9a00' },
  { key: 'figma', name: 'Figma', icon: figmaIcon, accent: '#a259ff' },
  { key: 'after-effects', name: 'After Effects', icon: afterEffectsIcon, accent: '#9999ff' },
];

const counterTargets = [120, 65, 5];
const counterDurations = [1600, 1500, 1400];
const counterStartOffset = 870;

export const About: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');

  const hasCountedRef = useRef(false);
  const counterFrameRef = useRef(0);
  const statNumberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const mountedRef = useRef(true);

  const reduce = useReducedMotion();

  /* ─── Progressive enhancement: add motion-ready class after mount ─── */
  useEffect(() => {
    mountedRef.current = true;
    setReady(true);
    return () => { mountedRef.current = false; };
  }, []);

  /* ─── Catch cached images that fire no load event ─── */
  useEffect(() => {
    const img = sectionRef.current?.querySelector<HTMLImageElement>('.about-portrait');
    if (img?.complete) {
      setImageState('loaded');
    }
  }, []);

  /* ─── IntersectionObserver triggers the entrance animation once ─── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    /* Start immediately when the section is already inside the viewport:
       page refresh mid-scroll, direct #about navigation, or visible before
       the observer attaches. */
    if (el.getBoundingClientRect().top < window.innerHeight * 0.82) {
      setRevealed(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        obs.disconnect();
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ─── Statistics count-up animation ─── */
  useEffect(() => {
    if (!revealed || hasCountedRef.current) return;

    hasCountedRef.current = true;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nodes = statNumberRefs.current.filter((el): el is HTMLSpanElement => el !== null);

    if (reducedMotion || nodes.length !== counterTargets.length) {
      nodes.forEach((node, index) => {
        node.textContent = String(counterTargets[index]);
      });
      return;
    }

    nodes.forEach((node) => {
      node.textContent = '0';
    });

    const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

    const startTime = performance.now();

    const update = (currentTime: number) => {
      if (!mountedRef.current) return;

      const elapsed = currentTime - startTime - counterStartOffset;

      if (elapsed <= 0) {
        counterFrameRef.current = requestAnimationFrame(update);
        return;
      }

      nodes.forEach((node, index) => {
        const duration = counterDurations[index];
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        node.textContent = String(Math.round(counterTargets[index] * eased));
      });

      const complete = counterDurations.every((duration) => elapsed >= duration);

      if (!complete) {
        counterFrameRef.current = requestAnimationFrame(update);
      } else {
        nodes.forEach((node, index) => {
          node.textContent = String(counterTargets[index]);
        });
      }
    };

    counterFrameRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(counterFrameRef.current);
      nodes.forEach((node, index) => {
        node.textContent = String(counterTargets[index]);
      });
    };
  }, [revealed]);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className={`about-section${ready ? ' about-motion-ready' : ''}${revealed ? ' is-revealed' : ''}`}
    >
      <div className="about-container">
        {/* ─── Left: Portrait Visual Stage ─── */}
        <div className="about-visual" ref={visualRef}>
          <div className="about-visual-backplane" aria-hidden="true" />
          <div className="about-portrait-clip">
            <img
              className="about-portrait"
              src={TAHA_INFO.avatar}
              alt="Taha Khilji, graphic designer"
              width="1122"
              height="1402"
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1280px) 46vw, (min-width: 1024px) 42vw, (min-width: 768px) 80vw, 100vw"
              draggable="false"
              onLoad={() => { if (mountedRef.current) setImageState('loaded'); }}
              onError={() => { if (mountedRef.current) setImageState('error'); }}
              data-loaded={imageState === 'loaded' || undefined}
              style={{ opacity: imageState === 'loading' ? 0 : undefined }}
            />
            <span className="about-portrait-tone" aria-hidden="true" />
          </div>
          <svg
            className="about-neon-edges"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              className="about-neon-edge about-neon-edge-left"
              x1="17"
              y1="0"
              x2="0"
              y2="100"
              vectorEffect="non-scaling-stroke"
            />
            <line
              className="about-neon-edge about-neon-edge-right"
              x1="100"
              y1="0"
              x2="76"
              y2="100"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* ─── Right: Content ─── */}
        <div className="about-content">
          <span className="about-eyebrow">
            ABOUT TAHA
            <span className="about-eyebrow-rule" aria-hidden="true" />
          </span>

          <h2 id="about-heading" className="about-heading">
            <span className="about-heading-line">
              <span>Creativity With a</span>
            </span>
            <span className="about-heading-line">
              <span>
                Clear Purpose<span className="about-heading-period">.</span>
              </span>
            </span>
          </h2>

          <p className="about-description">
            I create strategic and visually compelling design that helps
            ambitious brands stand out, communicate clearly and earn attention.
          </p>

          <div className="about-stats">
            {stats.map((stat, index) => (
              <div className="about-stat" key={stat.label}>
                <strong className="about-stat-value">
                  <span
                    ref={(el) => { statNumberRefs.current[index] = el; }}
                    className="about-stat-number"
                    data-count={stat.value}
                    aria-hidden="true"
                  >
                    {stat.value}
                  </span>
                  <span aria-hidden="true">{stat.suffix}</span>
                  <span className="sr-only">{stat.value} plus</span>
                </strong>
                <span className="about-stat-rule" aria-hidden="true" />
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="about-resume-wrapper">
            <a
              href="/Taha_Khilji_Resume.pdf"
              download="Taha_Khilji_Resume.pdf"
              className="about-resume-button"
              aria-label="Download Taha Khilji's résumé as a PDF"
            >
              <span className="about-resume-surface" aria-hidden="true" />
              <Download className="about-resume-icon" aria-hidden="true" />
              <span className="about-resume-label">Download Résumé</span>
            </a>
          </div>

          <ul className="about-tools" aria-label="Design tools">
            {designTools.map((tool) => (
              <li
                key={tool.name}
                className="about-tool"
                style={{ '--tool-accent': tool.accent } as React.CSSProperties}
              >
                <span className="tool-icon-frame" data-tool={tool.key} aria-hidden="true">
                  <img
                    src={tool.icon}
                    alt=""
                    width="34"
                    height="34"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="about-tool-label">{tool.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
