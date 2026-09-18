import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/Header';
import { getSupabase } from '../../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  content: string;
  created_at: string;
}

function readTime(content: string): string {
  const words = content?.split(/\s+/).length ?? 0;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data ?? []);
      } catch (err: any) {
        console.error('[BlogIndex] fetch failed:', err);
        setErrorMsg(err?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={sx.page}>
      <Header activeSection="blog" />
      <div className="blog-page-bg" />
      <div style={sx.glow} />

      <header style={sx.header}>
        <h1 style={sx.title}>Blog</h1>
        <p style={sx.sub}>Thoughts on design, code, and craft.</p>
      </header>

      {loading ? (
        <div style={sx.loading}>Loading…</div>
      ) : errorMsg ? (
        <div style={sx.empty}>
          <p style={{ ...sx.emptyText, color: '#f87171' }}>Error loading posts</p>
          <p style={{ ...sx.emptyText, fontSize: 12, marginTop: 8, fontFamily: 'monospace' }}>{errorMsg}</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={sx.empty}>
          <p style={sx.emptyText}>No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div style={sx.grid}>
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="blog-card" style={sx.card}>
              <div style={sx.cardImgWrap}>
                {post.cover_image_url ? (
                  <img src={post.cover_image_url} alt="" style={sx.cardImg} loading="lazy" />
                ) : (
                  <div style={sx.cardImgPlaceholder} />
                )}
              </div>
              <div style={sx.cardBody}>
                <div style={sx.cardMeta}>
                  <time style={sx.cardDate}>{formatDate(post.created_at)}</time>
                  <span style={sx.cardDot}>·</span>
                  <span style={sx.cardReadTime}>{readTime(post.content)}</span>
                </div>
                <h2 style={sx.cardTitle}>{post.title}</h2>
                {post.excerpt && <p style={sx.cardExcerpt}>{post.excerpt}</p>}
                <span style={sx.cardLink}>Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const sx: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', position: 'relative',
    background: 'linear-gradient(180deg, #050816 0%, #0a0f1e 50%, #050816 100%)',
    fontFamily: 'var(--font-sans, "Plus Jakarta Sans", system-ui, sans-serif)',
    color: '#c8d2e0', padding: '0 24px',
  },
  glow: {
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: 800, height: 500, borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(38, 125, 255, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  header: { maxWidth: 800, margin: '0 auto', paddingTop: 140, paddingBottom: 48, position: 'relative' },
  title: {
    margin: '0 0 8px', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: '#f0f4ff',
    fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
  },
  sub: { margin: 0, fontSize: 16, color: '#7c8aa8' },
  loading: { textAlign: 'center' as const, padding: '80px 0', color: '#5a6a84', fontSize: 14 },
  empty: { textAlign: 'center' as const, padding: '80px 0' },
  emptyText: { margin: 0, fontSize: 15, color: '#7c8aa8' },
  grid: {
    maxWidth: 800, margin: '0 auto', display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28,
    paddingBottom: 100,
  },
  card: {
    display: 'block', textDecoration: 'none', color: 'inherit',
    borderRadius: 12, overflow: 'hidden',
    background: 'rgba(12, 20, 40, 0.6)',
    border: '1px solid rgba(100, 160, 240, 0.08)',
    transition: 'border-color 300ms, box-shadow 300ms',
  },
  cardImgWrap: { width: '100%', height: 200, overflow: 'hidden', background: 'rgba(6, 12, 28, 0.5)' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' },
  cardImgPlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(38,125,255,0.06), rgba(38,125,255,0.02))' },
  cardBody: { padding: '20px 24px 24px' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 12, color: '#5a6a84' },
  cardDate: {},
  cardDot: { opacity: 0.5 },
  cardReadTime: {},
  cardTitle: {
    margin: '0 0 8px', fontSize: 18, fontWeight: 600, color: '#f0f4ff', lineHeight: 1.3,
  },
  cardExcerpt: { margin: '0 0 14px', fontSize: 14, color: '#7c8aa8', lineHeight: 1.5 },
  cardLink: { fontSize: 13, color: '#579dff', fontWeight: 500 },
};
