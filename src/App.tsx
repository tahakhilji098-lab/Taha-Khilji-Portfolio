import React, { useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SelectedProjects } from './components/SelectedProjects';
import { Services } from './components/Services';
import { About } from './components/About';
import { DesignProcess } from './components/DesignProcess';
import { Testimonials } from './components/Testimonials';
import { ContactCTA } from './components/ContactCTA';
import { SmoothScroll } from './motion/smoothScroll';
import { Preloader } from './components/Preloader';

import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import BlogList from './pages/admin/BlogList';
import PostEditor from './pages/admin/PostEditor';
import ProjectList from './pages/admin/ProjectList';
import ProjectEditor from './pages/admin/ProjectEditor';
import SeoSettings from './pages/admin/SeoSettings';
import LeadsInbox from './pages/admin/LeadsInbox';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import BlogIndex from './pages/blog/BlogIndex';
import BlogPostPage from './pages/blog/BlogPost';
import ProjectDetailPage from './pages/work/ProjectDetail';
import SitemapXml from './pages/SitemapXml';
import RobotsTxt from './pages/RobotsTxt';
import { usePageSeo } from './hooks/usePageSeo';
import { usePageViewTracking } from './hooks/usePageViewTracking';
import { PersonJsonLd } from './components/JsonLd';

/* ═══════════════════════════════════════════════
   ERROR BOUNDARY — catches render crashes
   ═══════════════════════════════════════════════ */
type EBProps = { children: ReactNode };
type EBState = { error: Error | null };

class ErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { error };
  }

  render() {
    const err = this.state.error;
    if (err) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0f1e',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
          padding: 32,
        }}>
          <div style={{ maxWidth: 500, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h1>
            <pre style={{
              fontSize: 13,
              color: '#f87171',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8,
              padding: 16,
              overflow: 'auto',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
            }}>
              {err.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#267dff',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SLIDE_EASE = [0.76, 0, 0.24, 1] as const;
const SLIDE_DURATION = 1.2;

/* ── Noindex meta injector for /admin routes ── */
function AdminMeta() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdmin) return;
    const tag = document.createElement('meta');
    tag.name = 'robots';
    tag.content = 'noindex, nofollow';
    document.head.appendChild(tag);
    return () => { document.head.removeChild(tag); };
  }, [isAdmin]);

  return null;
}

/* ── Public site (portfolio) ── */
function PortfolioSite() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isLoading, setIsLoading] = useState(true);

  usePageViewTracking();
  usePageSeo('/', {
    title: 'Taha Khilji — Senior Graphic Designer & Art Director',
    description: 'Crafting bold visual identities, precision editorial layouts & scalable brand systems. Available for Q3/Q4 brand & design commissions.',
  });

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isLoading]);

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
    <div className="min-h-screen bg-[#050816] text-[#9EA8BD] font-sans selection:bg-[#267DFF] selection:text-white antialiased overflow-clip">
      <PersonJsonLd
        sameAs={[
          'https://www.linkedin.com/in/taha-khilji-823289312/',
          'https://www.instagram.com/itx_khilji_99/',
        ]}
      />
      <Preloader isLoading={isLoading} onComplete={() => setIsLoading(false)} />

      <motion.div
        initial={{ y: '100vh' }}
        animate={{ y: isLoading ? '100vh' : 0 }}
        transition={{ duration: SLIDE_DURATION, ease: SLIDE_EASE }}
      >
        <SmoothScroll />
        <Header activeSection={activeSection} />
        <main id="main-content">
          <Hero />
          <SelectedProjects />
          <Services />
          <About />
          <DesignProcess />
          <Testimonials />
          <ContactCTA />
        </main>
      </motion.div>
    </div>
  );
}

/* ── Root router ── */
function AppRoutes() {
  return (
    <>
      <AdminMeta />
      <Routes>
        {/* Public portfolio */}
        <Route path="/" element={<PortfolioSite />} />

        {/* Public blog */}
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        {/* Public project detail */}
        <Route path="/work/:slug" element={<ProjectDetailPage />} />

        {/* SEO files */}
        <Route path="/sitemap.xml" element={<SitemapXml />} />
        <Route path="/robots.txt" element={<RobotsTxt />} />

        {/* Admin — noindex meta */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/new" element={<PostEditor />} />
          <Route path="blog/edit/:id" element={<PostEditor />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectEditor />} />
          <Route path="projects/edit/:id" element={<ProjectEditor />} />
          <Route path="seo" element={<SeoSettings />} />
          <Route path="leads" element={<LeadsInbox />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
