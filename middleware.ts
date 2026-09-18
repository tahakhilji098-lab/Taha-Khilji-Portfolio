const BOTS = [
  'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot',
  'WhatsApp', 'Slackbot', 'TelegramBot', 'Discordbot',
  'Googlebot', 'bingbot', 'Pinterest', 'redditbot',
];

const SUPABASE_URL = 'https://xkgmqpbktlrozqrfzysg.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ21xcGJrdGxyb3pxcmZ6eXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0ODQ2NDIsImV4cCI6MjEwNTA2MDY0Mn0.xUEbMi2rLFx1XfsU_Ywv3w9YOVyjH8QZoNw3gjwAL5A';
const SITE_URL = 'https://tahakhilji.vercel.app';

function isBot(ua: string | null): boolean {
  if (!ua) return false;
  const lower = ua.toLowerCase();
  return BOTS.some(bot => lower.includes(bot.toLowerCase()));
}

function makeAbsoluteUrl(url: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function buildMetaHtml(opts: {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  type: string;
}): Response {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${escHtml(opts.title)} — Taha Khilji</title>
<meta name="description" content="${escHtml(opts.description)}">
<meta property="og:title" content="${escHtml(opts.title)} — Taha Khilji">
<meta property="og:description" content="${escHtml(opts.description)}">
<meta property="og:image" content="${escHtml(opts.imageUrl)}">
<meta property="og:url" content="${escHtml(opts.pageUrl)}">
<meta property="og:type" content="${opts.type}">
<meta property="og:site_name" content="Taha Khilji">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escHtml(opts.title)} — Taha Khilji">
<meta name="twitter:description" content="${escHtml(opts.description)}">
<meta name="twitter:image" content="${escHtml(opts.imageUrl)}">
</head><body></body></html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function fetchFromSupabase(table: string, slug: string): Promise<any | null> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] ?? null;
  } catch {
    return null;
  }
}

export default async function middleware(request: Request): Promise<Response> {
  const ua = request.headers.get('user-agent');
  if (!isBot(ua)) {
    // Not a bot — fall through to serve the normal SPA index.html.
    // In Vercel Edge for Vite projects, returning a pass-through
    // response lets the file system handle the request.
    return fetch(request);
  }

  const { pathname } = new URL(request.url);

  // Blog post
  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) {
    const slug = blogMatch[1];
    const post = await fetchFromSupabase('blog_posts', slug);
    if (!post || post.published === false) {
      return new Response('Not Found', { status: 404 });
    }
    return buildMetaHtml({
      title: post.meta_title || post.title || slug,
      description: post.meta_description || post.excerpt || '',
      imageUrl: makeAbsoluteUrl(post.cover_image_url || '/images/og-default.jpg'),
      pageUrl: `${SITE_URL}/blog/${slug}`,
      type: 'article',
    });
  }

  // Project
  const workMatch = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (workMatch) {
    const slug = workMatch[1];
    const project = await fetchFromSupabase('projects', slug);
    if (!project) {
      return new Response('Not Found', { status: 404 });
    }
    return buildMetaHtml({
      title: project.meta_title || project.title || slug,
      description: project.meta_description || project.description || '',
      imageUrl: makeAbsoluteUrl(project.cover_image_url || '/images/og-default.jpg'),
      pageUrl: `${SITE_URL}/work/${slug}`,
      type: 'website',
    });
  }

  // Not a matched path — pass through
  return fetch(request);
}

export const config = {
  matcher: ['/blog/:path*', '/work/:path*'],
};
