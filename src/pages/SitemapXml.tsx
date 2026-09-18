import { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  priority: string;
}

// Update this if a custom domain is connected later.
const SITE_URL = 'https://tahakhilji.vercel.app';

const STATIC_PAGES: SitemapUrl[] = [
  { loc: '/', lastmod: new Date().toISOString().split('T')[0], priority: '1.0' },
  { loc: '/work', lastmod: new Date().toISOString().split('T')[0], priority: '0.8' },
  { loc: '/services', lastmod: new Date().toISOString().split('T')[0], priority: '0.8' },
  { loc: '/about', lastmod: new Date().toISOString().split('T')[0], priority: '0.7' },
  { loc: '/contact', lastmod: new Date().toISOString().split('T')[0], priority: '0.7' },
  { loc: '/blog', lastmod: new Date().toISOString().split('T')[0], priority: '0.8' },
];

function formatDate(iso: string): string {
  return iso ? new Date(iso).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
}

export default function SitemapXml() {
  const [xml, setXml] = useState('');

  useEffect(() => {
    (async () => {
      const urls: SitemapUrl[] = [...STATIC_PAGES];

      try {
        const sb = getSupabase();

        const { data: posts } = await sb
          .from('blog_posts')
          .select('slug, updated_at, created_at')
          .eq('published', true);

        for (const p of posts ?? []) {
          urls.push({
            loc: `/blog/${p.slug}`,
            lastmod: formatDate(p.updated_at || p.created_at),
            priority: '0.6',
          });
        }

        const { data: projects } = await sb
          .from('projects')
          .select('slug, updated_at, created_at')
          .eq('published', true);

        for (const p of projects ?? []) {
          urls.push({
            loc: `/work/${p.slug}`,
            lastmod: formatDate(p.updated_at || p.created_at),
            priority: '0.6',
          });
        }
      } catch {
        // Use static pages only on error
      }

      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      setXml(xmlContent);

      // Also set the content type hint via a data attribute for crawlers
      document.title = 'sitemap.xml';
    })();
  }, []);

  // Render as plain text so browsers display it as source code
  return (
    <pre style={{ margin: 0, padding: 24, background: '#0a0f1e', color: '#c8d2e0', fontSize: 13, fontFamily: 'monospace', whiteSpace: 'pre', minHeight: '100vh' }}>
      {xml || 'Loading…'}
    </pre>
  );
}
