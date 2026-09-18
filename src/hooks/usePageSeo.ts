import { useEffect } from 'react';
import { getSupabase } from '../lib/supabase';

interface SeoDefaults {
  title: string;
  description: string;
  ogImage?: string;
}

const SITE_NAME = 'Taha Khilji';
const DEFAULT_OG_IMAGE = '/images/og-default.jpg';

export function usePageSeo(pagePath: string, defaults: SeoDefaults) {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const sb = getSupabase();
        const { data } = await sb
          .from('seo_settings')
          .select('meta_title, meta_description, og_image_url')
          .eq('page_path', pagePath)
          .single();

        if (cancelled) return;

        const title = data?.meta_title || defaults.title;
        const description = data?.meta_description || defaults.description;
        const ogImage = data?.og_image_url || defaults.ogImage || DEFAULT_OG_IMAGE;

        document.title = `${title} — ${SITE_NAME}`;

        setMeta('description', description);
        setMeta('og:title', title);
        setMeta('og:description', description);
        setMeta('og:image', ogImage);
        setMeta('og:type', 'website');
        setMeta('og:site_name', SITE_NAME);
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', title);
        setMeta('twitter:description', description);
        setMeta('twitter:image', ogImage);
      } catch {
        // Fallback to defaults on error
        document.title = `${defaults.title} — ${SITE_NAME}`;
        setMeta('description', defaults.description);
      }
    })();

    return () => { cancelled = true; };
  }, [pagePath, defaults.title, defaults.description]);
}

function setMeta(name: string, content: string) {
  // Check for property-based tags (og:*) first, then name-based
  const isOg = name.startsWith('og:');
  const selector = isOg ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);

  if (!el) {
    el = document.createElement('meta');
    if (isOg) {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
