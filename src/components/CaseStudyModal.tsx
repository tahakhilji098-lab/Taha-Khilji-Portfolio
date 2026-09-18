import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Project } from '../types';
import { X, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

/* ─── Props ─── */

interface CaseStudyModalProps {
  project: Project | null;
  allProjects: Project[];
  originRect: DOMRect | null;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onContactClick: () => void;
}

/* ─── Easing ─── */
const ease = [0.16, 1, 0.3, 1];
const easeContent = [0.22, 1, 0.36, 1];

/* ─── Main Modal ─── */

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  project,
  allProjects,
  originRect,
  onClose,
  onSelectProject,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  if (!project) return null;

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length];
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];

  /* ─── Compute FLIP transform from origin rect ─── */
  const getInitialTransform = () => {
    if (!originRect) return { opacity: 0, y: 20, scale: 0.92 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalW = Math.min(1100, vw - 48);
    const modalH = vh - 56;
    const targetX = (vw - modalW) / 2;
    const targetY = (vh - modalH) / 2;
    const scaleX = originRect.width / modalW;
    const scaleY = originRect.height / modalH;
    const translateX = originRect.left + originRect.width / 2 - (targetX + modalW / 2);
    const translateY = originRect.top + originRect.height / 2 - (targetY + modalH / 2);
    return {
      opacity: 0,
      x: translateX,
      y: translateY,
      scale: Math.min(scaleX, scaleY),
    };
  };

  const getExitTransform = () => {
    if (!originRect) return { opacity: 0, y: 20, scale: 0.92 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalW = Math.min(1100, vw - 48);
    const modalH = vh - 56;
    const targetX = (vw - modalW) / 2;
    const targetY = (vh - modalH) / 2;
    const scaleX = originRect.width / modalW;
    const scaleY = originRect.height / modalH;
    const translateX = originRect.left + originRect.width / 2 - (targetX + modalW / 2);
    const translateY = originRect.top + originRect.height / 2 - (targetY + modalH / 2);
    return {
      opacity: 0,
      x: translateX,
      y: translateY,
      scale: Math.min(scaleX, scaleY),
    };
  };

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

  /* ─── Focus management ─── */
  useEffect(() => {
    requestAnimationFrame(() => modalRef.current?.focus());
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    requestAnimationFrame(() => previousFocusRef.current?.focus());
  }, [onClose]);

  /* ─── Keyboard: Escape + arrows + focus trap ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if (e.key === 'ArrowLeft') { onSelectProject(prevProject); return; }
      if (e.key === 'ArrowRight') { onSelectProject(nextProject); return; }
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, onSelectProject, prevProject, nextProject]);

  /* ─── Backdrop click ─── */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  /* ─── Hero parallax on mouse move ─── */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 5;
    setMousePos({ x, y });
  };

  /* ─── Stagger delays ─── */
  const stagger = (i: number) => ({ transition: { delay: 0.35 + i * 0.07 } });

  return (
    <motion.div
      className="case-study-backdrop"
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: easeContent }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
    >
      {/* Modal Window */}
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="case-study-window"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0, y: 20, scale: 0.92 } : getInitialTransform()}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0, y: 20, scale: 0.92 } : getExitTransform()}
        transition={{ duration: 0.5, ease }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="case-study-close"
          aria-label="Close project details"
        >
          <X aria-hidden="true" />
        </button>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="case-study-scroll" data-lenis-prevent>
          {/* ─── Hero Image ─── */}
          <div
            ref={heroRef}
            className="case-study-hero"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
          >
            <motion.div
              className="case-study-hero-img"
              animate={reduce ? {} : {
                x: mousePos.x,
                y: mousePos.y,
                scale: 1.05,
              }}
              transition={{ scale: { duration: 20, ease: 'linear' }, x: { duration: 0.3 }, y: { duration: 0.3 } }}
            >
              <img
                src={project.thumbnail}
                alt={project.title}
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="case-study-hero-gradient" />
          </div>

          {/* ─── Content Area ─── */}
          <div className="case-study-content">
            {/* Intro: Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-14">
              {/* Left column */}
              <div className="space-y-5">
                <motion.div {...stagger(0)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: easeContent, delay: 0.35 }}>
                  <span className="case-study-eyebrow">
                    <span className="case-study-eyebrow-dot" />
                    {project.category}
                  </span>
                </motion.div>
                <motion.h2
                  id="case-study-title"
                  className="case-study-title"
                  {...stagger(1)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: easeContent, delay: 0.42 }}
                >
                  {project.title}
                </motion.h2>
                <motion.p
                  className="case-study-desc"
                  {...stagger(2)}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: easeContent, delay: 0.49 }}
                >
                  {project.subtitle}
                </motion.p>
                {project.services && project.services.length > 0 && (
                  <motion.div
                    className="flex flex-wrap gap-2 pt-1"
                    {...stagger(3)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: easeContent, delay: 0.56 }}
                  >
                    {project.services.map((s, i) => (
                      <span key={i} className="case-study-tag">{s}</span>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Right column — meta with corner brackets */}
              <motion.div
                className="space-y-6"
                {...stagger(4)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeContent, delay: 0.63 }}
              >
                <div className="case-study-meta-group">
                  <div className="case-study-meta-bracket" />
                  <span className="case-study-meta-label">Year</span>
                  <p className="case-study-meta-value">{project.year}</p>
                </div>
                {project.role && (
                  <div className="case-study-meta-group">
                    <div className="case-study-meta-bracket" />
                    <span className="case-study-meta-label">Role</span>
                    <p className="case-study-meta-value">{project.role}</p>
                  </div>
                )}
                {project.deliverables && (
                  <div className="case-study-meta-group">
                    <div className="case-study-meta-bracket" />
                    <span className="case-study-meta-label">Deliverables</span>
                    <ul className="mt-2 space-y-1">
                      {project.deliverables.map((v, i) => (
                        <li key={i} className="case-study-meta-value">{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </div>

            {/* ─── Detail Sections ─── */}
            <motion.div
              className="space-y-0"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeContent, delay: 0.7 }}
            >
              {project.challenge && (
                <div className="case-study-detail-row">
                  <div className="case-study-detail-label">
                    <div className="case-study-detail-accent" />
                    <span>The Challenge</span>
                  </div>
                  <p className="case-study-detail-text">{project.challenge}</p>
                </div>
              )}
              {project.solution && (
                <div className="case-study-detail-row">
                  <div className="case-study-detail-label">
                    <div className="case-study-detail-accent" />
                    <span>The Approach</span>
                  </div>
                  <p className="case-study-detail-text">{project.solution}</p>
                </div>
              )}
              {project.outcome && (
                <div className="case-study-detail-row">
                  <div className="case-study-detail-label">
                    <div className="case-study-detail-accent" />
                    <span>The Outcome</span>
                  </div>
                  <p className="case-study-detail-text">{project.outcome}</p>
                </div>
              )}
            </motion.div>

            {/* ─── Footer Navigation ─── */}
            <motion.div
              className="case-study-footer"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeContent, delay: 0.78 }}
            >
              {/* Previous */}
              <button
                onClick={() => onSelectProject(prevProject)}
                className="case-study-nav-btn group"
                aria-label={`Previous project: ${prevProject.title}`}
              >
                <div className="case-study-nav-thumb">
                  <img src={prevProject.thumbnail} alt="" referrerPolicy="no-referrer" />
                </div>
                <ChevronLeft className="w-4 h-4 text-[#7B87A3] group-hover:text-[#5BB8FF] transition-colors shrink-0" />
                <div className="min-w-0">
                  <div className="case-study-nav-label">Previous</div>
                  <div className="case-study-nav-title">{prevProject.title}</div>
                </div>
              </button>

              {/* CTA */}
              <a
                href={GMAIL_COMPOSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="case-study-cta group"
                aria-label="Start a project like this with Taha Khilji using Gmail"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" aria-hidden="true" />
              </a>

              {/* Next */}
              <button
                onClick={() => onSelectProject(nextProject)}
                className="case-study-nav-btn case-study-nav-btn--right group"
                aria-label={`Next project: ${nextProject.title}`}
              >
                <div className="min-w-0 text-right">
                  <div className="case-study-nav-label">Next</div>
                  <div className="case-study-nav-title">{nextProject.title}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#7B87A3] group-hover:text-[#5BB8FF] transition-colors shrink-0" />
                <div className="case-study-nav-thumb">
                  <img src={nextProject.thumbnail} alt="" referrerPolicy="no-referrer" />
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
