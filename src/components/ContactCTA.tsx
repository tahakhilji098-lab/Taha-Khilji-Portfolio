import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Mail, Copy, Check, ArrowUpRight, Send, Loader2, Clock, MessageCircle } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { Footer } from './Footer';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';
import { getSupabase } from '../lib/supabase';

/* ── Brand icons ─────────────────────────────────────────── */

const WhatsAppBrandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const InstagramBrandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const LinkedInBrandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/* ── Hooks ───────────────────────────────────────────────── */

function useLocalTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (rm.matches || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          setInView(true);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView } as const;
}

/* ── Dot grid canvas ────────────────────────────────────── */

function DotGrid({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const raf = useRef<number>(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0;
    const spacing = 32;
    const glowRadius = 100;
    const dots: { x: number; y: number; baseAlpha: number }[] = [];

    const resize = () => {
      const rect = section.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w;
      canvas.height = h;
      dots.length = 0;
      for (let x = spacing / 2; x < w; x += spacing) {
        for (let y = spacing / 2; y < h; y += spacing) {
          dots.push({ x, y, baseAlpha: 0.06 + Math.random() * 0.04 });
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };

    const onLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      for (const d of dots) {
        const dx = d.x - mx;
        const dy = d.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / glowRadius);
        const alpha = d.baseAlpha + influence * 0.55;
        const radius = 1 + influence * 1.8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(111, 157, 224, ${alpha})`;
        ctx.fill();
      }
      raf.current = requestAnimationFrame(draw);
    };

    resize();
    section.addEventListener('mousemove', onMove, { passive: true });
    section.addEventListener('mouseleave', onLeave);
    const ro = new ResizeObserver(resize);
    ro.observe(section);
    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      ro.disconnect();
    };
  }, [reduce, sectionRef]);

  if (reduce) return null;
  return <canvas ref={canvasRef} className="c2-dot-canvas" aria-hidden="true" />;
}

/* ── SVG line traces ────────────────────────────────────── */

function LineTraces({ drawn }: { drawn: boolean }) {
  return (
    <div className="c2-line-traces" aria-hidden="true">
      <svg viewBox="0 0 1120 800" preserveAspectRatio="none">
        <path
          className={`c2-trace-line ${drawn ? 'c2-trace-drawn' : ''}`}
          d="M0,200 C200,200 180,500 400,500 S600,150 800,150 S1000,450 1120,450"
          style={{ '--c2-trace-len': 1600 } as React.CSSProperties}
        />
        <path
          className={`c2-trace-line ${drawn ? 'c2-trace-drawn' : ''}`}
          d="M0,600 C250,600 200,300 500,350 S750,650 1000,600 S1120,300 1120,300"
          style={{ '--c2-trace-len': 1400, transitionDelay: '0.4s' } as React.CSSProperties}
        />
      </svg>
    </div>
  );
}

/* ── Magnetic button wrapper ─────────────────────────────── */

function MagneticWrap({
  children,
  disabled,
  reduce,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduce || disabled) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const strength = 1 - dist / 80;
        el.style.transform = `translate(${dx * strength * 0.35}px, ${dy * strength * 0.35}px)`;
      } else {
        el.style.transform = '';
      }
    },
    [reduce, disabled]
  );

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = '';
  }, []);

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transition: 'transform 0.2s cubic-bezier(0.22,1,0.36,1)' }}>
      {children}
    </div>
  );
}

/* ── 3D card tilt + spotlight ────────────────────────────── */

function useCardTilt(reduce: boolean) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const rafId = useRef<number>(0);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduce) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty('--c2-card-mx', `${x * 100}%`);
      el.style.setProperty('--c2-card-my', `${y * 100}%`);
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const rotX = (y - 0.5) * -12;
        const rotY = (x - 0.5) * 12;
        el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.01,1.01,1.01)`;
      });
    },
    [reduce]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafId.current);
    el.style.transform = '';
    el.style.setProperty('--c2-card-mx', '50%');
    el.style.setProperty('--c2-card-my', '50%');
  }, []);

  return { ref, onMove, onLeave };
}

/* ── Ripple effect ───────────────────────────────────────── */

function useRipple() {
  const spawn = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'c2-ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  }, []);
  return spawn;
}

/* ── Particle burst ──────────────────────────────────────── */

function spawnParticles(btn: HTMLButtonElement) {
  const rect = btn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'c2-particle';
    const angle = (i / 12) * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const colors = ['#579DFF', '#2dd4a7', '#9747FF', '#fff'];
    p.style.background = colors[i % colors.length];
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    p.style.setProperty('animation', `c2ParticleFly 0.7s cubic-bezier(0.22,1,0.36,1) forwards`);
    p.style.position = 'fixed';
    p.style.zIndex = '9999';
    document.body.appendChild(p);
    // Set end position via CSS custom property trick — inline the end transform
    requestAnimationFrame(() => {
      p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 750);
  }
}

/* ── Rotating placeholder ────────────────────────────────── */

const MESSAGE_PLACEHOLDERS = [
  'Tell me about your rebrand…',
  'Describe your product launch timeline…',
  "What\u2019s the scope of your project?",
  'Share your brand vision…',
];

function RotatingPlaceholder({ show }: { show: boolean }) {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % MESSAGE_PLACEHOLDERS.length);
        setFading(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <span className={`c2-rotating-placeholder ${fading ? 'is-hidden' : ''}`}>
      {MESSAGE_PLACEHOLDERS[idx]}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────── */

export const ContactCTA: React.FC = () => {
  const { ref: sectionRef, inView: sectionVisible } = useInView(0.1);
  const { ref: headRef, inView: headVisible } = useInView(0.3);
  const copyTimerRef = useRef<number | null>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [entered, setEntered] = useState(false);
  const [msgFocused, setMsgFocused] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const formMountTime = useRef(Date.now());

  const reduce = useReducedMotion();
  const localTime = useLocalTime();
  const spawnRipple = useRipple();

  // Section entered for animations
  useEffect(() => {
    if (sectionVisible) setEntered(true);
  }, [sectionVisible]);

  useEffect(
    () => () => { if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current); },
    []
  );

  const copyEmailToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText('tahakhilji83@gmail.com');
    setCopiedEmail(true);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedEmail(false), 1500);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setFormError('All fields are required.');
      setFormStatus('error');
      return;
    }

    // ── Input length validation (defense in depth) ──
    if (formName.trim().length > 100) {
      setFormError('Name must be 100 characters or fewer.');
      setFormStatus('error');
      return;
    }
    if (formEmail.trim().length > 200) {
      setFormError('Email must be 200 characters or fewer.');
      setFormStatus('error');
      return;
    }
    if (formMessage.trim().length > 5000) {
      setFormError('Message must be 5,000 characters or fewer.');
      setFormStatus('error');
      return;
    }

    // ── Email format validation ──
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(formEmail.trim())) {
      setFormError('Please enter a valid email address.');
      setFormStatus('error');
      return;
    }

    // ── Spam protection layer 1: honeypot ──
    if (formWebsite) {
      // Bot filled the hidden field — silently "succeed" without inserting
      setFormStatus('sent');
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      setFormWebsite('');
      return;
    }

    // ── Spam protection layer 2: too-fast submit (< 3 seconds) ──
    const elapsed = Date.now() - formMountTime.current;
    if (elapsed < 3000) {
      setFormStatus('sent');
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      return;
    }

    // ── Spam protection layer 3: rate limit (max 3 per 10 minutes) ──
    try {
      const KEY = 'c2_spam_ts';
      const WINDOW = 10 * 60 * 1000; // 10 minutes
      const MAX_SUBS = 3;
      const raw = localStorage.getItem(KEY);
      const timestamps: number[] = raw ? JSON.parse(raw) : [];
      const now = Date.now();
      const recent = timestamps.filter((t) => now - t < WINDOW);
      if (recent.length >= MAX_SUBS) {
        setFormStatus('sent');
        setFormName('');
        setFormEmail('');
        setFormMessage('');
        return;
      }
      recent.push(now);
      localStorage.setItem(KEY, JSON.stringify(recent));
    } catch {
      // localStorage unavailable — skip rate limiting
    }

    setFormStatus('sending');
    setFormError('');
    try {
      const sb = getSupabase();
      const { error } = await sb.from('contact_submissions').insert({
        name: formName.trim(),
        email: formEmail.trim(),
        message: formMessage.trim(),
        read: false,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setFormStatus('sent');
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      if (submitBtnRef.current && !reduce) spawnParticles(submitBtnRef.current);
    } catch (err: any) {
      setFormStatus('error');
      setFormError(err?.message || 'Failed to send message. Please try again.');
    }
  };

  /* Card tilt hooks */
  const waCard = useCardTilt(reduce);
  const emailCard = useCardTilt(reduce);
  const igCard = useCardTilt(reduce);
  const liCard = useCardTilt(reduce);

  /* Heading words */
  const headingWords = useMemo(() => {
    const text = "Let's create something remarkable.";
    const words = text.split(' ');
    return words.map((w, i) => ({
      text: w === 'remarkable.' ? 'remarkable.' : w,
      isAccent: w.startsWith('remarkable'),
      delay: i * 0.06,
    }));
  }, []);

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section
      id="contact"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`c2 ${entered ? 'c2-entered' : ''}`}
    >
      {/* ── Background ── */}
      <div className="c2-bg" aria-hidden="true">
        <div className="c2-mesh-orb c2-mesh-orb-1" />
        <div className="c2-mesh-orb c2-mesh-orb-2" />
        <div className="c2-mesh-orb c2-mesh-orb-3" />
        <DotGrid sectionRef={sectionRef} />
        <LineTraces drawn={entered} />
        <div className="c2-grid-texture" />
        <div className="c2-noise" />
      </div>

      <div className="c2-wrap">

        {/* ── Header ── */}
        <header className="c2-head" ref={headRef as React.RefObject<HTMLElement>}>
          <motion.p className="c2-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={headVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            Get in touch
          </motion.p>

          <h2 className="c2-title">
            {headingWords.map((w, i) => (
              <span key={i} className="c2-title-word">
                <span
                  className={`c2-title-word-inner ${headVisible || entered ? 'c2-word-visible' : ''}`}
                  style={{ transitionDelay: `${0.3 + w.delay}s` }}
                >
                  {w.isAccent ? (
                    <span className="c2-title-accent">{w.text}</span>
                  ) : (
                    w.text
                  )}
                </span>
              </span>
            ))}
          </h2>

          <motion.p className="c2-subtitle"
            initial={{ opacity: 0, y: 12 }}
            animate={headVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            Tell me about your project, goals, and timeline.
          </motion.p>
        </header>

        {/* ── Status + clock row ── */}
        <motion.div className="c2-meta-row"
          initial={{ opacity: 0, y: 12 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="c2-status">
            <span className="c2-status-dot" />
            <span>Available for selected projects</span>
          </div>
          <div className="c2-clock">
            <Clock className="c2-clock-icon" />
            <span>{localTime}</span>
          </div>
        </motion.div>

        {/* ── Bento grid ── */}
        <motion.div className="c2-bento" initial="hidden" animate={entered ? 'visible' : 'hidden'} variants={stagger}>

          {/* ── LEFT: Form ── */}
          <motion.div className="c2-form-cell" variants={fadeUp}>
            <div className="c2-form-elevated">

              {/* SVG traveling glow segment (submit state only) */}
              {!reduce && formStatus === 'sending' && (
                <svg className="c2-glow-svg" aria-hidden="true">
                  <defs>
                    <linearGradient id="c2-glow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
                      <stop offset="40%" stopColor="#60a5fa" stopOpacity="1" />
                      <stop offset="60%" stopColor="#93c5fd" stopOpacity="1" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <rect className="c2-glow-rect" rx="18" ry="18" fill="none"
                    stroke="url(#c2-glow-grad)" strokeWidth="2"
                    pathLength="1" strokeDasharray="0.15 0.85" strokeDashoffset="0"
                    strokeLinecap="round" />
                </svg>
              )}

              {/* Static gradient border (always visible) */}
              <div className="c2-form-border" aria-hidden="true" />

              <div className="c2-form-glow" aria-hidden="true" />

              {/* Form header with avatar + online ring */}
              <div className="c2-form-head">
                <div className="c2-avatar-wrap">
                  <div className="c2-avatar">T</div>
                  <div className="c2-avatar-ring" />
                </div>
                <div>
                  <p className="c2-form-heading">Chat with Taha</p>
                  <p className="c2-form-subheading">I'll get back to you within 24 hours</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {formStatus === 'sent' ? (
                  <motion.div key="ok" className="c2-form-success"
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="c2-success-icon"><Check strokeWidth={2.5} /></div>
                    <p className="c2-success-title">Message sent</p>
                    <p className="c2-success-sub">Thanks for reaching out. Talk soon.</p>
                    <button type="button" className="c2-success-again" onClick={() => setFormStatus('idle')}>
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form key="form" className="c2-form" onSubmit={handleFormSubmit}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}>

                    {/* Floating label: Name */}
                    <div className="c2-fl-field">
                      <input className="c2-fl-input" value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder=" " required autoComplete="name"
                        maxLength={100} />
                      <label className="c2-fl-label">Name</label>
                    </div>

                    {/* Floating label: Email */}
                    <div className="c2-fl-field">
                      <input className="c2-fl-input" type="email" value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder=" " required autoComplete="email"
                        maxLength={200} pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" />
                      <label className="c2-fl-label">Email</label>
                    </div>

                    {/* Floating label: Message + rotating placeholder */}
                    <div className="c2-fl-field">
                      <textarea className="c2-fl-input c2-fl-textarea" value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        onFocus={() => setMsgFocused(true)}
                        onBlur={() => setMsgFocused(false)}
                        placeholder=" " rows={4} required maxLength={5000} />
                      <label className="c2-fl-label">Message</label>
                      {!msgFocused && !formMessage && (
                        <RotatingPlaceholder show={true} />
                      )}
                    </div>

                    {/* Honeypot — invisible to humans, bots auto-fill it */}
                    <div aria-hidden="true" style={{
                      position: 'absolute', left: '-9999px', top: '-9999px',
                      opacity: 0, height: 0, width: 0, overflow: 'hidden',
                      pointerEvents: 'none', tabIndex: -1,
                    }}>
                      <label htmlFor="c2-company">Company</label>
                      <input
                        id="c2-company"
                        name="company"
                        type="text"
                        value={formWebsite}
                        onChange={(e) => setFormWebsite(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <AnimatePresence>
                      {formStatus === 'error' && (
                        <motion.p className="c2-form-error" initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          {formError}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Magnetic submit */}
                    <MagneticWrap disabled={formStatus === 'sending'} reduce={!!reduce}>
                      <button ref={submitBtnRef} type="submit" disabled={formStatus === 'sending'}
                        className="c2-submit" onClick={spawnRipple}>
                        <AnimatePresence mode="wait">
                          {formStatus === 'sending' ? (
                            <motion.span key="s" className="c2-submit-inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <Loader2 className="c2-submit-spinner" /> Sending…
                            </motion.span>
                          ) : (
                            <motion.span key="i" className="c2-submit-inner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              Send Message <Send className="c2-submit-icon" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </MagneticWrap>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── RIGHT: Cards ── */}
          <div className="c2-cards-col">

            {/* WhatsApp — featured */}
            <motion.a
              ref={waCard.ref as React.RefObject<HTMLAnchorElement>}
              className="c2-card c2-card--featured c2-card--whatsapp"
              href="https://wa.me/923074960840"
              target="_blank" rel="noopener noreferrer" variants={fadeUp}
              onMouseMove={waCard.onMove} onMouseLeave={waCard.onLeave}
              onClick={spawnRipple}
              style={{ '--card-color': '#25D366', '--card-tile-bg': 'rgba(37,211,102,0.1)', '--card-tile-border': 'rgba(37,211,102,0.18)', '--card-hover-shadow': 'rgba(37,211,102,0.18)' } as React.CSSProperties}>
              <div className="c2-card-spotlight" />
              <div className="c2-card-icon-wrap">
                <WhatsAppBrandIcon className="c2-card-icon" />
              </div>
              <div className="c2-card-body">
                <span className="c2-card-label">WhatsApp</span>
                <span className="c2-card-title">Start a conversation</span>
                <span className="c2-card-desc">Quick replies & availability check</span>
              </div>
              <ArrowUpRight className="c2-card-arrow" />
            </motion.a>

            {/* Email + Instagram row */}
            <div className="c2-cards-row">
              <motion.a
                ref={emailCard.ref as React.RefObject<HTMLAnchorElement>}
                className="c2-card"
                href="mailto:tahakhilji83@gmail.com" variants={fadeUp}
                onMouseMove={emailCard.onMove} onMouseLeave={emailCard.onLeave}
                onClick={spawnRipple}
                style={{ '--card-color': '#579DFF', '--card-tile-bg': 'rgba(87,157,255,0.1)', '--card-tile-border': 'rgba(87,157,255,0.18)', '--card-hover-shadow': 'rgba(87,157,255,0.15)' } as React.CSSProperties}>
                <div className="c2-card-spotlight" />
                <div className="c2-card-icon-wrap"><Mail className="c2-card-icon" /></div>
                <div className="c2-card-body">
                  <span className="c2-card-label">Email</span>
                  <span className="c2-card-title">tahakhilji83@gmail.com</span>
                </div>
                <button type="button" className={`c2-card-copy ${copiedEmail ? 'is-copied' : ''}`}
                  onClick={copyEmailToClipboard} aria-label="Copy email address" title="Copy email">
                  {copiedEmail ? <Check className="c2-card-copy-icon" /> : <Copy className="c2-card-copy-icon" />}
                </button>
              </motion.a>

              <motion.a
                ref={igCard.ref as React.RefObject<HTMLAnchorElement>}
                className="c2-card c2-card--instagram"
                href="https://www.instagram.com/itx_khilji_99/"
                target="_blank" rel="noopener noreferrer" variants={fadeUp}
                onMouseMove={igCard.onMove} onMouseLeave={igCard.onLeave}
                onClick={spawnRipple}
                style={{ '--card-color': '#E4405F', '--card-tile-bg': 'rgba(228,64,95,0.1)', '--card-tile-border': 'rgba(228,64,95,0.18)', '--card-hover-shadow': 'rgba(228,64,95,0.15)' } as React.CSSProperties}>
                <div className="c2-card-spotlight" />
                <div className="c2-card-icon-wrap"><InstagramBrandIcon className="c2-card-icon" /></div>
                <div className="c2-card-body">
                  <span className="c2-card-label">Instagram</span>
                  <span className="c2-card-title">@itx_khilji_99</span>
                </div>
                <ArrowUpRight className="c2-card-arrow" />
              </motion.a>
            </div>

            {/* LinkedIn — full width */}
            <motion.a
              ref={liCard.ref as React.RefObject<HTMLAnchorElement>}
              className="c2-card c2-card--linkedin"
              href="https://www.linkedin.com/in/taha-khilji-823289312/"
              target="_blank" rel="noopener noreferrer" variants={fadeUp}
              onMouseMove={liCard.onMove} onMouseLeave={liCard.onLeave}
              onClick={spawnRipple}
              style={{ '--card-color': '#0A66C2', '--card-tile-bg': 'rgba(10,102,194,0.1)', '--card-tile-border': 'rgba(10,102,194,0.18)', '--card-hover-shadow': 'rgba(10,102,194,0.15)' } as React.CSSProperties}>
              <div className="c2-card-spotlight" />
              <div className="c2-card-icon-wrap"><LinkedInBrandIcon className="c2-card-icon" /></div>
              <div className="c2-card-body">
                <span className="c2-card-label">LinkedIn</span>
                <span className="c2-card-title">Taha Khilji</span>
                <span className="c2-card-desc">Professional network</span>
              </div>
              <ArrowUpRight className="c2-card-arrow" />
            </motion.a>

          </div>
        </motion.div>

        <Footer />
      </div>
    </section>
  );
};
