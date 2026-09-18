import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import {
  cardStyle, sectionCard, statValue, statLabel, statSub,
  badges, chartBar, btn, R,
} from './adminStyles';

interface Lead {
  id: string;
  name: string;
  email: string;
  pipeline_stage: string;
  estimated_value: number | null;
  follow_up_date: string | null;
  created_at: string;
  status: string;
}

interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  created_at: string;
  icon: string;
  color: string;
  bg: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatChange(prev: number, current: number): string {
  if (prev === 0) return current > 0 ? 'New' : '—';
  const pct = Math.round(((current - prev) / prev) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

function changeColor(prev: number, current: number): string {
  if (prev === 0) return current > 0 ? '#4ade80' : '#5a6a84';
  const pct = ((current - prev) / prev) * 100;
  return pct >= 0 ? '#4ade80' : '#f87171';
}

const ACTIVITY_COLORS: Record<string, { color: string; bg: string }> = {
  new_lead:    { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  new_post:    { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
  new_project: { color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  status_change: { color: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
  pipeline_change: { color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  reply_sent:  { color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
  note_added:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  note_updated: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  tag_added:   { color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  tag_removed: { color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  follow_up_set: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  follow_up_cleared: { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  value_updated: { color: '#4ade80', bg: 'rgba(34,197,94,0.12)' },
};

const STAT_ACCENTS = [
  { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', label: '✉' },
  { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   label: '$' },
  { color: '#a78bfa', bg: 'rgba(139,92,246,0.1)',  label: '✎' },
  { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',   label: '◫' },
  { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',   label: '▥' },
];

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [blogPublished, setBlogPublished] = useState(0);
  const [blogDrafts, setBlogDrafts] = useState(0);
  const [projPublished, setProjPublished] = useState(0);
  const [projDrafts, setProjDrafts] = useState(0);
  const [recent7Views, setRecent7Views] = useState(0);
  const [prev7Views, setPrev7Views] = useState(0);
  const [dailyViews, setDailyViews] = useState<{ date: string; count: number }[]>([]);
  const [recentPosts, setRecentPosts] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [recentProjects, setRecentProjects] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const sb = getSupabase();
      const now = new Date();
      const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
      const d14 = new Date(now); d14.setDate(d14.getDate() - 14);

      const [leadsRes, blogAll, projAll, views7, views14, postsRes, projRes, actRes] = await Promise.all([
        sb.from('contact_submissions').select('id, name, email, pipeline_stage, estimated_value, follow_up_date, created_at, status'),
        sb.from('blog_posts').select('id, title, published, created_at'),
        sb.from('projects').select('id, title, created_at'),
        sb.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', d7.toISOString()),
        sb.from('page_views').select('created_at').gte('created_at', d14.toISOString()),
        sb.from('blog_posts').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        sb.from('projects').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        sb.from('lead_activity').select('id, activity_type, description, created_at').order('created_at', { ascending: false }).limit(10),
      ]);

      const allLeads = (leadsRes.data ?? []) as Lead[];
      setLeads(allLeads);

      const allPosts = (blogAll.data ?? []) as any[];
      setBlogPublished(allPosts.filter((p: any) => p.published === true).length);
      setBlogDrafts(allPosts.filter((p: any) => p.published === false).length);

      const allProj = (projAll.data ?? []) as any[];
      setProjPublished(allProj.length);
      setProjDrafts(0);

      setRecent7Views(views7.count ?? 0);
      const d14Views = (views14.data ?? []) as any[];
      const prev7 = d14Views.filter((v: any) => new Date(v.created_at) < d7).length;
      setPrev7Views(prev7);

      const dayMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayMap.set(d.toISOString().split('T')[0], 0);
      }
      for (const v of d14Views) {
        const day = new Date(v.created_at).toISOString().split('T')[0];
        if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      }
      setDailyViews([...dayMap.entries()].map(([date, count]) => ({ date, count })));

      setRecentPosts((postsRes.data ?? []) as any[]);
      setRecentProjects((projRes.data ?? []) as any[]);

      const feed: ActivityEntry[] = [];
      const getColor = (type: string) => ACTIVITY_COLORS[type] || ACTIVITY_COLORS.new_lead;

      for (const a of (actRes.data ?? []) as any[]) {
        const icon = a.activity_type === 'status_change' ? '↻'
          : a.activity_type === 'pipeline_change' ? '→'
          : a.activity_type === 'reply_sent' ? '↩'
          : a.activity_type?.includes('note') ? '✎'
          : a.activity_type?.includes('tag') ? '#'
          : a.activity_type?.includes('follow') ? '⏰'
          : a.activity_type?.includes('value') ? '$'
          : '•';
        const c = getColor(a.activity_type);
        feed.push({ id: `act-${a.id}`, type: a.activity_type, description: a.description, created_at: a.created_at, icon, color: c.color, bg: c.bg });
      }

      const sortedLeads = [...allLeads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      for (const l of sortedLeads.slice(0, 10)) {
        const c = ACTIVITY_COLORS.new_lead;
        feed.push({ id: `lead-${l.id}`, type: 'new_lead', description: `New lead: ${l.name || l.email}`, created_at: l.created_at, icon: '✉', color: c.color, bg: c.bg });
      }
      for (const p of (postsRes.data ?? []) as any[]) {
        const c = ACTIVITY_COLORS.new_post;
        feed.push({ id: `post-${p.id}`, type: 'new_post', description: `New blog post: ${p.title}`, created_at: p.created_at, icon: '✎', color: c.color, bg: c.bg });
      }
      for (const p of (projRes.data ?? []) as any[]) {
        const c = ACTIVITY_COLORS.new_project;
        feed.push({ id: `proj-${p.id}`, type: 'new_project', description: `New project: ${p.title}`, created_at: p.created_at, icon: '◫', color: c.color, bg: c.bg });
      }

      feed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivityFeed(feed.slice(0, 10));

    } catch (err: any) {
      console.error('Dashboard fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const today = new Date().toISOString().slice(0, 10);
  const followUpsDue = useMemo(() =>
    leads.filter(l => l.follow_up_date && l.follow_up_date <= today && l.status !== 'archived'),
    [leads, today]
  );

  const newLeads = leads.filter(l => l.status === 'new').length;
  const pipelineValue = useMemo(() =>
    leads.filter(l => ['new', 'contacted', 'proposal_sent'].includes(l.pipeline_stage))
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0),
    [leads]
  );

  const viewChangeText = formatChange(prev7Views, recent7Views);
  const viewChangeCol = changeColor(prev7Views, recent7Views);
  const maxDaily = Math.max(...dailyViews.map(d => d.count), 1);
  const maxDailyIdx = dailyViews.findIndex(d => d.count === maxDaily);

  if (loading) {
    return <div style={{ padding: 48, color: '#7c8aa8', fontSize: 14 }}>Loading dashboard…</div>;
  }

  const statValues = [leads.length, pipelineValue, blogPublished, projPublished, recent7Views];
  const statSubs = [
    newLeads > 0 ? <span style={{ ...statSub, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{newLeads} new</span> : null,
    <span style={statSub}>Active pipeline</span>,
    <span style={statSub}>{blogDrafts} draft{blogDrafts !== 1 ? 's' : ''}</span>,
    null,
    <span style={{ ...statSub, color: viewChangeCol }}>{viewChangeText} vs prev 7d</span>,
  ];
  const statColors = ['#60a5fa', '#fbbf24', '#a78bfa', '#fb923c', '#22d3ee'];

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 600, color: '#f0f4ff' }}>Dashboard</h1>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#7c8aa8' }}>Welcome back. Here's your portfolio at a glance.</p>

      {/* ── Quick Actions ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <Link to="/admin/blog/new" style={btn.primary}>+ New Blog Post</Link>
        <Link to="/admin/projects/new" style={btn.primary}>+ New Project</Link>
      </div>

      {/* ── Stat Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        {['Total Leads', 'Pipeline Value', 'Blog Posts', 'Projects', 'Views (7d)'].map((label, i) => (
          <div key={label} style={{ ...sectionCard, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={statLabel}>{label}</span>
              <span style={{
                width: 28, height: 28, borderRadius: R.sm, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 13,
                color: STAT_ACCENTS[i].color, background: STAT_ACCENTS[i].bg,
              }}>{STAT_ACCENTS[i].label}</span>
            </div>
            <span style={{ ...statValue, fontSize: 26, color: statColors[i] }}>
              {i === 1 ? `$${statValues[i].toLocaleString()}` : statValues[i].toLocaleString()}
            </span>
            {statSubs[i]}
          </div>
        ))}
      </div>

      {/* ── Follow-ups Due ── */}
      {followUpsDue.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          marginBottom: 24, borderRadius: R.lg,
          background: 'rgba(251, 191, 36, 0.04)',
          border: '1px solid rgba(251, 191, 36, 0.15)',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 15 }}>⏰</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
            {followUpsDue.length} follow-up{followUpsDue.length !== 1 ? 's' : ''} due
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 4 }}>
            {followUpsDue.slice(0, 6).map(l => (
              <Link key={l.id} to="/admin/leads" style={{
                display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
                borderRadius: 999, fontSize: 12, fontWeight: 500, color: '#e2e8f0',
                background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.2)',
                textDecoration: 'none',
              }}>
                {l.name && l.name.length > 2 ? l.name.split(' ')[0] : l.email.split('@')[0]}
                <span style={{ opacity: 0.5, marginLeft: 4 }}>{l.follow_up_date}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Left: Activity Feed */}
        <div style={sectionCard}>
          <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Recent Activity</h2>
          {activityFeed.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#5a6a84', fontStyle: 'italic' }}>No recent activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activityFeed.map(entry => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 8px', borderRadius: R.sm, marginBottom: 1,
                  transition: 'background 150ms',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,240,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: R.sm, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: entry.color, background: entry.bg,
                  }}>{entry.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: '1.4' }}>{entry.description}</div>
                    <div style={{ fontSize: 11, color: '#5a6a84', marginTop: 2 }}>{relativeTime(entry.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Follow-ups + Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={sectionCard}>
            <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Follow-ups Due</h2>
            {followUpsDue.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#5a6a84', fontStyle: 'italic' }}>No follow-ups due today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {followUpsDue.slice(0, 5).map(l => (
                  <Link key={l.id} to="/admin/leads" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: R.sm, fontSize: 13, color: '#e2e8f0',
                    textDecoration: 'none', background: 'rgba(14, 22, 42, 0.4)',
                    border: '1px solid rgba(100, 160, 240, 0.04)',
                  }}>
                    <div>
                      <span style={{ fontWeight: 500, marginRight: 8 }}>{l.name && l.name.length > 2 ? l.name : l.email}</span>
                      <span style={{ fontSize: 11, color: l.follow_up_date! <= today ? '#f87171' : '#94a3b8' }}>{l.follow_up_date}</span>
                    </div>
                    <span style={{ width: 7, height: 7, borderRadius: 4, flexShrink: 0, background: l.pipeline_stage === 'won' ? '#4ade80' : l.pipeline_stage === 'lost' ? '#f87171' : '#60a5fa' }} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={sectionCard}>
            <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>Page Views (7d)</h2>
            <div style={{ display: 'flex', gap: 6, height: 80, alignItems: 'flex-end', paddingTop: 8 }}>
              {dailyViews.map((dv, i) => (
                <div key={dv.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div style={{
                      width: '80%', maxWidth: 28, borderRadius: 3,
                      height: `${(dv.count / maxDaily) * 100}%`,
                      background: dv.count > 0
                        ? `linear-gradient(to top, #1d4ed8, #60a5fa)`
                        : 'rgba(100,160,240,0.1)',
                      transition: 'height 300ms ease',
                      boxShadow: dv.count === maxDaily && dv.count > 0
                        ? '0 0 12px rgba(96,165,250,0.4)'
                        : dv.count > 0 ? '0 0 6px rgba(96,165,250,0.15)' : 'none',
                    }} />
                  </div>
                  <div style={{ fontSize: 9, color: '#5a6a84', marginTop: 4 }}>
                    {new Date(dv.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <Link to="/admin/blog" style={{
          ...sectionCard, display: 'flex', flexDirection: 'column', gap: 4,
          textDecoration: 'none', color: '#e2e8f0',
        }}>
          <span style={{ ...statValue, fontSize: 32, color: '#a78bfa' }}>{blogPublished}</span>
          <span style={statLabel}>Blog Posts</span>
          {blogDrafts > 0 && <span style={statSub}>{blogDrafts} draft{blogDrafts !== 1 ? 's' : ''}</span>}
        </Link>
        <Link to="/admin/projects" style={{
          ...sectionCard, display: 'flex', flexDirection: 'column', gap: 4,
          textDecoration: 'none', color: '#e2e8f0',
        }}>
          <span style={{ ...statValue, fontSize: 32, color: '#fb923c' }}>{projPublished}</span>
          <span style={statLabel}>Projects</span>
        </Link>
        <Link to="/admin/leads" style={{
          ...sectionCard, display: 'flex', flexDirection: 'column', gap: 4,
          textDecoration: 'none', color: '#e2e8f0',
        }}>
          <span style={{ ...statValue, fontSize: 32, color: '#60a5fa' }}>{leads.length}</span>
          <span style={statLabel}>Leads</span>
          {newLeads > 0 && <span style={statSub}>{newLeads} new</span>}
        </Link>
      </div>
    </div>
  );
}
