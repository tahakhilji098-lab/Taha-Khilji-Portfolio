import { useEffect, useState } from 'react';

// Update this if a custom domain is connected later.
const SITE_URL = 'https://tahakhilji.vercel.app';

export default function RobotsTxt() {
  const [text, setText] = useState('');

  useEffect(() => {
    const content = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${SITE_URL}/sitemap.xml`;
    setText(content);
  }, []);

  return (
    <pre style={{ margin: 0, padding: 24, background: '#0a0f1e', color: '#c8d2e0', fontSize: 13, fontFamily: 'monospace', whiteSpace: 'pre', minHeight: '100vh' }}>
      {text || 'Loading…'}
    </pre>
  );
}
