import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { CreativeWorkJsonLd } from '../../components/JsonLd';
import { getSupabase } from '../../lib/supabase';

function setMetaTag(name: string, content: string) {
  const isOg = name.startsWith('og:');
  const selector = isOg ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isOg) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

interface Project {
  title: string;
  slug: string;
  category: string;
  description: string;
  cover_image_url: string;
  gallery_urls: string[];
  meta_title: string;
  meta_description: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('projects')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error || !data) { setNotFound(true); return; }
        setProject(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!project) return;
    const t = project.meta_title || project.title;
    const d = project.meta_description || project.description?.slice(0, 160) || '';
    const img = project.cover_image_url || '/images/og-default.jpg';
    document.title = `${t} — Taha Khilji`;

    setMetaTag('description', d);
    setMetaTag('og:title', t);
    setMetaTag('og:description', d);
    setMetaTag('og:image', img);
    setMetaTag('og:type', 'website');
    setMetaTag('og:site_name', 'Taha Khilji');
    setMetaTag('twitter:card', 'summary_large_image');
    return () => { document.title = 'Taha Khilji — Portfolio'; };
  }, [project]);

  if (loading) {
    return (
      <div style={sx.page}>
        <Header activeSection="work" />
        <div style={sx.center}>Loading…</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div style={sx.page}>
        <Header activeSection="work" />
        <div style={sx.center}>
          <h1 style={sx.nfCode}>404</h1>
          <p style={sx.nfText}>Project not found.</p>
          <Link to="/" style={sx.back}>← Back to work</Link>
        </div>
      </div>
    );
  }

  const gallery = project.gallery_urls ?? [];

  return (
    <div style={sx.page}>
      <Header activeSection="work" />
      <CreativeWorkJsonLd
        name={project.title}
        description={project.description}
        dateCreated={project.created_at}
        image={project.cover_image_url}
      />
      <div className="blog-page-bg" />
      <div style={sx.glow} />

      <article style={sx.article}>
        <Link to="/" style={sx.back}>← Back to work</Link>

        <header style={sx.header}>
          <span style={sx.category}>{project.category}</span>
          <h1 style={sx.title}>{project.title}</h1>
        </header>

        {project.cover_image_url && (
          <div style={sx.coverWrap}>
            <img src={project.cover_image_url} alt={project.title} style={sx.coverImg} />
          </div>
        )}

        {project.description && (
          <div style={sx.description}>
            {project.description.split('\n').map((para, i) => (
              <p key={i} style={sx.paragraph}>{para}</p>
            ))}
          </div>
        )}

        {gallery.length > 0 && (
          <div style={sx.gallery}>
            {gallery.map((url, idx) => (
              <div key={idx} style={sx.galleryItem}>
                <img src={url} alt={`${project.title} — image ${idx + 1}`} style={sx.galleryImg} />
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

const sx: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #050816 0%, #0a0f1e 50%, #050816 100%)',
    fontFamily: 'var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif)',
    color: '#c8d2e0', padding: '0 24px',
  },
  glow: {
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 700, height: 400, borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(38, 125, 255, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  center: { textAlign: 'center' as const, padding: '160px 0', color: '#5a6a84' },
  article: { maxWidth: 860, margin: '0 auto', paddingTop: 140, paddingBottom: 100, position: 'relative' },
  back: { fontSize: 13, color: '#5a6a84', textDecoration: 'none', marginBottom: 32, display: 'inline-block' },
  header: { marginBottom: 36 },
  category: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 6, marginBottom: 12,
    fontSize: 12, fontWeight: 500, color: '#93c5fd', letterSpacing: '0.04em',
    background: 'rgba(147, 197, 253, 0.08)', border: '1px solid rgba(147, 197, 253, 0.15)',
  },
  title: {
    margin: 0, fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
    color: '#f0f4ff', lineHeight: 1.15,
    fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
  },
  coverWrap: {
    borderRadius: 12, overflow: 'hidden', marginBottom: 40,
    border: '1px solid rgba(100, 160, 240, 0.08)',
  },
  coverImg: { width: '100%', display: 'block', maxHeight: 500, objectFit: 'cover' as const },
  description: { marginBottom: 40 },
  paragraph: { margin: '0 0 1.25em', fontSize: 16, lineHeight: 1.75, color: '#c8d2e0' },
  gallery: { display: 'flex', flexDirection: 'column' as const, gap: 20 },
  galleryItem: {
    borderRadius: 12, overflow: 'hidden',
    border: '1px solid rgba(100, 160, 240, 0.08)',
  },
  galleryImg: { width: '100%', display: 'block' },
  nfCode: { margin: '0 0 10px', fontSize: 64, fontWeight: 800, color: '#1e293b' },
  nfText: { margin: '0 0 24px', fontSize: 16, color: '#7c8aa8' },
};
