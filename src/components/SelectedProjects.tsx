import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { PROJECTS } from '../data/portfolioData';
import { Project } from '../types';
import { CaseStudyModal } from './CaseStudyModal';
import { ArrowUpRight } from 'lucide-react';
import { premiumEase } from '../motion/primitives';
import { getSupabase } from '../lib/supabase';

const FALLBACK_PROJECTS = PROJECTS.slice(0, 6);

const MAX_WHEEL_SLOTS = 72;
const ANGLE_STEP = 360 / MAX_WHEEL_SLOTS; // 5°

/* When we have fewer projects than MAX_WHEEL_SLOTS, space them evenly
   around the wheel instead of duplicating to fill every slot. */
const WHEEL_THRESHOLD = 4; /* Need at least this many for the wheel to look good */
function getWheelSlots(count: number): number {
  if (count >= MAX_WHEEL_SLOTS) return MAX_WHEEL_SLOTS;
  if (count <= 0) return 0;
  const multiple = Math.ceil(MAX_WHEEL_SLOTS / count);
  return count * multiple;
}

const PARTICLE_COUNT = 30;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    'Brand Identity': 'BRAND IDENTITY',
    'Social Media Design': 'SOCIAL CAMPAIGN',
    'Packaging': 'PACKAGING',
    'Editorial': 'EDITORIAL',
    'Website UI Design': 'WEBSITE DESIGN',
    'Advertising': 'ADVERTISING',
  };
  return map[category] || category.toUpperCase();
};

export const SelectedProjects: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [baseProjects, setBaseProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const sectionRef = useRef<HTMLElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  /* Fetch published projects from Supabase, fall back to hardcoded */
  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped: Project[] = data.map((row: any) => ({
            id: row.id || row.slug,
            title: row.title,
            subtitle: row.description?.slice(0, 80) || '',
            category: row.category || '',
            year: row.created_at ? new Date(row.created_at).getFullYear().toString() : '',
            client: '',
            thumbnail: row.cover_image_url || '',
            description: row.description || '',
            deliverables: [],
            featured: true,
            galleryImages: row.gallery_urls || [],
          }));
          setBaseProjects(mapped);
        }
      } catch {
        // Keep fallback projects on error
      }
    })();
  }, []);

  const handleCardHover = useCallback((entering: boolean) => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    wheel.classList.toggle('is-paused', entering);
  }, []);

  const handleContactScroll = () => {
    const el = document.querySelector('#contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = () => {
    setActiveProject(null);
    setOriginRect(null);
  };

  /* Deterministic particle data — stable across renders */
  const particles = useMemo(() => {
    const rand = seededRandom(42);
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      driftDuration: `${15 + rand() * 13}s`,
      driftDelay: `${rand() * 20}s`,
      driftX: `${-30 + rand() * 60}px`,
      isAlt: i % 6 === 0,
    }));
  }, []);

  return (
    <>
      <section
        id="projects"
        ref={sectionRef}
        className="pt-[100px] pb-0 relative overflow-hidden bg-[#030712]"
      >
        {/* Section Header — left-aligned */}
        <div className="work-section-intro max-w-7xl mx-auto px-6 relative z-10">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.72, ease: premiumEase }}
            className="text-xs font-mono uppercase tracking-[0.25em] text-[#267DFF] font-semibold block mb-4"
          >
            SELECTED WORK
          </motion.span>
          <h2 className="text-[clamp(2rem,8vw,3.5rem)] md:text-[clamp(2.5rem,4.5vw,4.5rem)] font-serif text-[#F7F9FF] tracking-tight leading-[1.08] mb-4">
            <span className="block overflow-hidden pb-1 -mb-1">
              <motion.span
                className="block"
                initial={reduce ? false : { y: '110%' }}
                whileInView={reduce ? undefined : { y: '0%' }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: premiumEase, delay: 0.1 }}
              >
                Work That Speaks
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-1 -mb-1">
              <motion.span
                className="block"
                initial={reduce ? false : { y: '110%' }}
                whileInView={reduce ? undefined : { y: '0%' }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease: premiumEase, delay: 0.18 }}
              >
                Before I Do
                <motion.span
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={reduce ? undefined : { opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.72, ease: premiumEase, delay: 0.3 }}
                  className="text-[#267DFF]"
                >.</motion.span>
              </motion.span>
            </span>
          </h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.72, ease: premiumEase, delay: 0.28 }}
            className="text-[17px] md:text-[19px] leading-[1.6] text-[#8A95B0] font-light max-w-[540px]"
          >
            Selected identities, campaigns and digital experiences.
          </motion.p>
        </div>

        {/* ─── Wheel Carousel v5 ─── */}
        <div className="work-wheel-wrap">
          <div className="work-wheel-viewport mx-auto max-w-[1400px]">
            {/* Ambient glow — behind everything */}
            <div className="wheel-ambient-glow" />

            {/* Floating particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className={`wheel-particle${p.isAlt ? ' wheel-particle--alt' : ''}`}
                style={{
                  left: p.left,
                  top: p.top,
                  '--drift-duration': p.driftDuration,
                  '--drift-delay': p.driftDelay,
                  '--drift-x': p.driftX,
                } as React.CSSProperties}
              />
            ))}

            {/* Edge fades — only for wheel mode */}
            {baseProjects.length >= WHEEL_THRESHOLD && (
              <>
                <div className="wheel-fade-left" />
                <div className="wheel-fade-right" />
              </>
            )}

            {/* ── Wheel mode (≥ WHEEL_THRESHOLD projects) ── */}
            {baseProjects.length >= WHEEL_THRESHOLD ? (
              <div
                ref={wheelRef}
                className={`work-wheel ${reduce ? '' : 'work-wheel--spin'}`}
              >
                {Array.from({ length: getWheelSlots(baseProjects.length) }).map((_, i) => {
                  const project = baseProjects[i % baseProjects.length];
                  const angle = i * (360 / getWheelSlots(baseProjects.length));
                  return (
                    <div
                      key={`${project.id}-${i}`}
                      className="wheel-arm"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <a
                        href={`#project-${project.id}`}
                        className="project-card group"
                        onClick={(e) => {
                          e.preventDefault();
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setOriginRect(rect);
                          setActiveProject(project);
                        }}
                        onMouseEnter={() => handleCardHover(true)}
                        onMouseLeave={() => handleCardHover(false)}
                        onFocus={() => handleCardHover(true)}
                        onBlur={() => handleCardHover(false)}
                        aria-label={`View project: ${project.title}`}
                      >
                        <div className="work-wheel__card-img">
                          <img
                            src={project.thumbnail}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050A15] via-transparent to-transparent opacity-40" />
                        </div>
                        <div className="work-wheel__card-text">
                          <h3 className="text-sm font-bold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors duration-400 truncate">
                            {project.title}
                          </h3>
                          <div className="text-[9px] font-mono text-[#7B87A3] uppercase tracking-wider mt-1">
                            {getCategoryLabel(project.category)}
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ── Static grid mode (few projects) ── */
              <div className="flex justify-center gap-6 px-6 py-12 flex-wrap max-w-[900px] mx-auto">
                {baseProjects.map((project) => (
                  <a
                    key={project.id}
                    href={`#project-${project.id}`}
                    className="project-card group"
                    style={{ width: 240, height: 300, position: 'relative' }}
                    onClick={(e) => {
                      e.preventDefault();
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setOriginRect(rect);
                      setActiveProject(project);
                    }}
                    onMouseEnter={() => handleCardHover(true)}
                    onMouseLeave={() => handleCardHover(false)}
                    onFocus={() => handleCardHover(true)}
                    onBlur={() => handleCardHover(false)}
                    aria-label={`View project: ${project.title}`}
                  >
                    <div className="work-wheel__card-img">
                      <img
                        src={project.thumbnail}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050A15] via-transparent to-transparent opacity-40" />
                    </div>
                    <div className="work-wheel__card-text">
                      <h3 className="text-sm font-bold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors duration-400 truncate">
                        {project.title}
                      </h3>
                      <div className="text-[9px] font-mono text-[#7B87A3] uppercase tracking-wider mt-1">
                        {getCategoryLabel(project.category)}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Button — independent element in normal flow */}
        <motion.a
          href="https://drive.google.com/drive/folders/1BjNV8x6qOQIVXccNQMAGz7FATa4tPceF?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.72, ease: premiumEase, delay: 0.48 }}
          className="wheel-cta-button group"
          aria-label="See more of Taha Khilji's design work on Google Drive"
        >
          <span>Show More Work</span>
          <ArrowUpRight className="w-[16px] h-[16px] rotate-0 transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" />
        </motion.a>
      </section>

      {/* Modal via portal */}
      {createPortal(
        <AnimatePresence mode="wait">
          {activeProject && (
            <CaseStudyModal
              key={activeProject.id}
              project={activeProject}
              allProjects={baseProjects.length > 0 ? baseProjects : PROJECTS}
              originRect={originRect}
              onClose={handleClose}
              onSelectProject={(p) => setActiveProject(p)}
              onContactClick={handleContactScroll}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
