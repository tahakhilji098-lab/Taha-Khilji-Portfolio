import React, { useEffect } from 'react';
import { Project } from '../types';
import { X, ChevronLeft, ChevronRight, User, Calendar, Tag, CheckCircle2, ArrowUpRight, Target, Lightbulb } from 'lucide-react';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

interface ProjectModalProps {
  project: Project | null;
  allProjects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onContactClick: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  allProjects,
  onClose,
  onSelectProject,
}) => {
  if (!project) return null;

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length];
  const nextProject = allProjects[(currentIndex + 1) % allProjects.length];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onSelectProject(prevProject);
      } else if (e.key === 'ArrowRight') {
        onSelectProject(nextProject);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, allProjects, onClose, onSelectProject, prevProject, nextProject]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#050816]/95 backdrop-blur-xl transition-all duration-300 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div
        className="relative w-full max-w-6xl min-h-screen sm:min-h-0 sm:my-8 bg-[#080E21] border border-slate-800/80 sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden text-left flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Header Navigation Bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#080E21]/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-[#267DFF]/20 border border-[#267DFF]/40 text-[#5BB8FF] text-xs font-mono font-medium uppercase tracking-wider">
              {project.category}
            </span>
            <span className="text-xs text-[#9EA8BD] font-mono hidden sm:inline">
              {currentIndex + 1} of {allProjects.length}
            </span>
          </div>

          {/* Quick Prev / Next & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectProject(prevProject)}
              className="p-2.5 rounded-full bg-[#050816] border border-slate-800 text-[#9EA8BD] hover:text-[#F7F9FF] hover:border-[#267DFF]/50 transition-colors cursor-pointer"
              aria-label="Previous project"
              title="Previous project (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectProject(nextProject)}
              className="p-2.5 rounded-full bg-[#050816] border border-slate-800 text-[#9EA8BD] hover:text-[#F7F9FF] hover:border-[#267DFF]/50 transition-colors cursor-pointer"
              aria-label="Next project"
              title="Next project (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1" />

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#050816] border border-slate-800 text-[#9EA8BD] hover:text-[#F7F9FF] hover:border-rose-500/50 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-1.5 px-3"
              aria-label="Close project modal"
            >
              <span className="text-xs font-mono hidden sm:inline">Close</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="p-6 sm:p-10 lg:p-12 space-y-12 overflow-y-auto max-h-[calc(92vh-80px)]">
          
          {/* Main Title & Editorial Headline */}
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center gap-3 text-xs font-mono text-[#5BB8FF] uppercase tracking-widest">
              <span>Client: {project.client}</span>
              <span>•</span>
              <span>Year: {project.year}</span>
            </div>
            
            <h2 id="modal-project-title" className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#F7F9FF] tracking-tight leading-[1.08]">
              {project.title}
            </h2>
            <p className="text-lg sm:text-xl text-[#9EA8BD] font-light leading-relaxed">
              {project.subtitle}
            </p>
          </div>

          {/* Quick Specifications Metadata Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#050816] border border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#5BB8FF]">
                <User className="w-3.5 h-3.5" />
                <span>Client</span>
              </div>
              <div className="text-sm font-semibold text-[#F7F9FF]">{project.client}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#5BB8FF]">
                <Tag className="w-3.5 h-3.5" />
                <span>Category</span>
              </div>
              <div className="text-sm font-semibold text-[#F7F9FF]">{project.category}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#5BB8FF]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Year</span>
              </div>
              <div className="text-sm font-semibold text-[#F7F9FF]">{project.year}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#5BB8FF]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>
              <div className="text-sm font-semibold text-emerald-400">Completed & Delivered</div>
            </div>
          </div>

          {/* Featured Hero Cover Image */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-slate-800 bg-[#050816] shadow-2xl">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080E21]/60 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Objective & Design Approach (Side by Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.challenge && (
              <div className="p-6 rounded-2xl bg-[#050816] border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#5BB8FF] font-semibold">
                  <Target className="w-4 h-4 text-[#267DFF]" />
                  <span>The Objective & Challenge</span>
                </div>
                <p className="text-sm sm:text-base text-[#9EA8BD] leading-relaxed font-light">
                  {project.challenge}
                </p>
              </div>
            )}

            {project.solution && (
              <div className="p-6 rounded-2xl bg-[#050816] border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#5BB8FF] font-semibold">
                  <Lightbulb className="w-4 h-4 text-[#267DFF]" />
                  <span>Design Strategy & Solution</span>
                </div>
                <p className="text-sm sm:text-base text-[#9EA8BD] leading-relaxed font-light">
                  {project.solution}
                </p>
              </div>
            )}
          </div>

          {/* Key Deliverables Chips */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-[#5BB8FF] tracking-widest font-semibold">
              KEY DELIVERABLES & OUTPUTS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {project.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[#050816] border border-slate-800/80 text-xs text-[#F7F9FF] font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#267DFF] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large Showcase Gallery Images */}
          {project.galleryImages && project.galleryImages.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-[#5BB8FF] tracking-widest font-semibold">
                  VISUAL SHOWCASE ({project.galleryImages.length} ARTIFACTS)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.galleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl overflow-hidden border border-slate-800 bg-[#050816] shadow-xl group ${
                      i === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${project.title} detail ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Project Navigation Footer */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Prev Project Button */}
            <button
              onClick={() => onSelectProject(prevProject)}
              className="group flex items-center gap-3 text-left w-full md:w-auto p-4 rounded-xl bg-[#050816] border border-slate-800/80 hover:border-[#267DFF]/50 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#080E21] border border-slate-800 flex items-center justify-center text-[#9EA8BD] group-hover:text-[#5BB8FF] shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#9EA8BD] uppercase">Previous Project</div>
                <div className="text-sm font-semibold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors">
                  {prevProject.title}
                </div>
              </div>
            </button>

            {/* Request Similar Project CTA */}
            <a
              href={GMAIL_COMPOSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl bg-[#267DFF] text-white hover:bg-[#5BB8FF] hover:text-[#050816] transition-all duration-300 shadow-[0_0_20px_rgba(38,125,255,0.4)] cursor-pointer w-full md:w-auto"
              aria-label="Start a project like this with Taha Khilji using Gmail"
            >
              <span>Start a Project Like This</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>

            {/* Next Project Button */}
            <button
              onClick={() => onSelectProject(nextProject)}
              className="group flex items-center justify-end gap-3 text-right w-full md:w-auto p-4 rounded-xl bg-[#050816] border border-slate-800/80 hover:border-[#267DFF]/50 transition-all cursor-pointer"
            >
              <div>
                <div className="text-[10px] font-mono text-[#9EA8BD] uppercase">Next Project</div>
                <div className="text-sm font-semibold text-[#F7F9FF] group-hover:text-[#5BB8FF] transition-colors">
                  {nextProject.title}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#080E21] border border-slate-800 flex items-center justify-center text-[#9EA8BD] group-hover:text-[#5BB8FF] shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
