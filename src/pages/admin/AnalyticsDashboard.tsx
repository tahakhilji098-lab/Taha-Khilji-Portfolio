import React, { useEffect, useState, useCallback } from 'react';
import { getSupabase } from '../../lib/supabase';
import {
  sectionCard, chartBar, statValue, statLabel, statSub, R,
  pageHeader, pageTitle, pageSub, loading as loadingStyle,
} from './adminStyles';

interface DailyViews {
  date: string;
  count: number;
}

interface PageView {
  page_path: string;
  count: number;
}

function formatChange(prev: number, current: number): string {
  if (prev === 0) return current > 0 ? 'New' : '—';
  const pct = Math.round(((current - prev) / prev) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

function changeColor(prev: number, current: number): string {
  if (prev === 0) return current > 0 ? '#4ade80' : '#5a6a84';
  return ((current - prev) / prev) * 100 >= 0 ? '#4ade80' : '#f87171';
}

export default function AnalyticsDashboard() {
  const [totalViews, setTotalViews] = useState(0);
  const [recent7, setRecent7] = useState(0);
  const [prev7, setPrev7] = useState(0);
  const [topPages, setTopPages] = useState<PageView[]>([]);
  const [dailyViews, setDailyViews] = useState<DailyViews[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const sb = getSupabase();
      const now = new Date();
      const d7 = new Date(now); d7.setDate(d7.getDate() - 7);
      const d14 = new Date(now); d14.setDate(d14.getDate() - 14);
      const d30 = new Date(now); d30.setDate(d30.getDate() - 30);

      const { count: total } = await sb
        .from('page_views').select('id', { count: 'exact', head: true });
      setTotalViews(total ?? 0);

      const { count: r7 } = await sb
        .from('page_views').select('id', { count: 'exact', head: true })
        .gte('created_at', d7.toISOString());
      setRecent7(r7 ?? 0);

      const { count: p7 } = await sb
        .from('page_views').select('id', { count: 'exact', head: true })
        .gte('created_at', d14.toISOString())
        .lt('created_at', d7.toISOString());
      setPrev7(p7 ?? 0);

      const { data: allViews } = await sb
        .from('page_views').select('page_path')
        .gte('created_at', d30.toISOString());

      const pageCounts = new Map<string, number>();
      for (const v of allViews ?? []) {
        pageCounts.set(v.page_path, (pageCounts.get(v.page_path) ?? 0) + 1);
      }
      const sorted = [...pageCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([page_path, count]) => ({ page_path, count }));
      setTopPages(sorted);

      const { data: twoWeeks } = await sb
        .from('page_views').select('created_at')
        .gte('created_at', d14.toISOString());

      const dayMap = new Map<string, number>();
      for (let i = 0; i < 14; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - (13 - i));
        dayMap.set(d.toISOString().split('T')[0], 0);
      }
      for (const v of twoWeeks ?? []) {
        const day = new Date(v.created_at).toISOString().split('T')[0];
        if (dayMap.has(day)) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
      }
      setDailyViews([...dayMap.entries()].map(([date, count]) => ({ date, count })));

    } catch (err: any) {
      console.error('Failed to fetch analytics:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const changeText = formatChange(prev7, recent7);
  const changeCol = changeColor(prev7, recent7);
  const maxDaily = Math.max(...dailyViews.map((d) => d.count), 1);
  const maxDailyIdx = dailyViews.findIndex(d => d.count === maxDaily);

  if (loading) return <div style={loadingStyle}>Loading analytics…</div>;

  return (
    <div>
      <h1 style={pageTitle}>Analytics</h1>
      <p style={{ ...pageSub, marginBottom: 28 }}>Basic page view metrics</p>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32 }}>
        <div style={{ ...sectionCard, flex: 1, padding: '20px 24px' }}>
          <span style={statLabel}>Total Views</span>
          <span style={{ ...statValue, color: '#60a5fa' }}>{totalViews.toLocaleString()}</span>
        </div>
        <div style={{ ...sectionCard, flex: 1, padding: '20px 24px' }}>
          <span style={statLabel}>Last 7 Days</span>
          <span style={{ ...statValue, color: '#22d3ee' }}>{recent7.toLocaleString()}</span>
          <span style={{ ...statSub, color: changeCol }}>
            {changeText} vs prev 7d
          </span>
        </div>
      </div>

      {/* Top pages */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Top Pages (Last 30 Days)</h2>
        {topPages.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: '#5a6a84' }}>No page views yet.</p>
        ) : (
          <div style={{ ...sectionCard, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#7c8aa8', background: 'rgba(14, 22, 42, 0.5)', borderBottom: '1px solid rgba(100, 160, 240, 0.08)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Page</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#7c8aa8', background: 'rgba(14, 22, 42, 0.5)', borderBottom: '1px solid rgba(100, 160, 240, 0.08)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p) => (
                  <tr
                    key={p.page_path}
                    style={{ borderBottom: '1px solid rgba(100, 160, 240, 0.05)', transition: 'background 150ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(100,160,240,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '10px 16px', color: '#c8d2e0' }}>{p.page_path}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#e2e8f0' }}>{p.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily chart */}
      <div>
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Views Per Day (Last 14 Days)</h2>
        <div style={{
          display: 'flex', gap: 6, alignItems: 'flex-end', height: 180, padding: '0 4px',
          borderRadius: R.lg, background: 'rgba(14, 22, 42, 0.5)',
          border: '1px solid rgba(100, 160, 240, 0.08)',
        }}>
          {dailyViews.map((d, i) => (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%' }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{
                  width: '100%', minHeight: 2, borderRadius: '3px 3px 0 0',
                  height: `${(d.count / maxDaily) * 100}%`,
                  background: d.count > 0 ? 'linear-gradient(to top, #1d4ed8, #60a5fa)' : 'rgba(100,160,240,0.1)',
                  transition: 'height 300ms ease',
                  boxShadow: i === maxDailyIdx && d.count > 0
                    ? '0 0 12px rgba(96,165,250,0.4)'
                    : d.count > 0 ? '0 0 6px rgba(96,165,250,0.15)' : 'none',
                }} />
              </div>
              <span style={{ fontSize: 9, color: '#5a6a84', whiteSpace: 'nowrap' }}>{d.date.slice(5)}</span>
              <span style={{ fontSize: 10, color: '#7c8aa8', fontWeight: 600 }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
