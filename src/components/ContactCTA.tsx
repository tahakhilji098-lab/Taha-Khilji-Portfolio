import React, { useState, useEffect, useRef } from 'react';
import { Mail, Instagram, Copy, Check, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Footer } from './Footer';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';
import { premiumEase } from '../motion/primitives';

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

export const ContactCTA: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const channelsRef = useRef<HTMLDivElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [entered, setEntered] = useState(false);
  const [entranceDone, setEntranceDone] = useState(false);

  const reduce = useReducedMotion();

  const EMAIL = 'tahakhilji83@gmail.com';
  const WHATSAPP_URL = 'https://wa.me/923074960840';
  const INSTAGRAM_URL = 'https://www.instagram.com/itx_khilji_99/';
  const LINKEDIN_URL = 'https://www.linkedin.com/in/taha-khilji-823289312/';

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | null = null;
    let entranceTimer: number | null = null;

    if (!reduceMotion.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          observer = null;
          setEntered(true);
          entranceTimer = window.setTimeout(() => setEntranceDone(true), 1650);
        },
        { threshold: 0.2 }
      );
      observer.observe(section);
    } else {
      setEntered(true);
      setEntranceDone(true);
    }

    const onVisibilityChange = () => {
      section.classList.toggle('contact-tab-paused', document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const rows: HTMLElement[] = channelsRef.current
      ? Array.from(channelsRef.current.querySelectorAll<HTMLElement>('.contact-channel'))
      : [];
    let rafId = 0;
    const rectCache = new Map<HTMLElement, DOMRect>();
    const pending = new Map<HTMLElement, { x: number; y: number }>();
    const flush = () => {
      rafId = 0;
      pending.forEach((point, row) => {
        const rect = rectCache.get(row);
        if (!rect) return;
        row.style.setProperty('--contact-illum-x', `${point.x - rect.left}px`);
        row.style.setProperty('--contact-illum-y', `${point.y - rect.top}px`);
      });
      pending.clear();
    };
    const onPointerEnter = (e: PointerEvent) => {
      const row = e.currentTarget as HTMLElement;
      rectCache.set(row, row.getBoundingClientRect());
    };
    const onPointerMove = (e: PointerEvent) => {
      const row = e.currentTarget as HTMLElement;
      pending.set(row, { x: e.clientX, y: e.clientY });
      if (!rafId) rafId = requestAnimationFrame(flush);
    };
    const onPointerLeave = (e: PointerEvent) => {
      const row = e.currentTarget as HTMLElement;
      pending.delete(row);
      row.style.setProperty('--contact-illum-x', '50%');
      row.style.setProperty('--contact-illum-y', '50%');
    };
    if (hoverMq.matches && !reduceMotion.matches) {
      rows.forEach((row) => {
        row.addEventListener('pointerenter', onPointerEnter);
        row.addEventListener('pointermove', onPointerMove);
        row.addEventListener('pointerleave', onPointerLeave);
      });
    }

    return () => {
      observer?.disconnect();
      if (entranceTimer !== null) window.clearTimeout(entranceTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (rafId) cancelAnimationFrame(rafId);
      rows.forEach((row) => {
        row.removeEventListener('pointerenter', onPointerEnter);
        row.removeEventListener('pointermove', onPointerMove);
        row.removeEventListener('pointerleave', onPointerLeave);
      });
    };
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    },
    []
  );

  const copyEmailToClipboard = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(EMAIL);
    setCopiedEmail(true);
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedEmail(false), 1400);
  };

  const sectionClass = ['contact-section'];
  if (entered) sectionClass.push('is-visible');
  if (entered && !entranceDone) sectionClass.push('is-entering');

  return (
    <section id="contact" ref={sectionRef} className={sectionClass.join(' ')}>

      {/* Background layers (decorative) */}
      <div className="contact-bg" aria-hidden="true">
        <div className="contact-bg-grid" />
        <div className="contact-bg-ribbon" />
        <div className="contact-bg-ellipse" />
        <div className="contact-bg-vignette" />
      </div>

      <div className="contact-container">

        <header className="contact-head">
          <p className="contact-eyebrow">Have a project in mind?</p>
          <h2 className="contact-title">
            <span className="contact-title-line">
              <span className="contact-title-line-inner">Let's create something</span>
            </span>
            <span className="contact-title-line">
              <span className="contact-title-line-inner">
                <span className="contact-title-accent">remarkable</span>
                <span className="contact-title-dot">.</span>
              </span>
            </span>
          </h2>
          <p className="contact-subtitle">
            Tell me about your project, goals, and timeline. I usually reply within 24 hours.
          </p>
        </header>

        {/* Contact panel */}
        <div className="contact-panel">
          <div className="contact-availability">
            <span className="contact-availability-dot" aria-hidden="true" />
            <span>Available for selected projects</span>
          </div>

          <div className="contact-panel-body">
            {/* Email */}
            <div className="contact-email">
              <div className="contact-channel-icon" aria-hidden="true">
                <Mail className="contact-icon" />
              </div>
              <div className="contact-email-main">
                <p className="contact-channel-label">Email</p>
                <div className="contact-email-line">
                  <a
                    className="contact-email-link"
                    href={`mailto:${EMAIL}`}
                    aria-label="Send an email to Taha Khilji"
                  >
                    {EMAIL}
                  </a>
                  <button
                    type="button"
                    className={`contact-copy${copiedEmail ? ' has-copied' : ''}`}
                    onClick={copyEmailToClipboard}
                    aria-label="Copy email address"
                    title="Copy email address"
                  >
                    {copiedEmail ? (
                      <Check key="check" className="contact-copy-icon is-copied" aria-hidden="true" />
                    ) : (
                      <Copy key="copy" className="contact-copy-icon" aria-hidden="true" />
                    )}
                    <span className="contact-copy-tooltip" aria-hidden="true">Copied</span>
                  </button>
                  <span className="contact-sr-live" aria-live="polite">
                    {copiedEmail ? 'Email address copied to clipboard.' : ''}
                  </span>
                </div>
                <p className="contact-channel-desc">Best for project briefs and collaborations</p>
                <a
                  href={GMAIL_COMPOSE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-primary-cta contact-cta"
                  aria-label="Start a project with Taha Khilji using Gmail"
                >
                  <span>START A PROJECT</span>
                  <ArrowUpRight className="contact-cta-arrow" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* WhatsApp + Instagram */}
            <div className="contact-channels" ref={channelsRef}>
              <a
                className="contact-channel contact-channel-whatsapp"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Start a WhatsApp conversation with Taha Khilji"
              >
                <span className="contact-channel-icon" aria-hidden="true">
                  <WhatsAppIcon className="contact-icon" />
                </span>
                <span className="contact-channel-main">
                  <span className="contact-channel-label">WhatsApp</span>
                  <span className="contact-channel-title">Start a conversation</span>
                  <span className="contact-channel-desc">Quick questions and availability</span>
                </span>
                <ArrowUpRight className="contact-channel-arrow" aria-hidden="true" />
              </a>
              <a
                className="contact-channel contact-channel-instagram"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Taha Khilji on Instagram"
              >
                <span className="contact-channel-icon" aria-hidden="true">
                  <Instagram className="contact-icon" />
                </span>
                <span className="contact-channel-main">
                  <span className="contact-channel-label">Instagram</span>
                  <span className="contact-channel-title">@itx_khilji_99</span>
                  <span className="contact-channel-desc">Follow design updates</span>
                </span>
                <ArrowUpRight className="contact-channel-arrow" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Social platforms */}
        <nav className="contact-social" aria-label="Social media">
          <a
            className="contact-social-link"
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Taha Khilji on LinkedIn"
          >
            LINKEDIN
          </a>
        </nav>

        {/* Integrated footer */}
        <Footer />

      </div>
    </section>
  );
};
