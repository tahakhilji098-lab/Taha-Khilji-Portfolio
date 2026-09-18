import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';

export function usePageViewTracking() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    try {
      const sb = getSupabase();
      sb.from('page_views').insert({
        page_path: pathname,
        referrer: document.referrer || null,
        created_at: new Date().toISOString(),
      }).then(() => {}).catch(() => {});
    } catch {
      // Silent fail — don't block rendering
    }
  }, [pathname]);
}
