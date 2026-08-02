import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Project } from '../types';
import { X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

/* ─── Props ─── */

interface CaseStudyModalProps {
  project: Project | null;
  allProjects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onContactClick: () => void;
}

/* ─── Sub-components ─── */

const MetadataItem: React.FC<{
  label: string;
  value?: string;
  values?: string[];
}> = ({ label, value, values }) => (
  <div>
    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#5BB8FF] font-semibold">
      {label}
    </span>
    {values ? (
      <ul className="mt-2 space-y-1">
        {values.map((v, i) => (
          <li key={i} className="text-sm text-[#F7F9FF]">
            {v}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm font-medium text-[#F7F9FF] mt-2">{value}</p>
    )}
  </div>
);

const DetailSection: React.FC<{ title: string; content: string }> = ({
  title,
  content,
}) => (
  <div className="pt-8 grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-4 lg:gap-10">
    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#5BB8FF] font-semibold pt-1">
      {title}
    </span>
    <p className="text-sm lg:text-base text-[#8A95B0] leading-relaxed">
      {content}
    </p>
  </div>
);

/* ─── Main Modal ─── */

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  allProjects,
  onClose,
  onSelectProject,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  if (!project) return null;

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length];
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];

  /* ─── Body Scroll Lock ─── */
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalPadding = document.body.style.paddingRight;
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, []);

  /* ─── Focus management on mount ─── */
  useEffect(() => {
    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });
  }, []);

  /* ─── Close & restore focus ─── */
  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
    });
  }, [onClose]);

  /* ─── Keyboard handler (Escape + focus trap) ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  /* ─── Backdrop click ─── */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /* ─── Transition easing ─── */
  const ease = [0.22, 1, 0.36, 1];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-7 md:py-5"
      data-lenis-prevent
      style={{
        background: 'rgba(1, 5, 16, 0.76)',
        backdropFilter: 'blur(14px) saturate(0.8)',
        WebkitBackdropFilter: 'blur(14px) saturate(0.8)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
    >
      {/* Modal Window */}
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        layout
        className="relative w-[min(1320px,calc(100vw-64px))] max-h-[calc(100dvh-56px)] rounded-3xl overflow-hidden bg-[#0A142A]/99 border border-[rgba(94,154,255,0.24)] shadow-[0_45px_120px_rgba(0,0,0,0.65),0_0_70px_rgba(24,105,255,0.08)] inset-shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:rounded-3xl sm:rounded-xl motion-reduce:transition-none"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.97, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 30 }}
        transition={{ duration: 0.48, ease, delay: 0.06 }}
      >
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(100dvh-56px)]" data-lenis-prevent style={{ scrollbarWidth: 'thin', scrollbarColor: '#1A233D transparent' }}>
          {/* ─── Hero Image ─── */}
          <div className="relative w-full h-[clamp(320px,48vh,600px)] overflow-hidden">
            <motion.div
              layoutId={project.id}
              className="absolute inset-0"
              transition={{ duration: 0.6, ease }}
            >
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Bottom gradient blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A142A] pointer-events-none" />

            {/* Close button top-left with gradient protection */}
            <div className="absolute top-0 left-0 z-30 p-4 md:p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-[#050A18]/70 via-[#050A18]/30 to-transparent pointer-events-none rounded-br-3xl" />
              <button
                onClick={handleClose}
                className="group relative z-10 w-[44px] h-[44px] md:w-[46px] md:h-[46px] rounded-full bg-[#0A1228]/70 backdrop-blur-md border border-[rgba(94,154,255,0.2)] flex items-center justify-center
                  hover:bg-[#267DFF] hover:border-[#267DFF] hover:scale-[1.06] hover:shadow-[0_0_20px_rgba(38,125,255,0.3)]
                  active:scale-[0.94]
                  transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#267DFF]"
                aria-label="Close project details"
              >
                <X className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-[#9EA8BD] group-hover:text-white group-hover:rotate-90 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </button>
            </div>
          </div>

          {/* ─── Content Area ─── */}
          <div className="px-6 md:px-10 lg:px-14 pb-8 md:pb-10 lg:pb-14 pt-8 md:pt-10 lg:pt-12 space-y-10 md:space-y-12">
            {/* Intro: Two-column layout */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.5, ease, delay: 0.18 }}
            >
              {/* Left column */}
              <div className="space-y-5 max-w-[620px]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#5BB8FF] font-semibold block">
                    {project.category}
                  </span>
                  <h2
                    id="case-study-title"
                    className="text-[clamp(36px,4.8vw,72px)] font-serif text-[#F7F9FF] leading-[0.95] tracking-tight mt-3"
                  >
                    {project.title}
                  </h2>
                </div>
                <p className="text-base lg:text-lg text-[#8A95B0] leading-[1.7] font-light">
                  {project.subtitle}
                </p>
                {project.services && project.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.services.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#5BB8FF] bg-[#267DFF]/10 border border-[#267DFF]/20 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <MetadataItem label="Year" value={project.year} />
                {project.role && <MetadataItem label="Role" value={project.role} />}
                <MetadataItem label="Deliverables" values={project.deliverables} />
              </div>
            </motion.div>

            {/* ─── Detail Sections ─── */}
            <motion.div
              className="space-y-0 divide-y divide-[rgba(130,160,220,0.12)]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.5, ease, delay: 0.26 }}
            >
              {project.challenge && (
                <DetailSection title="The Challenge" content={project.challenge} />
              )}
              {project.solution && (
                <DetailSection title="The Approach" content={project.solution} />
              )}
              {project.outcome && (
                <DetailSection title="The Outcome" content={project.outcome} />
              )}
            </motion.div>

            {/* ─── Footer Navigation ─── */}
            <motion.div
              className="pt-6 border-t border-[rgba(130,160,220,0.12)] flex flex-col md:flex-row items-center justify-between gap-5"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.5, ease, delay: 0.34 }}
            >
              {/* Previous */}
              <button
                onClick={() => onSelectProject(prevProject)}
                className="group flex items-center gap-3 text-left w-full md:w-auto p-3.5 rounded-xl bg-[#050816] border border-[rgba(130,160,220,0.1)] hover:border-[#267DFF]/40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#267DFF]"
                aria-label={`Previous project: ${prevProject.title}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#0A1228] border border-[rgba(130,160,220,0.1)] flex items-center justify-center text-[#9EA8BD] group-hover:text-[#5BB8FF] shrink-0 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-[#7B87A3] uppercase tracking-wider">Previous</div>
                  <div className="text-sm font-semibold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors truncate">
                    {prevProject.title}
                  </div>
                </div>
              </button>

              {/* CTA */}
              <a
                href={GMAIL_COMPOSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl bg-[#267DFF] text-white hover:bg-[#5BB8FF] hover:text-[#050816] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_0_20px_rgba(38,125,255,0.4)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#267DFF] w-full md:w-auto"
                aria-label="Start a project like this with Taha Khilji using Gmail"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>

              {/* Next */}
              <button
                onClick={() => onSelectProject(nextProject)}
                className="group flex items-center justify-end gap-3 text-right w-full md:w-auto p-3.5 rounded-xl bg-[#050816] border border-[rgba(130,160,220,0.1)] hover:border-[#267DFF]/40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#267DFF]"
                aria-label={`Next project: ${nextProject.title}`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-[#7B87A3] uppercase tracking-wider">Next</div>
                  <div className="text-sm font-semibold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors truncate">
                    {nextProject.title}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#0A1228] border border-[rgba(130,160,220,0.1)] flex items-center justify-center text-[#9EA8BD] group-hover:text-[#5BB8FF] shrink-0 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
