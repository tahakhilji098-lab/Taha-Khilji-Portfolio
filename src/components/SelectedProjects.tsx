import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, LayoutGroup, AnimatePresence, useReducedMotion, type MotionValue } from 'motion/react';
import { PROJECTS } from '../data/portfolioData';
import { Project } from '../types';
import { CaseStudyModal } from './CaseStudyModal';
import { ArrowUpRight } from 'lucide-react';
import { premiumEase, StaggerGroup, useScrollDrift } from '../motion/primitives';

const WORK_PROJECTS = PROJECTS.slice(0, 6);

const ROW1_CONFIG = [
  { span: 'md:col-span-6', height: 'md:h-[420px] lg:h-[480px]' },
  { span: 'md:col-span-3', height: 'md:h-[420px] lg:h-[480px]' },
  { span: 'md:col-span-3', height: 'md:h-[420px] lg:h-[480px]' },
];

const ROW2_CONFIG = [
  { span: 'md:col-span-3', height: 'md:h-[360px] lg:h-[420px]' },
  { span: 'md:col-span-5', height: 'md:h-[360px] lg:h-[420px]' },
  { span: 'md:col-span-4', height: 'md:h-[360px] lg:h-[420px]' },
];

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
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();


  const handleContactScroll = () => {
    const el = document.querySelector('#contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = () => setActiveProject(null);

  return (
    <LayoutGroup>
      <section
        id="projects"
        ref={sectionRef}
        className="section-padding bg-[#050A18] relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-overlay-subtle opacity-15 pointer-events-none" />

        <div className="container-wide relative z-10">
          {/* Section Header */}
          <div className="text-left mb-14 space-y-4 max-w-3xl">
            {/* Label: fade and rise 10px */}
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.72, ease: premiumEase }}
              className="text-xs font-mono uppercase tracking-[0.25em] text-[#267DFF] font-semibold block"
            >
              SELECTED WORK
            </motion.span>
            {/* Heading: reveal by line */}
            <h2 className="text-[clamp(2.5rem,11.5vw,3.375rem)] md:text-[clamp(2.5rem,4.5vw,4.5rem)] font-serif text-[#F7F9FF] tracking-tight leading-[1.08] flex flex-col items-start gap-1">
              <span className="block overflow-hidden pb-1 -mb-1">
                <motion.span
                  className="block"
                  initial={reduce ? false : { y: '110%' }}
                  whileInView={reduce ? undefined : { y: '0%' }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: premiumEase, delay: 0.1 }}
                >
                  Projects Built to
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
                  Be Remembered<motion.span
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={reduce ? undefined : { opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.72, ease: premiumEase, delay: 0.3 }}
                    className="text-[#267DFF]"
                  >.</motion.span>
                </motion.span>
              </span>
            </h2>
          </div>

          {/* Grid — stagger cards by row */}
          <StaggerGroup className="selected-work-grid grid grid-cols-1 md:grid-cols-12 gap-5" stagger={0.08}>
            {/* Row 1 */}
            {ROW1_CONFIG.map((cfg, i) => {
              const project = WORK_PROJECTS[i];
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  categoryLabel={getCategoryLabel(project.category)}
                  onClick={() => setActiveProject(project)}
                  className={`${cfg.span} ${cfg.height}`}
                  isActive={activeProject?.id === project.id}
                  hasActiveProject={activeProject !== null}
                />
              );
            })}

            {/* Row 2 */}
            {ROW2_CONFIG.map((cfg, i) => {
              const project = WORK_PROJECTS[i + 3];
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  categoryLabel={getCategoryLabel(project.category)}
                  onClick={() => setActiveProject(project)}
                  className={`${cfg.span} ${cfg.height}`}
                  isActive={activeProject?.id === project.id}
                  hasActiveProject={activeProject !== null}
                />
              );
            })}
          </StaggerGroup>

          {/* See More Work — external portfolio CTA */}
          <motion.div
            className="selected-work-more"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.72, ease: premiumEase, delay: 0.48 }}
          >
            <a
              href="https://drive.google.com/drive/folders/1BjNV8x6qOQIVXccNQMAGz7FATa4tPceF?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer external"
              className="selected-work-more__link"
              aria-label="See more of Taha Khilji's design work on Google Drive"
            >
              <span>See More Work</span>
              <span className="selected-work-more__arrow" aria-hidden="true">
                <ArrowUpRight className="w-[18px] h-[18px]" />
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Modal via portal */}
      {createPortal(
        <AnimatePresence mode="wait">
          {activeProject && (
            <CaseStudyModal
              key={activeProject.id}
              project={activeProject}
              allProjects={PROJECTS}
              onClose={handleClose}
              onSelectProject={(p) => setActiveProject(p)}
              onContactClick={handleContactScroll}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </LayoutGroup>
  );
};

/* ─── Project Card ─── */

interface ProjectCardProps {
  project: Project;
  categoryLabel: string;
  onClick: () => void;
  className?: string;
  isActive: boolean;
  hasActiveProject: boolean;
}

const EASE = [0.22, 1, 0.36, 1] as const;

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  categoryLabel,
  onClick,
  className = '',
  isActive,
  hasActiveProject,
}) => {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const drift = useScrollDrift(cardRef, 12, reduce);

  const handleClick = () => {
    if (!hasActiveProject) {
      onClick();
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 28, scale: 0.985 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.72, ease: premiumEase } }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={reduce ? undefined : variants}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !hasActiveProject) {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={hasActiveProject ? -1 : 0}
      aria-label={`View project: ${project.title}`}
      whileTap={hasActiveProject ? undefined : { scale: 0.985 }}
      className={`group cursor-pointer rounded-2xl bg-[#0A1228] border border-white/[0.06] overflow-hidden hover:border-[#267DFF]/40 hover:shadow-[0_12px_40px_rgba(38,125,255,0.15)] transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col text-left h-full motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#267DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050A18] ${className}`}
    >
      {/* Lift layer — outer element keeps motion transforms, this handles hover */}
      <div className="project-card-lift flex flex-col h-full">
      {/* Image fills remaining space */}
      <div className="relative flex-1 min-h-0 overflow-hidden bg-[#050A18] rounded-t-2xl">
        {isActive ? (
          <div className="absolute inset-0 bg-[#050A18]" />
        ) : (
          <motion.div
            layoutId={project.id}
            className="absolute inset-0"
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.div
              className="absolute inset-x-0 -inset-y-[14px]"
              {...drift}
              data-motion-layer
            >
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-[1.035] transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1228] via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-300" />
          </motion.div>
        )}
      </div>

      {/* Footer – ~78px */}
      <div className="px-5 py-4 flex items-center justify-between gap-3 bg-[#0A1228]">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] truncate motion-reduce:group-hover:text-[#F7F9FF]">
            {project.title}
          </h3>
          <div className="text-[11px] font-mono text-[#7B87A3] uppercase tracking-wider mt-0.5">
            {categoryLabel}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-mono text-[#7B87A3]">{project.year}</span>
          <div className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center text-[#7B87A3] group-hover:bg-[#267DFF] group-hover:border-[#267DFF] group-hover:text-white transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:group-hover:bg-transparent motion-reduce:group-hover:border-white/[0.08] motion-reduce:group-hover:text-[#7B87A3]">
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:-translate-y-0" />
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
};
