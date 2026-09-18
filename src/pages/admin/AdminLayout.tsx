import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { getSupabase } from '../../lib/supabase';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '⊞' },
  { to: '/admin/blog', label: 'Blog', icon: '✎' },
  { to: '/admin/projects', label: 'Projects', icon: '◫' },
  { to: '/admin/seo', label: 'SEO Settings', icon: '◎' },
  { to: '/admin/leads', label: 'Leads', icon: '✉' },
  { to: '/admin/analytics', label: 'Analytics', icon: '▥' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAdminAuth();
  const location = useLocation();
  const [unreadLeads, setUnreadLeads] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { count } = await sb
        .from('contact_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('read', false);
      setUnreadLeads(count ?? 0);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>T</div>
          <span style={styles.logoText}>Admin</span>
        </div>

        <nav style={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.to === '/admin/leads' && unreadLeads > 0 && (
                <span style={styles.badge}>{unreadLeads}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <a
            href="https://tahakhilji.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.viewSiteLink}
          >
            View Site ↗
          </a>
          <div style={styles.userEmail}>{user?.email}</div>
          <button onClick={() => {
            if (window.confirm('Are you sure you want to sign out?')) logout();
          }} style={styles.logoutButton}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0f1e',
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
  },
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0f1e',
    fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    color: '#e2e8f0',
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(8, 14, 30, 0.95)',
    borderRight: '1px solid rgba(100, 160, 240, 0.08)',
    padding: '24px 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(100, 160, 240, 0.08)',
    marginBottom: 8,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #267dff, #579dff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 600,
    color: '#f0f4ff',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '8px 12px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 7,
    fontSize: 13.5,
    fontWeight: 500,
    color: '#7c8aa8',
    textDecoration: 'none',
    transition: 'background 150ms, color 150ms',
  },
  navLinkActive: {
    background: 'rgba(44, 120, 255, 0.12)',
    color: '#e2e8f0',
  },
  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  badge: {
    marginLeft: 'auto',
    padding: '2px 7px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    color: '#fbbf24',
    background: 'rgba(251, 191, 36, 0.12)',
    lineHeight: '16px',
  },
  sidebarFooter: {
    padding: '16px 20px 0',
    borderTop: '1px solid rgba(100, 160, 240, 0.08)',
  },
  viewSiteLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 500,
    color: '#60a5fa',
    textDecoration: 'none',
    background: 'rgba(96, 165, 250, 0.06)',
    border: '1px solid rgba(96, 165, 250, 0.12)',
    marginBottom: 10,
    transition: 'background 150ms',
  },
  userEmail: {
    fontSize: 12,
    color: '#5a6a84',
    marginBottom: 8,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutButton: {
    width: '100%',
    padding: '8px 0',
    borderRadius: 6,
    border: '1px solid rgba(100, 160, 240, 0.12)',
    background: 'transparent',
    color: '#7c8aa8',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 150ms, color 150ms',
  },
  main: {
    flex: 1,
    minWidth: 0,
    padding: '32px 40px',
    overflowY: 'auto',
  },
};
