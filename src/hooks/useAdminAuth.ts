import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Redirects to /admin/login if there is no active Supabase session.
 * Returns the current user/session once authenticated.
 */
export function useAdminAuth() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let sub: { unsubscribe: () => void } | undefined;

    try {
      const sb = getSupabase();

      sb.auth.getSession().then(({ data: { session: s } }) => {
        if (!active) return;
        if (!s) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setSession(s);
        setUser(s.user);
        setLoading(false);
      });

      const result = sb.auth.onAuthStateChange((_event, s) => {
        if (!active) return;
        if (!s) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setSession(s);
        setUser(s.user);
        setLoading(false);
      });

      sub = result.data.subscription;
    } catch {
      // Supabase not configured — redirect to login which shows an error
      navigate('/admin/login', { replace: true });
    }

    return () => {
      active = false;
      sub?.unsubscribe();
    };
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await getSupabase().auth.signOut();
    } catch {
      // ignore
    }
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return { session, user, loading, logout };
}
