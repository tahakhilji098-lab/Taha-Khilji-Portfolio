import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [configMissing, setConfigMissing] = useState(false);

  /* If already logged in, skip straight to /admin */
  useEffect(() => {
    try {
      const sb = getSupabase();
      sb.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate('/admin', { replace: true });
        else setCheckingSession(false);
      });
    } catch {
      setConfigMissing(true);
      setCheckingSession(false);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sb = getSupabase();
      const { error: authError } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      navigate('/admin', { replace: true });
    } catch {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Checking session…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>T</div>
          <h1 style={styles.title}>Admin</h1>
          <p style={styles.subtitle}>Sign in to manage your portfolio</p>
        </div>

        {configMissing && (
          <div style={styles.configWarning}>
            <p style={{ margin: 0, fontWeight: 600, marginBottom: 4 }}>Supabase not configured</p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
              Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your{' '}
              <code>.env</code> file, then restart the dev server.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@example.com"
              disabled={configMissing}
            />
          </label>

          <label style={styles.label}>
            <span>Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              disabled={configMissing}
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || configMissing} style={styles.button}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" style={styles.backLink}>← Back to portfolio</Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0f1e',
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: '40px 36px',
    borderRadius: 12,
    background: 'rgba(12, 20, 40, 0.85)',
    border: '1px solid rgba(100, 160, 240, 0.12)',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #267dff, #579dff)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
    color: '#f0f4ff',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: 14,
    color: '#7c8aa8',
  },
  configWarning: {
    padding: '14px 16px',
    borderRadius: 8,
    background: 'rgba(251, 191, 36, 0.08)',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    color: '#fbbf24',
    fontSize: 13,
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: '#94a3b8',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(100, 160, 240, 0.18)',
    background: 'rgba(6, 12, 28, 0.7)',
    color: '#f0f4ff',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 200ms',
  },
  error: {
    margin: 0,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    color: '#f87171',
    background: 'rgba(248, 113, 113, 0.08)',
    border: '1px solid rgba(248, 113, 113, 0.2)',
  },
  button: {
    padding: '11px 0',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #267dff, #4a9bff)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 200ms',
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
    color: '#6882a8',
    textDecoration: 'none',
  },
};
