import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let client: SupabaseClient | null = null;

if (url && key) {
  client = createClient(url, key);
} else {
  console.error(
    '[Supabase] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are missing. ' +
    'Admin dashboard is disabled. Add them to your .env file and restart the dev server.',
  );
}

/**
 * Safe accessor — returns the client or null if env vars are missing.
 * Admin pages should check this before rendering.
 */
export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(
      '[Supabase] Client not initialized. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'are set in your .env file and the dev server has been restarted.',
    );
  }
  return client;
}

/** Convenience re-export — use only in admin pages after checking env vars exist. */
export const supabase = client;
