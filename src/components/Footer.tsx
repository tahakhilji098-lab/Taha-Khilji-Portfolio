import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <footer className="contact-footer">
      <p className="contact-footer-note">
        <strong>Taha Khilji</strong>
        <span className="contact-footer-dash" aria-hidden="true">
          —
        </span>
        Independent Graphic Designer
      </p>
      <p className="contact-footer-copy">© 2026 Taha Khilji. All rights reserved.</p>
      <div className="contact-footer-right">
        <button
          type="button"
          onClick={scrollToTop}
          className="contact-footer-top"
          aria-label="Back to top"
        >
          <ArrowUp className="contact-footer-top-icon" aria-hidden="true" />
          <span>Back to top</span>
        </button>
      </div>
    </footer>
  );
};
