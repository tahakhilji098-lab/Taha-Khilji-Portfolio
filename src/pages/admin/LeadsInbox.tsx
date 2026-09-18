import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getSupabase } from '../../lib/supabase';

type LeadStatus = 'new' | 'replied' | 'archived';
type PipelineStage = 'new' | 'contacted' | 'proposal_sent' | 'won' | 'lost';
type ViewMode = 'list' | 'pipeline';
type Tab = 'leads' | 'overview';

const PIPELINE_STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'new', label: 'New', color: '#60a5fa' },
  { key: 'contacted', label: 'Contacted', color: '#a78bfa' },
  { key: 'proposal_sent', label: 'Proposal Sent', color: '#fbbf24' },
  { key: 'won', label: 'Won', color: '#4ade80' },
  { key: 'lost', label: 'Lost', color: '#f87171' },
];

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  status: LeadStatus;
  pipeline_stage: PipelineStage;
  tags: string[];
  estimated_value: number | null;
  notes: string;
  starred: boolean;
  follow_up_date: string | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  created_at: string;
}

type FilterTab = 'all' | 'new' | 'replied' | 'archived' | 'starred';
type SortDir = 'newest' | 'oldest';
const PAGE_SIZE = 20;

// ── Activity logging helper ──

async function logActivity(leadId: string, type: string, description: string) {
  try {
    const sb = getSupabase();
    await sb.from('lead_activity').insert({ lead_id: leadId, activity_type: type, description });
  } catch (err: any) {
    console.error('Failed to log activity:', err.message);
  }
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

const statusColor = (status: LeadStatus) => {
  switch (status) {
    case 'new': return { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)' };
    case 'replied': return { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' };
    case 'archived': return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' };
  }
};

const truncate = (text: string, max: number) =>
  text.length > max ? text.slice(0, max) + '…' : text;

// ════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════

export default function LeadsInbox() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeTab, setActiveTab] = useState<Tab>('leads');

  // Search, filter, sort
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [sortDir, setSortDir] = useState<SortDir>('newest');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Pagination
  const [page, setPage] = useState(0);

  // Notes editing
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Tags
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  // Estimated value editing
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [valueDraft, setValueDraft] = useState('');

  // Activity
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads((data ?? []).map((l: any) => ({
        ...l,
        status: l.status || 'new',
        pipeline_stage: l.pipeline_stage || 'new',
        tags: l.tags || [],
        estimated_value: l.estimated_value ?? null,
        notes: l.notes || '',
        starred: l.starred ?? false,
        follow_up_date: l.follow_up_date || null,
      })));
    } catch (err: any) {
      console.error('Failed to fetch leads:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTags = useCallback(async () => {
    try {
      const sb = getSupabase();
      const { data, error } = await sb.from('contact_submissions').select('tags');
      if (error) throw error;
      const tags = new Set<string>();
      (data ?? []).forEach((l: any) => (l.tags ?? []).forEach((t: string) => tags.add(t)));
      setAllTags(Array.from(tags).sort());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLeads(); fetchAllTags(); }, [fetchLeads, fetchAllTags]);
  useEffect(() => { setPage(0); }, [search, filter, sortDir]);

  // Fetch activity when expanded changes
  useEffect(() => {
    if (!expandedId) { setActivities([]); return; }
    let cancelled = false;
    (async () => {
      setLoadingActivity(true);
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('lead_activity')
          .select('*')
          .eq('lead_id', expandedId)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!cancelled && !error) setActivities(data ?? []);
      } catch { /* ignore */ }
      if (!cancelled) setLoadingActivity(false);
    })();
    return () => { cancelled = true; };
  }, [expandedId]);

  // ── Derived data ──

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filter === 'starred') {
      result = result.filter(l => l.starred);
    } else if (filter !== 'all') {
      result = result.filter(l => l.status === filter);
    }
    result.sort((a, b) =>
      sortDir === 'newest'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    return result;
  }, [leads, search, filter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const pageStart = safePage * PAGE_SIZE + 1;
  const pageEnd = Math.min((safePage + 1) * PAGE_SIZE, filtered.length);

  const unreadCount = leads.filter(l => !l.read).length;
  const allVisibleSelected = paged.length > 0 && paged.every(l => selected.has(l.id));

  // Follow-ups due
  const today = new Date().toISOString().slice(0, 10);
  const followUpsDue = useMemo(() =>
    leads.filter(l => l.follow_up_date && l.follow_up_date <= today && l.status !== 'archived'),
    [leads, today]
  );

  // Pipeline column data
  const pipelineColumns = useMemo(() => {
    const cols: Record<PipelineStage, Lead[]> = { new: [], contacted: [], proposal_sent: [], won: [], lost: [] };
    filtered.forEach(l => { cols[l.pipeline_stage].push(l); });
    return cols;
  }, [filtered]);

  const wonTotal = useMemo(() =>
    pipelineColumns.won.reduce((sum, l) => sum + (l.estimated_value || 0), 0), [pipelineColumns.won]);
  const pipelineValue = useMemo(() =>
    [...pipelineColumns.new, ...pipelineColumns.contacted, ...pipelineColumns.proposal_sent]
      .reduce((sum, l) => sum + (l.estimated_value || 0), 0), [pipelineColumns]);

  // ── Helpers ──

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatCurrency = (v: number | null) => {
    if (v == null || v === 0) return null;
    return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const displayName = (lead: Lead) => {
    const n = (lead.name || '').trim();
    return n.length > 2 ? n : lead.email;
  };

  // ── Actions ──

  const handleRowClick = async (lead: Lead) => {
    if (expandedId === lead.id) { setExpandedId(null); return; }
    setExpandedId(lead.id);
    if (!lead.read) {
      try {
        const sb = getSupabase();
        await sb.from('contact_submissions').update({ read: true }).eq('id', lead.id);
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, read: true } : l));
      } catch (err: any) { console.error('Failed to mark as read:', err.message); }
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    const oldStatus = lead.status;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ status: newStatus }).eq('id', leadId);
      await logActivity(leadId, 'status_change', `Status changed from ${oldStatus} to ${newStatus}`);
    } catch (err: any) { console.error('Failed to update status:', err.message); }
  };

  const handlePipelineChange = async (leadId: string, stage: PipelineStage) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.pipeline_stage === stage) return;
    const oldStage = lead.pipeline_stage;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipeline_stage: stage } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ pipeline_stage: stage }).eq('id', leadId);
      const oldLabel = PIPELINE_STAGES.find(s => s.key === oldStage)?.label || oldStage;
      const newLabel = PIPELINE_STAGES.find(s => s.key === stage)?.label || stage;
      await logActivity(leadId, 'pipeline_change', `Pipeline changed from ${oldLabel} to ${newLabel}`);
    } catch (err: any) { console.error('Failed to update pipeline:', err.message); }
  };

  const handleStarToggle = async (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const newVal = !lead.starred;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, starred: newVal } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ starred: newVal }).eq('id', leadId);
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, starred: !newVal } : l));
    }
  };

  const handleReply = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    if (lead.status !== 'replied') await handleStatusChange(lead.id, 'replied');
    await logActivity(lead.id, 'reply_sent', `Reply email opened for ${lead.email}`);
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent('Re: your message')}`, '_blank');
  };

  const handleDelete = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    if (!window.confirm(`Delete this message from ${displayName(lead)}? This can't be undone.`)) return;
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').delete().eq('id', lead.id);
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      if (expandedId === lead.id) setExpandedId(null);
      setSelected(prev => { const n = new Set(prev); n.delete(lead.id); return n; });
    } catch (err: any) { console.error('Failed to delete:', err.message); }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Delete ${selected.size} message${selected.size > 1 ? 's' : ''}? This can't be undone.`)) return;
    try {
      const sb = getSupabase();
      const ids = Array.from(selected);
      for (let i = 0; i < ids.length; i += 50) {
        await sb.from('contact_submissions').delete().in('id', ids.slice(i, i + 50));
      }
      setLeads(prev => prev.filter(l => !selected.has(l.id)));
      if (expandedId && selected.has(expandedId)) setExpandedId(null);
      setSelected(new Set());
    } catch (err: any) { console.error('Failed to bulk delete:', err.message); }
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(prev => { const n = new Set(prev); paged.forEach(l => n.delete(l.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); paged.forEach(l => n.add(l.id)); return n; });
    }
  };

  // Tags
  const addTag = async (leadId: string, tag: string) => {
    const t = tag.trim();
    if (!t) return;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.tags.includes(t)) return;
    const newTags = [...lead.tags, t];
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tags: newTags } : l));
    setAllTags(prev => prev.includes(t) ? prev : [...prev, t].sort());
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ tags: newTags }).eq('id', leadId);
      await logActivity(leadId, 'tag_added', `Tag "${t}" added`);
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tags: lead.tags } : l));
    }
  };

  const removeTag = async (leadId: string, tag: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const newTags = lead.tags.filter(t => t !== tag);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tags: newTags } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ tags: newTags }).eq('id', leadId);
      await logActivity(leadId, 'tag_removed', `Tag "${tag}" removed`);
    } catch {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tags: lead.tags } : l));
    }
  };

  // Estimated value
  const saveValue = async (leadId: string) => {
    setEditingValueId(null);
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    const num = valueDraft.trim() === '' ? null : parseFloat(valueDraft.replace(/[^0-9.]/g, ''));
    if (num !== null && Number.isNaN(num)) return;
    if (num === (lead.estimated_value ?? null)) return;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estimated_value: num } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ estimated_value: num }).eq('id', leadId);
      await logActivity(leadId, 'value_updated', `Estimated value set to ${num != null ? formatCurrency(num) : 'cleared'}`);
    } catch (err: any) { console.error('Failed to save value:', err.message); }
  };

  // Notes
  const startEditNotes = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setEditingNotesId(lead.id);
    setNotesDraft(lead.notes || '');
  };

  const saveNotes = async (leadId: string) => {
    setEditingNotesId(null);
    const lead = leads.find(l => l.id === leadId);
    if (!lead || notesDraft === (lead.notes || '')) return;
    const oldNotes = lead.notes || '';
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes: notesDraft } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ notes: notesDraft }).eq('id', leadId);
      if (oldNotes && notesDraft) {
        await logActivity(leadId, 'note_updated', 'Private notes updated');
      } else if (!oldNotes && notesDraft) {
        await logActivity(leadId, 'note_added', 'Private note added');
      }
    } catch (err: any) { console.error('Failed to save notes:', err.message); }
  };

  // Follow-up date
  const saveFollowUpDate = async (leadId: string, date: string | null) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, follow_up_date: date } : l));
    try {
      const sb = getSupabase();
      await sb.from('contact_submissions').update({ follow_up_date: date }).eq('id', leadId);
      if (date) {
        await logActivity(leadId, 'follow_up_set', `Follow-up scheduled for ${date}`);
      } else {
        await logActivity(leadId, 'follow_up_cleared', 'Follow-up removed');
      }
    } catch (err: any) { console.error('Failed to save follow-up:', err.message); }
  };

  // CSV export
  const exportCsv = () => {
    const header = 'Name,Email,Message,Status,Pipeline,Tags,Estimated Value,Follow-up,Starred,Submitted\n';
    const rows = filtered.map(l => {
      const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`;
      return [
        esc(l.name), esc(l.email), esc(l.message),
        l.status, l.pipeline_stage, esc(l.tags.join('; ')),
        l.estimated_value ?? '', l.follow_up_date || '', l.starred ? 'Yes' : 'No', esc(formatDate(l.created_at)),
      ].join(',');
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Drag & Drop ──
  const onDragStart = (e: React.DragEvent, leadId: string) => {
    setDragId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', leadId);
  };
  const onDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverStage(stage);
  };
  const onDragLeave = () => setDragOverStage(null);
  const onDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault(); setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.pipeline_stage === stage) return;
    handlePipelineChange(leadId, stage);
    setDragId(null);
  };
  const onDragEnd = () => { setDragId(null); setDragOverStage(null); };

  // ── Render ──
  if (loading) return <div style={s.loading}>Loading leads…</div>;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'new', label: 'New' },
    { key: 'replied', label: 'Replied' }, { key: 'archived', label: 'Archived' }, { key: 'starred', label: 'Starred' },
  ];

  return (
    <div>
      {/* Header with tab switcher */}
      <div style={s.header}>
        <div>
          <h1 style={s.heading}>Leads</h1>
          <p style={s.sub}>
            {leads.length} submission{leads.length !== 1 ? 's' : ''}
            {unreadCount > 0 && <span style={s.unreadBadge}>{unreadCount} unread</span>}
            {viewMode === 'pipeline' && (
              <span style={{ fontSize: 12, color: '#5a6a84' }}>
                {pipelineValue > 0 && <>Pipeline: {formatCurrency(pipelineValue)} · </>}
                Won: {formatCurrency(wonTotal) || '$0'}
              </span>
            )}
          </p>
        </div>
        <div style={s.headerActions}>
          <div style={s.viewToggle}>
            <button onClick={() => setActiveTab('leads')} style={{ ...s.viewBtn, ...(activeTab === 'leads' ? s.viewBtnActive : {}) }}>Leads</button>
            <button onClick={() => setActiveTab('overview')} style={{ ...s.viewBtn, ...(activeTab === 'overview' ? s.viewBtnActive : {}) }}>Overview</button>
          </div>
        </div>
      </div>

      {/* ═══════ OVERVIEW TAB ═══════ */}
      {activeTab === 'overview' && <StatsDashboard leads={leads} />}

      {/* ═══════ LEADS TAB ═══════ */}
      {activeTab === 'leads' && (
        <>
          {/* Follow-ups due banner */}
          {followUpsDue.length > 0 && (
            <div style={s.followUpBanner}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>Follow-ups due:</span>
              {followUpsDue.slice(0, 6).map(l => (
                <button key={l.id} onClick={() => { setActiveTab('leads'); handleRowClick(l); }}
                  style={s.followUpChip}>
                  {displayName(l)}
                  {l.follow_up_date && <span style={{ opacity: 0.6, marginLeft: 4 }}>{l.follow_up_date}</span>}
                </button>
              ))}
              {followUpsDue.length > 6 && <span style={{ fontSize: 12, color: '#7c8aa8' }}>+{followUpsDue.length - 6} more</span>}
            </div>
          )}

          {/* View toggle + Export + Toolbar */}
          <div style={s.toolbar}>
            <div style={s.searchWrap}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, message, tags…" style={s.searchInput} />
              {search && <button onClick={() => setSearch('')} style={s.searchClear}>×</button>}
            </div>
            <div style={s.toolbarRow}>
              <div style={s.tabs}>
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setFilter(t.key)}
                    style={{ ...s.tab, ...(filter === t.key ? s.tabActive : {}) }}>
                    {t.label}
                    {t.key === 'new' && leads.filter(l => l.status === 'new').length > 0 && (
                      <span style={s.tabCount}>{leads.filter(l => l.status === 'new').length}</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={s.toolbarRight}>
                <div style={s.viewToggle}>
                  <button onClick={() => setViewMode('list')} style={{ ...s.viewBtn, ...(viewMode === 'list' ? s.viewBtnActive : {}) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    List
                  </button>
                  <button onClick={() => setViewMode('pipeline')} style={{ ...s.viewBtn, ...(viewMode === 'pipeline' ? s.viewBtnActive : {}) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                    Pipeline
                  </button>
                </div>
                {viewMode === 'list' && selected.size > 0 && (
                  <button onClick={handleBulkDelete} style={s.bulkDeleteBtn}>Delete selected ({selected.size})</button>
                )}
                {viewMode === 'list' && (
                  <button onClick={() => setSortDir(d => d === 'newest' ? 'oldest' : 'newest')} style={s.sortBtn}>
                    {sortDir === 'newest' ? '↓ Newest' : '↑ Oldest'}
                  </button>
                )}
                <button onClick={exportCsv} style={s.exportBtn} disabled={filtered.length === 0}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* ═══════ LIST VIEW ═══════ */}
          {viewMode === 'list' && (
            filtered.length === 0 ? (
              <div style={s.empty}>
                <p style={s.emptyTitle}>{leads.length === 0 ? 'No submissions yet' : 'No matches'}</p>
                <p style={s.emptySub}>{leads.length === 0 ? 'Messages from the contact form will appear here.' : 'Try adjusting your search or filter.'}</p>
              </div>
            ) : (
              <>
                <div style={s.list}>
                  <div style={s.tableHeader}>
                    <div style={s.thCheck}><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} style={s.checkbox} /></div>
                    <div style={s.thStar} />
                    <div style={s.thName}>From</div>
                    <div style={s.thMessage}>Message</div>
                    <div style={s.thTags}>Tags</div>
                    <div style={s.thStatus}>Status</div>
                    <div style={s.thDate}>Date</div>
                    <div style={s.thActions}>Actions</div>
                  </div>

                  {paged.map(lead => {
                    const sc = statusColor(lead.status);
                    const isExpanded = expandedId === lead.id;
                    const isShortName = !(lead.name || '').trim() || lead.name.trim().length <= 2;
                    const hasFollowUp = !!lead.follow_up_date && lead.follow_up_date <= today;
                    return (
                      <div key={lead.id} style={{ ...s.row, ...(isExpanded ? s.rowExpanded : {}) }} onClick={() => handleRowClick(lead)}>
                        <div style={s.rowMain}>
                          <div style={s.rCheck} onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selected.has(lead.id)}
                              onChange={() => setSelected(prev => { const n = new Set(prev); if (n.has(lead.id)) n.delete(lead.id); else n.add(lead.id); return n; })}
                              style={s.checkbox} />
                          </div>
                          <div style={s.rStar} onClick={e => toggleStarToggle(e, lead.id)}>
                            {lead.starred ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            )}
                          </div>
                          <div style={s.rName}>
                            <div style={{ ...s.name, color: '#e2e8f0' }}>
                              {!lead.read && <span style={s.dot} />}
                              {hasFollowUp && <span style={s.followUpDot} title={`Follow-up: ${lead.follow_up_date}`} />}
                              {displayName(lead)}
                            </div>
                            {!isShortName && <div style={s.email}>{lead.email}</div>}
                          </div>
                          <div style={s.rMessage}>{truncate(lead.message, 50)}</div>
                          <div style={s.rTags}>
                            {lead.tags.slice(0, 3).map(t => <span key={t} style={s.tagChip}>{t}</span>)}
                            {lead.tags.length > 3 && <span style={s.tagChip}>+{lead.tags.length - 3}</span>}
                          </div>
                          <div style={s.rStatus}>
                            <span style={{ ...s.badge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                              <span style={{ width: 6, height: 6, borderRadius: 3, background: sc.color, flexShrink: 0 }} />
                              {lead.status}
                            </span>
                          </div>
                          <div style={s.rDate}>{formatDate(lead.created_at)}</div>
                          <div style={s.rActions} onClick={e => e.stopPropagation()}>
                            <button onClick={e => handleReply(e, lead)} style={s.actionBtn} title="Reply">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>
                            </button>
                            <button onClick={e => handleDelete(e, lead)} style={{ ...s.actionBtn, color: '#ef4444' }} title="Delete">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <LeadDetail lead={lead} activities={activities} loadingActivity={loadingActivity}
                            editingNotesId={editingNotesId} notesDraft={notesDraft} setNotesDraft={setNotesDraft}
                            startEditNotes={startEditNotes} saveNotes={saveNotes}
                            handleStatusChange={handleStatusChange} handleReply={handleReply} handleDelete={handleDelete}
                            editingValueId={editingValueId} setEditingValueId={setEditingValueId}
                            valueDraft={valueDraft} setValueDraft={setValueDraft} saveValue={saveValue}
                            tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} allTags={allTags}
                            formatCurrency={formatCurrency} handlePipelineChange={handlePipelineChange}
                            saveFollowUpDate={saveFollowUpDate} today={today} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {filtered.length > PAGE_SIZE && (
                  <div style={s.pagination}>
                    <span style={s.pageInfo}>Showing {pageStart}–{pageEnd} of {filtered.length}</span>
                    <div style={s.pageBtns}>
                      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} style={{ ...s.pageBtn, opacity: safePage === 0 ? 0.35 : 1 }}>Previous</button>
                      <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1} style={{ ...s.pageBtn, opacity: safePage >= totalPages - 1 ? 0.35 : 1 }}>Next</button>
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {/* ═══════ PIPELINE VIEW ═══════ */}
          {viewMode === 'pipeline' && (
            <div style={s.pipeline}>
              {PIPELINE_STAGES.map(stage => {
                const colLeads = pipelineColumns[stage.key];
                const isOver = dragOverStage === stage.key;
                return (
                  <div key={stage.key} style={{ ...s.col, ...(isOver ? s.colOver : {}) }}
                    onDragOver={e => onDragOver(e, stage.key)} onDragLeave={onDragLeave} onDrop={e => onDrop(e, stage.key)}>
                    <div style={s.colHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: stage.color, flexShrink: 0 }} />
                        <span style={s.colTitle}>{stage.label}</span>
                        <span style={s.colCount}>{colLeads.length}</span>
                      </div>
                      {stage.key === 'won' && colLeads.reduce((s2, l) => s2 + (l.estimated_value || 0), 0) > 0 && (
                        <span style={s.colTotal}>{formatCurrency(colLeads.reduce((s2, l) => s2 + (l.estimated_value || 0), 0))}</span>
                      )}
                    </div>
                    <div style={s.colCards}>
                      {colLeads.map(lead => {
                        const hasFollowUp = !!lead.follow_up_date && lead.follow_up_date <= today;
                        return (
                          <div key={lead.id} draggable onDragStart={e => onDragStart(e, lead.id)} onDragEnd={onDragEnd}
                            style={{ ...s.card, ...(dragId === lead.id ? s.cardDragging : {}), ...(expandedId === lead.id ? s.cardExpanded : {}) }}
                            onClick={() => handleRowClick(lead)}>
                            <div style={s.cardTop}>
                              <div style={{ ...s.name, fontSize: 13, color: '#e2e8f0' }}>
                                {!lead.read && <span style={s.dot} />}
                                {hasFollowUp && <span style={s.followUpDot} title={`Follow-up: ${lead.follow_up_date}`} />}
                                {displayName(lead)}
                              </div>
                              <div style={s.cardStar} onClick={e => toggleStarToggle(e, lead.id)}>
                                {lead.starred ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5a6a84" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                )}
                              </div>
                            </div>
                            <div style={s.cardEmail}>{lead.email}</div>
                            <div style={s.cardPreview}>{truncate(lead.message, 80)}</div>
                            {lead.estimated_value != null && lead.estimated_value > 0 && <div style={s.cardValue}>{formatCurrency(lead.estimated_value)}</div>}
                            {lead.tags.length > 0 && (
                              <div style={s.cardTags}>
                                {lead.tags.slice(0, 3).map(t => <span key={t} style={s.tagChipSm}>{t}</span>)}
                                {lead.tags.length > 3 && <span style={s.tagChipSm}>+{lead.tags.length - 3}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {colLeads.length === 0 && <div style={s.colEmpty}>Drop leads here</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pipeline detail modal */}
          {viewMode === 'pipeline' && expandedId && (() => {
            const lead = leads.find(l => l.id === expandedId);
            if (!lead) return null;
            return (
              <div style={s.pipelineDetailOverlay} onClick={() => setExpandedId(null)}>
                <div style={s.pipelineDetailCard} onClick={e => e.stopPropagation()}>
                  <div style={s.pipelineDetailHeader}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f0f4ff' }}>{displayName(lead)}</h3>
                    <button onClick={() => setExpandedId(null)} style={s.closeBtn}>×</button>
                  </div>
                  <LeadDetail lead={lead} activities={activities} loadingActivity={loadingActivity}
                    editingNotesId={editingNotesId} notesDraft={notesDraft} setNotesDraft={setNotesDraft}
                    startEditNotes={startEditNotes} saveNotes={saveNotes}
                    handleStatusChange={handleStatusChange} handleReply={handleReply} handleDelete={handleDelete}
                    editingValueId={editingValueId} setEditingValueId={setEditingValueId}
                    valueDraft={valueDraft} setValueDraft={setValueDraft} saveValue={saveValue}
                    tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} allTags={allTags}
                    formatCurrency={formatCurrency} handlePipelineChange={handlePipelineChange}
                    saveFollowUpDate={saveFollowUpDate} today={today} />
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════
// LEAD DETAIL COMPONENT
// ════════════════════════════════════════════

interface DetailProps {
  lead: Lead; activities: ActivityLog[]; loadingActivity: boolean;
  editingNotesId: string | null; notesDraft: string;
  setNotesDraft: React.Dispatch<React.SetStateAction<string>>;
  startEditNotes: (e: React.MouseEvent, lead: Lead) => void;
  saveNotes: (id: string) => void;
  handleStatusChange: (id: string, status: LeadStatus) => void;
  handleReply: (e: React.MouseEvent, lead: Lead) => void;
  handleDelete: (e: React.MouseEvent, lead: Lead) => void;
  editingValueId: string | null;
  setEditingValueId: React.Dispatch<React.SetStateAction<string | null>>;
  valueDraft: string; setValueDraft: React.Dispatch<React.SetStateAction<string>>;
  saveValue: (id: string) => void;
  tagInput: string; setTagInput: React.Dispatch<React.SetStateAction<string>>;
  addTag: (id: string, tag: string) => void; removeTag: (id: string, tag: string) => void;
  allTags: string[]; formatCurrency: (v: number | null) => string | null;
  handlePipelineChange: (id: string, stage: PipelineStage) => void;
  saveFollowUpDate: (id: string, date: string | null) => void;
  today: string;
}

function LeadDetail({
  lead, activities, loadingActivity,
  editingNotesId, notesDraft, setNotesDraft, startEditNotes, saveNotes,
  handleStatusChange, handleReply, handleDelete,
  editingValueId, setEditingValueId, valueDraft, setValueDraft, saveValue,
  tagInput, setTagInput, addTag, removeTag, allTags, formatCurrency,
  handlePipelineChange, saveFollowUpDate, today,
}: DetailProps) {
  const [detailTab, setDetailTab] = useState<'info' | 'activity'>('info');
  const tagInputId = `tag-input-${lead.id}`;
  const isOverdue = lead.follow_up_date && lead.follow_up_date <= today;

  return (
    <div style={d.expanded} onClick={e => e.stopPropagation()}>
      {/* Detail tabs */}
      <div style={d.tabBar}>
        <button onClick={() => setDetailTab('info')} style={{ ...d.tab, ...(detailTab === 'info' ? d.tabActive : {}) }}>Info</button>
        <button onClick={() => setDetailTab('activity')} style={{ ...d.tab, ...(detailTab === 'activity' ? d.tabActive : {}) }}>
          Activity
          {activities.length > 0 && <span style={d.tabBadge}>{activities.length}</span>}
        </button>
      </div>

      {detailTab === 'info' && (
        <>
          <div style={d.section}>
            <div style={d.label}>Message</div>
            <p style={d.messageText}>{lead.message}</p>
          </div>

          <div style={d.section}>
            <div style={d.label}>Status</div>
            <div style={d.row}>
              {(['new', 'replied', 'archived'] as LeadStatus[]).map(st => (
                <button key={st} onClick={() => handleStatusChange(lead.id, st)}
                  style={{ ...d.btn, ...(lead.status === st ? { background: statusColor(st).bg, color: statusColor(st).color, borderColor: statusColor(st).border } : {}) }}>
                  {st === 'new' ? 'Mark New' : st === 'replied' ? 'Mark Replied' : 'Archive'}
                </button>
              ))}
            </div>
          </div>

          <div style={d.section}>
            <div style={d.label}>Pipeline Stage</div>
            <div style={d.row}>
              {PIPELINE_STAGES.map(ps => (
                <button key={ps.key} onClick={() => handlePipelineChange(lead.id, ps.key)}
                  style={{ ...d.btn, ...(lead.pipeline_stage === ps.key ? { background: `${ps.color}18`, color: ps.color, borderColor: `${ps.color}40` } : {}) }}>
                  {ps.label}
                </button>
              ))}
            </div>
          </div>

          <div style={d.section}>
            <div style={d.label}>Tags</div>
            <div style={d.tagsWrap}>
              {lead.tags.map(t => (
                <span key={t} style={d.tagChip}>{t}<button onClick={() => removeTag(lead.id, t)} style={d.tagRemove}>×</button></span>
              ))}
              <input id={tagInputId} value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(lead.id, tagInput); setTagInput(''); } }}
                placeholder="Add tag…" style={d.tagInput} list={`${tagInputId}-list`} />
              <datalist id={`${tagInputId}-list`}>
                {allTags.filter(t => !lead.tags.includes(t)).map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          <div style={d.section}>
            <div style={d.label}>Estimated Value</div>
            {editingValueId === lead.id ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#7c8aa8', fontSize: 13 }}>$</span>
                <input type="text" value={valueDraft} onChange={e => setValueDraft(e.target.value)}
                  onBlur={() => saveValue(lead.id)} onKeyDown={e => { if (e.key === 'Enter') saveValue(lead.id); }}
                  placeholder="0" style={d.valueInput} autoFocus />
              </div>
            ) : (
              <div style={d.valueDisplay} onClick={() => { setEditingValueId(lead.id); setValueDraft(lead.estimated_value?.toString() || ''); }}>
                {formatCurrency(lead.estimated_value) || <span style={{ color: '#5a6a84' }}>Click to set value…</span>}
              </div>
            )}
          </div>

          <div style={d.section}>
            <div style={d.label}>Follow-up Date</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="date" value={lead.follow_up_date || ''}
                onChange={e => saveFollowUpDate(lead.id, e.target.value || null)}
                style={{ ...d.valueInput, width: 'auto', colorScheme: 'dark' }} />
              {isOverdue && <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>Overdue</span>}
            </div>
          </div>

          <div style={d.section}>
            <div style={d.label}>Private notes</div>
            {editingNotesId === lead.id ? (
              <div>
                <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)}
                  placeholder="Add a private note…" style={d.notesInput} autoFocus />
                <button onClick={() => saveNotes(lead.id)} style={d.saveBtn}>Save</button>
              </div>
            ) : (
              <div style={d.notesDisplay} onClick={e => startEditNotes(e, lead)}>
                {lead.notes || <span style={{ color: '#5a6a84' }}>Click to add notes…</span>}
              </div>
            )}
          </div>

          <div style={{ ...d.section, display: 'flex', gap: 8 }}>
            <button onClick={e => handleReply(e, lead)} style={d.actionBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 00-4-4H4"/></svg>
              Reply
            </button>
            <button onClick={e => handleDelete(e, lead)} style={{ ...d.actionBtn, color: '#fca5a5', borderColor: 'rgba(239,68,68,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Delete
            </button>
          </div>
        </>
      )}

      {detailTab === 'activity' && (
        <div style={d.activitySection}>
          {loadingActivity ? (
            <div style={{ padding: 16, color: '#7c8aa8', fontSize: 13 }}>Loading activity…</div>
          ) : activities.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#5a6a84', fontSize: 13 }}>No activity recorded yet.</div>
          ) : (
            <div style={d.timeline}>
              {activities.map((act, i) => (
                <div key={act.id} style={d.timelineItem}>
                  <div style={{ ...d.timelineDot, background: activityDotColor(act.activity_type) }} />
                  {i < activities.length - 1 && <div style={d.timelineLine} />}
                  <div style={d.timelineContent}>
                    <div style={d.timelineDesc}>{act.description}</div>
                    <div style={d.timelineTime}>{relativeTime(act.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function activityDotColor(type: string): string {
  switch (type) {
    case 'status_change': return '#60a5fa';
    case 'pipeline_change': return '#a78bfa';
    case 'reply_sent': return '#4ade80';
    case 'note_added': case 'note_updated': return '#fbbf24';
    case 'tag_added': case 'tag_removed': return '#34d399';
    case 'value_updated': return '#2dd4bf';
    case 'follow_up_set': case 'follow_up_cleared': return '#f472b6';
    default: return '#94a3b8';
  }
}

// ════════════════════════════════════════════
// STATS DASHBOARD
// ════════════════════════════════════════════

function StatsDashboard({ leads }: { leads: Lead[] }) {
  const now = new Date();
  const thisMonth = leads.filter(l => {
    const d = new Date(l.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = leads.filter(l => {
    const d = new Date(l.created_at);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });
  const monthChange = lastMonth.length > 0
    ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
    : thisMonth.length > 0 ? 100 : 0;

  const wonLeads = leads.filter(l => l.pipeline_stage === 'won');
  const lostLeads = leads.filter(l => l.pipeline_stage === 'lost');
  const conversionRate = (wonLeads.length + lostLeads.length) > 0
    ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100) : 0;
  const totalConversion = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;
  const wonTotal = wonLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  // Weekly bar chart (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const count = leads.filter(l => {
        const d = new Date(l.created_at);
        return d >= start && d < end;
      }).length;
      weeks.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }
    return weeks;
  }, [leads]);
  const maxWeekly = Math.max(...weeklyData.map(w => w.count), 1);

  const statCard = (label: string, value: string, sub?: string, color?: string) => (
    <div style={ov.statCard}>
      <div style={ov.statLabel}>{label}</div>
      <div style={{ ...ov.statValue, ...(color ? { color } : {}) }}>{value}</div>
      {sub && <div style={ov.statSub}>{sub}</div>}
    </div>
  );

  return (
    <div style={ov.grid}>
      {statCard('Total Leads', leads.length.toString())}
      {statCard('This Month', thisMonth.length.toString(),
        monthChange > 0 ? `+${monthChange}% vs last month` : monthChange < 0 ? `${monthChange}% vs last month` : 'Same as last month',
        monthChange >= 0 ? '#4ade80' : '#f87171')}
      {statCard('Conversion (Won/Lost)', `${conversionRate}%`, `${wonLeads.length} won / ${lostLeads.length} lost`)}
      {statCard('Total Won Value', formatCurrencyDirect(wonTotal), `${totalConversion}% of all leads`, '#4ade80')}

      {/* Weekly chart */}
      <div style={{ ...ov.statCard, gridColumn: 'span 2' }}>
        <div style={ov.statLabel}>Leads per week (last 8 weeks)</div>
        <div style={ov.chart}>
          {weeklyData.map((w, i) => (
            <div key={i} style={ov.barCol}>
              <div style={ov.barWrap}>
                <div style={{ ...ov.bar, height: `${(w.count / maxWeekly) * 100}%`, background: w.count > 0 ? '#60a5fa' : 'rgba(100,160,240,0.1)' }} />
              </div>
              <div style={ov.barLabel}>{w.count}</div>
              <div style={ov.barDate}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatCurrencyDirect(v: number) {
  if (v === 0) return '$0';
  return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// ════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════

const s: Record<string, React.CSSProperties> = {
  loading: { padding: 48, color: '#7c8aa8', fontSize: 14 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heading: { margin: 0, fontSize: 22, fontWeight: 600, color: '#f0f4ff' },
  sub: { margin: '4px 0 0', fontSize: 13, color: '#7c8aa8', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const },
  unreadBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' },
  headerActions: { display: 'flex', gap: 8, alignItems: 'center' },
  viewToggle: { display: 'flex', borderRadius: 6, border: '1px solid rgba(100,160,240,0.12)', overflow: 'hidden' },
  viewBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: '#7c8aa8', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 150ms' },
  viewBtnActive: { color: '#e2e8f0', background: 'rgba(100,160,240,0.12)' },
  exportBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#94a3b8', background: 'rgba(100,160,240,0.08)', border: '1px solid rgba(100,160,240,0.12)', cursor: 'pointer' },
  followUpBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', marginBottom: 16, borderRadius: 8, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', flexWrap: 'wrap' as const },
  followUpChip: { display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: '#e2e8f0', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)', cursor: 'pointer' },
  followUpDot: { display: 'inline-block', width: 6, height: 6, borderRadius: 3, background: '#fbbf24', marginRight: 5, verticalAlign: 'middle', flexShrink: 0 },
  toolbar: { marginBottom: 16, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  searchWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 8, background: 'rgba(14,22,42,0.5)', border: '1px solid rgba(100,160,240,0.1)' },
  searchInput: { flex: 1, padding: '10px 10px', border: 'none', outline: 'none', background: 'transparent', color: '#e2e8f0', fontSize: 13 },
  searchClear: { background: 'none', border: 'none', color: '#5a6a84', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 },
  toolbarRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 },
  tabs: { display: 'flex', gap: 4, flexWrap: 'wrap' as const },
  tab: { padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#7c8aa8', background: 'transparent', border: '1px solid rgba(100,160,240,0.08)', cursor: 'pointer', transition: 'all 150ms' },
  tabActive: { color: '#e2e8f0', background: 'rgba(100,160,240,0.12)', border: '1px solid rgba(100,160,240,0.2)' },
  tabCount: { display: 'inline-block', marginLeft: 5, padding: '0 5px', borderRadius: 999, fontSize: 10, fontWeight: 600, background: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  toolbarRight: { display: 'flex', gap: 8, alignItems: 'center' },
  sortBtn: { padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#7c8aa8', background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.08)', cursor: 'pointer' },
  bulkDeleteBtn: { padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' },
  empty: { padding: '64px 24px', textAlign: 'center', borderRadius: 10, background: 'rgba(14,22,42,0.5)', border: '1px dashed rgba(100,160,240,0.12)' },
  emptyTitle: { margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  emptySub: { margin: 0, fontSize: 13, color: '#7c8aa8' },
  list: { display: 'flex', flexDirection: 'column' as const, gap: 2 },
  tableHeader: { display: 'flex', alignItems: 'center', padding: '8px 14px', fontSize: 11, fontWeight: 600, color: '#5a6a84', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid rgba(100,160,240,0.08)' },
  thCheck: { width: 32, flexShrink: 0 }, thStar: { width: 30, flexShrink: 0 }, thName: { flex: '0 0 180px', minWidth: 0 }, thMessage: { flex: '0 0 180px', minWidth: 0 }, thTags: { flex: '0 0 120px' }, thStatus: { flex: '0 0 80px' }, thDate: { flex: '0 0 120px' }, thActions: { flex: '0 0 60px', textAlign: 'right' as const },
  row: { padding: '10px 14px', borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(100,160,240,0.04)', background: 'rgba(14,22,42,0.3)', transition: 'background 150ms, border-color 150ms' },
  rowHover: { background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.1)' },
  rowExpanded: { background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.1)' },
  rowMain: { display: 'flex', alignItems: 'center', gap: 0 },
  rCheck: { width: 32, flexShrink: 0, display: 'flex', alignItems: 'center' },
  rStar: { width: 30, flexShrink: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '2px 0' },
  rName: { flex: '0 0 180px', minWidth: 0 },
  rMessage: { flex: '0 0 180px', minWidth: 0, fontSize: 13, color: '#7c8aa8', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  rTags: { flex: '0 0 120px', display: 'flex', gap: 3, flexWrap: 'wrap' as const },
  rStatus: { flex: '0 0 80px' },
  rDate: { flex: '0 0 120px', fontSize: 12, color: '#5a6a84', whiteSpace: 'nowrap' as const },
  rActions: { flex: '0 0 60px', display: 'flex', gap: 4, justifyContent: 'flex-end' },
  dot: { display: 'inline-block', width: 7, height: 7, borderRadius: 4, background: '#579dff', marginRight: 6, verticalAlign: 'middle', flexShrink: 0 },
  name: { fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' },
  email: { fontSize: 12, color: '#5a6a84', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 },
  checkbox: { width: 14, height: 14, accentColor: '#579dff', cursor: 'pointer' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 },
  tagChip: { display: 'inline-block', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 500, color: '#a5b4cc', background: 'rgba(100,160,240,0.08)', border: '1px solid rgba(100,160,240,0.1)' },
  tagChipSm: { display: 'inline-block', padding: '1px 5px', borderRadius: 3, fontSize: 9, fontWeight: 500, color: '#8896ab', background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.08)' },
  actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 5, background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.08)', color: '#7c8aa8', cursor: 'pointer', padding: 0 },
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '12px 0', borderTop: '1px solid rgba(100,160,240,0.08)' },
  pageInfo: { fontSize: 12, color: '#5a6a84' },
  pageBtns: { display: 'flex', gap: 6 },
  pageBtn: { padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, color: '#94a3b8', background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.1)', cursor: 'pointer' },
  pipeline: { display: 'flex', gap: 12, overflowX: 'auto' as const, paddingBottom: 8, minHeight: 400 },
  col: { flex: '1 1 0', minWidth: 200, background: 'rgba(14,22,42,0.3)', borderRadius: 8, border: '1px solid rgba(100,160,240,0.06)', display: 'flex', flexDirection: 'column' as const, transition: 'border-color 150ms' },
  colOver: { border: '1px solid rgba(87,157,255,0.3)', background: 'rgba(87,157,255,0.04)' },
  colHeader: { padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(100,160,240,0.06)' },
  colTitle: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  colCount: { fontSize: 11, fontWeight: 600, color: '#7c8aa8', background: 'rgba(100,160,240,0.08)', padding: '1px 7px', borderRadius: 999 },
  colTotal: { fontSize: 12, fontWeight: 600, color: '#4ade80' },
  colCards: { padding: 8, display: 'flex', flexDirection: 'column' as const, gap: 6, flex: 1, minHeight: 100 },
  colEmpty: { padding: 24, textAlign: 'center', fontSize: 12, color: '#5a6a84', fontStyle: 'italic' as const },
  card: { padding: '10px 12px', borderRadius: 6, background: 'rgba(20,30,50,0.7)', border: '1px solid rgba(100,160,240,0.08)', cursor: 'grab', transition: 'all 150ms' },
  cardDragging: { opacity: 0.5, transform: 'rotate(2deg)' },
  cardExpanded: { border: '1px solid rgba(87,157,255,0.3)', boxShadow: '0 0 12px rgba(87,157,255,0.1)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardStar: { cursor: 'pointer', padding: 2, flexShrink: 0 },
  cardEmail: { fontSize: 11, color: '#5a6a84', marginTop: 2, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  cardPreview: { fontSize: 12, color: '#7c8aa8', marginTop: 6, lineHeight: 1.4, display: '-webkit-box' as any, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' },
  cardValue: { fontSize: 13, fontWeight: 600, color: '#4ade80', marginTop: 6 },
  cardTags: { display: 'flex', gap: 3, flexWrap: 'wrap' as const, marginTop: 6 },
  pipelineDetailOverlay: { position: 'fixed' as const, inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
  pipelineDetailCard: { width: '90%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto' as const, background: 'rgba(14,22,42,0.95)', borderRadius: 12, border: '1px solid rgba(100,160,240,0.12)', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  pipelineDetailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.08)', color: '#7c8aa8', fontSize: 18, cursor: 'pointer', padding: 0 },
};

const d: Record<string, React.CSSProperties> = {
  expanded: { display: 'flex', flexDirection: 'column' as const, gap: 14 },
  tabBar: { display: 'flex', gap: 4, borderBottom: '1px solid rgba(100,160,240,0.08)', paddingBottom: 8 },
  tab: { padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500, color: '#7c8aa8', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 },
  tabActive: { color: '#e2e8f0', background: 'rgba(100,160,240,0.1)' },
  tabBadge: { fontSize: 10, fontWeight: 600, color: '#60a5fa', background: 'rgba(59,130,246,0.15)', padding: '1px 6px', borderRadius: 999 },
  section: {},
  label: { fontSize: 11, fontWeight: 600, color: '#5a6a84', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 },
  messageText: { margin: 0, fontSize: 14, color: '#c8d2e0', lineHeight: 1.65, whiteSpace: 'pre-wrap' as const },
  row: { display: 'flex', gap: 6, flexWrap: 'wrap' as const },
  btn: { padding: '5px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500, color: '#7c8aa8', background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.1)', cursor: 'pointer', transition: 'all 150ms' },
  tagsWrap: { display: 'flex', gap: 6, flexWrap: 'wrap' as const, alignItems: 'center' },
  tagChip: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, color: '#a5b4cc', background: 'rgba(100,160,240,0.08)', border: '1px solid rgba(100,160,240,0.12)' },
  tagRemove: { background: 'none', border: 'none', color: '#5a6a84', fontSize: 14, cursor: 'pointer', padding: 0, lineHeight: 1 },
  tagInput: { padding: '4px 8px', borderRadius: 4, fontSize: 12, color: '#e2e8f0', background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.1)', outline: 'none', width: 100 },
  valueDisplay: { padding: '8px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600, color: '#4ade80', background: 'rgba(100,160,240,0.04)', border: '1px solid rgba(100,160,240,0.08)', cursor: 'pointer' },
  valueInput: { padding: '6px 10px', borderRadius: 6, fontSize: 14, fontWeight: 600, color: '#e2e8f0', background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.15)', outline: 'none', width: 120 },
  notesDisplay: { padding: '10px 12px', borderRadius: 6, fontSize: 13, color: '#c8d2e0', lineHeight: 1.5, background: 'rgba(100,160,240,0.04)', border: '1px solid rgba(100,160,240,0.08)', cursor: 'pointer', minHeight: 40, whiteSpace: 'pre-wrap' as const },
  notesInput: { width: '100%', padding: '10px 12px', borderRadius: 6, fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, resize: 'vertical' as const, minHeight: 60, background: 'rgba(14,22,42,0.6)', border: '1px solid rgba(100,160,240,0.15)', outline: 'none', fontFamily: 'inherit' },
  saveBtn: { marginTop: 6, padding: '5px 14px', borderRadius: 5, fontSize: 12, fontWeight: 600, color: '#e2e8f0', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer' },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, color: '#94a3b8', background: 'rgba(100,160,240,0.06)', border: '1px solid rgba(100,160,240,0.1)', cursor: 'pointer' },
  activitySection: { minHeight: 100 },
  timeline: { display: 'flex', flexDirection: 'column' as const, gap: 0, paddingLeft: 4 },
  timelineItem: { position: 'relative' as const, paddingLeft: 20, paddingBottom: 16 },
  timelineDot: { position: 'absolute' as const, left: 0, top: 4, width: 8, height: 8, borderRadius: 4, zIndex: 1 },
  timelineLine: { position: 'absolute' as const, left: 3, top: 12, bottom: 0, width: 2, background: 'rgba(100,160,240,0.1)' },
  timelineContent: {},
  timelineDesc: { fontSize: 13, color: '#c8d2e0', lineHeight: 1.4 },
  timelineTime: { fontSize: 11, color: '#5a6a84', marginTop: 2 },
};

const ov: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  statCard: { padding: '20px 18px', borderRadius: 10, background: 'rgba(14,22,42,0.5)', border: '1px solid rgba(100,160,240,0.08)' },
  statLabel: { fontSize: 12, fontWeight: 600, color: '#7c8aa8', textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#f0f4ff', lineHeight: 1.1 },
  statSub: { fontSize: 12, color: '#5a6a84', marginTop: 6 },
  chart: { display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, marginTop: 12 },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 },
  barWrap: { width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: 3, minHeight: 2, transition: 'height 300ms' },
  barLabel: { fontSize: 11, fontWeight: 600, color: '#e2e8f0' },
  barDate: { fontSize: 9, color: '#5a6a84', textAlign: 'center' as const },
};
