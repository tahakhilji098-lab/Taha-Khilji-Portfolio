import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { GMAIL_COMPOSE_URL } from '../data/gmailCompose';

interface HeaderProps {
  activeSection: string;
}

const navLinks = [
  { label: 'Work', href: '#projects', id: 'projects' },
  { label: 'Services', href: '#services', id: 'services' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Blog', href: '/blog', id: 'blog' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOnBlog = pathname.startsWith('/blog');

  /* ── Mobile menu ── */
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
      const focusables = Array.from(
        menu.querySelectorAll<HTMLElement>('a[href], button')
      ) as HTMLElement[];
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

  /* ── Scroll shadow ── */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 32);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Scroll to section (or navigate to route) ── */
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    // Route-based link: navigate to /blog
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }

    // If we're on /blog, navigate home first, then scroll
    if (isOnBlog) {
      navigate('/' + href);
      return;
    }

    // Same-page anchor scroll
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* ── Scroll progress ── */
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const underlineTransition = reduce
    ? false
    : { type: 'spring' as const, stiffness: 500, damping: 30 };

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
      <div className="floating-header-wrapper">
        <header
          id="header"
          className={`floating-header${scrolled ? ' is-scrolled' : ''}`}
        >
          <div className="header-inner">
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                if (isOnBlog) { navigate('/'); return; }
                scrollToSection(e, '#hero', 'hero');
              }}
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
                  onClick={(e) => scrollToSection(e, link.href, link.id)}
                  className={`header-nav-link${activeSection === link.id ? ' is-active' : ''}`}
                >
                  <span className="header-nav-label">
                    {link.label}
                    {activeSection === link.id && (
                      <motion.span
                        layoutId="nav-underline"
                        className="header-nav-active-indicator"
                        transition={underlineTransition}
                        aria-hidden="true"
                      />
                    )}
                  </span>
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
                  onClick={(e) => scrollToSection(e, link.href, link.id)}
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
      </div>
    </>
  );
};
