import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';
import { premiumEase } from '../motion/primitives';

interface HeaderProps {
  activeSection: string;
}

const navLinks = [
  { label: 'Work', href: '#projects', id: 'projects' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

const COMPACT_AFTER = 72;
const EXPAND_BELOW = 32;

export const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [isCompact, setIsCompact] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const compactRef = useRef(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      if (y >= COMPACT_AFTER && !compactRef.current) {
        compactRef.current = true;
        setIsCompact(true);
      } else if (y <= EXPAND_BELOW && compactRef.current) {
        compactRef.current = false;
        setIsCompact(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehaviorY = 'none';
    const menu = menuRef.current;
    const firstLink = menu?.querySelector<HTMLAnchorElement>('a');
    firstLink?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !menu) return;
      const focusables = Array.from(menu.querySelectorAll<HTMLElement>('a[href], button')) as HTMLElement[];
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehaviorY = '';
      window.removeEventListener('keydown', onKeyDown);
      toggleRef.current?.focus({ preventScroll: true });
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        className="header-progress"
        aria-hidden="true"
        style={reduce ? undefined : { scaleX: progressScale }}
      />
      <div
        className={`header-mobile-backdrop${mobileMenuOpen ? ' is-visible' : ''}`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
      />
      <header
        id="header"
        className="floating-header"
        data-compact={isCompact ? 'true' : 'false'}
      >
        <div className="header-inner">
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, '#hero')}
            className="header-brand"
            aria-label="Taha Khilji — back to top"
          >
            <span className="header-brand-inner">Taha Khilji</span>
          </a>

          <nav className="header-nav" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`header-nav-link${activeSection === link.id ? ' is-active' : ''}`}
              >
                <span className="header-nav-label">{link.label}</span>
                <span className="header-nav-indicator" aria-hidden="true" />
              </a>
            ))}
          </nav>

          <div className="header-cta-wrap">
            <a
              href={GMAIL_COMPOSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="header-cta"
              aria-label="Start a project with Taha Khilji using Gmail"
            >
              <span className="header-cta-sweep" aria-hidden="true" />
              <span className="header-cta-text">Start a Project</span>
              <ArrowUpRight className="header-cta-arrow" aria-hidden="true" />
            </a>
            <button
              type="button"
              ref={toggleRef}
              className="header-menu-toggle"
              aria-expanded={mobileMenuOpen}
              aria-controls="header-mobile-menu"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span className="header-menu-bars" aria-hidden="true">
                <span className="header-menu-bar" />
                <span className="header-menu-bar" />
                <span className="header-menu-bar" />
              </span>
            </button>
          </div>
        </div>

        <nav
          id="header-mobile-menu"
          ref={menuRef}
          className={`header-mobile-menu${mobileMenuOpen ? ' is-open' : ''}`}
          aria-label="Mobile navigation"
        >
          <div className="header-mobile-menu-links">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`header-mobile-menu-link${activeSection === link.id ? ' is-active' : ''}`}
              >
                <span>{link.label}</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ))}
          </div>
          <a
            href={GMAIL_COMPOSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="header-mobile-menu-cta"
            aria-label="Start a project with Taha Khilji using Gmail"
          >
            <span>Start a Project</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        </nav>
      </header>
    </>
  );
};
