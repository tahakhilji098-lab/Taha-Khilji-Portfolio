import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Header } from '../../components/Header';
import { ArticleJsonLd } from '../../components/JsonLd';
import { getSupabase } from '../../lib/supabase';

function readTime(content: string): string {
  const words = content?.split(/\s+/).length ?? 0;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

marked.setOptions({ breaks: true, gfm: true });

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

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  content: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error || !data) { setNotFound(true); return; }
        setPost(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const t = post.meta_title || post.title;
    const d = post.meta_description || post.excerpt || '';
    const img = post.cover_image_url || '/images/og-default.jpg';
    document.title = `${t} — Taha Khilji`;

    setMetaTag('description', d);
    setMetaTag('og:title', t);
    setMetaTag('og:description', d);
    setMetaTag('og:image', img);
    setMetaTag('og:type', 'article');
    setMetaTag('og:site_name', 'Taha Khilji');
    setMetaTag('twitter:card', 'summary_large_image');

    return () => { document.title = 'Taha Khilji — Portfolio'; };
  }, [post]);

  const html = useMemo(() => {
    if (!post?.content) return '';
    try {
      const raw = marked.parse(post.content) as string;
      return DOMPurify.sanitize(raw, { ADD_TAGS: ['iframe'] });
    }
    catch { return '<p>Failed to render content.</p>'; }
  }, [post]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div style={sx.page}>
        <Header activeSection="blog" />
        <div style={sx.center}>Loading…</div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div style={sx.page}>
        <Header activeSection="blog" />
        <div style={sx.center}>
          <h1 style={sx.nfCode}>404</h1>
          <p style={sx.nfText}>Post not found.</p>
          <Link to="/blog" style={sx.back}>← Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={sx.page}>
      <Header activeSection="blog" />
      <ArticleJsonLd
        headline={post.title}
        description={post.meta_description || post.excerpt || ''}
        datePublished={post.created_at}
        image={post.cover_image_url}
      />
      <div className="blog-page-bg" />
      <div style={sx.glow} />

      <article style={sx.article}>
        <Link to="/blog" style={sx.back}>← Back to blog</Link>

        <header style={sx.header}>
          <div style={sx.metaRow}>
            <time style={sx.date}>{formatDate(post.created_at)}</time>
            <span style={sx.dot}>·</span>
            <span style={sx.date}>{readTime(post.content)}</span>
          </div>
          <h1 style={sx.title}>{post.title}</h1>
          {post.excerpt && <p style={sx.excerpt}>{post.excerpt}</p>}
        </header>

        {post.cover_image_url && (
          <div style={sx.coverWrap}>
            <img src={post.cover_image_url} alt="" style={sx.coverImg} />
          </div>
        )}

        <div
          className="blog-content"
          style={sx.content}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  );
}

const sx: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #050816 0%, #0a0f1e 50%, #050816 100%)',
    fontFamily: 'var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif)',
    color: '#c8d2e0',
    padding: '0 24px',
  },
  glow: {
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 600, height: 350, borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(38, 125, 255, 0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  center: { textAlign: 'center' as const, padding: '160px 0', color: '#5a6a84' },
  article: { maxWidth: 720, margin: '0 auto', paddingTop: 140, paddingBottom: 100, position: 'relative' },
  back: {
    fontSize: 13, color: '#5a6a84', textDecoration: 'none', marginBottom: 32, display: 'inline-block',
  },
  header: { marginBottom: 36 },
  metaRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, color: '#5a6a84' },
  date: {},
  dot: { opacity: 0.5 },
  title: {
    margin: '0 0 12px', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
    color: '#f0f4ff', lineHeight: 1.15,
    fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
  },
  excerpt: { margin: 0, fontSize: 17, color: '#7c8aa8', lineHeight: 1.5 },
  coverWrap: {
    borderRadius: 12, overflow: 'hidden', marginBottom: 36,
    border: '1px solid rgba(100, 160, 240, 0.08)',
  },
  coverImg: { width: '100%', display: 'block', maxHeight: 420, objectFit: 'cover' as const },
  content: {
    fontSize: 16, lineHeight: 1.75, color: '#c8d2e0',
  },
  nfCode: {
    margin: '0 0 10px', fontSize: 64, fontWeight: 800, color: '#1e293b',
  },
  nfText: { margin: '0 0 24px', fontSize: 16, color: '#7c8aa8' },
};
