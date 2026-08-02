import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SelectedProjects } from './components/SelectedProjects';
import { Services } from './components/Services';
import { About } from './components/About';
import { DesignProcess } from './components/DesignProcess';
import { Testimonials } from './components/Testimonials';
import { ContactCTA } from './components/ContactCTA';
import { SmoothScroll } from './motion/smoothScroll';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const sections = ['hero', 'projects', 'services', 'about', 'process', 'testimonials', 'contact'];

    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let best = 'hero';
      let bestDistance = Infinity;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = sectionId;
        }
      }

      setActiveSection(best);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-[#9EA8BD] font-sans selection:bg-[#267DFF] selection:text-white antialiased">
      <SmoothScroll />

      {/* 1. Sticky Header and Navigation */}
      <Header activeSection={activeSection} />

      {/* Main Page Sections in exact requested order */}
      <main id="main-content">
        {/* 2. Hero section */}
        <Hero />

        {/* 3. Selected projects */}
        <SelectedProjects />

        {/* 4. Services */}
        <Services />

        {/* 5. About Taha */}
        <About />

        {/* 6. Design process */}
        <DesignProcess />

        {/* 7. Client testimonials */}
        <Testimonials />

        {/* 8. Contact CTA */}
        <ContactCTA />
      </main>
    </div>
  );
}
